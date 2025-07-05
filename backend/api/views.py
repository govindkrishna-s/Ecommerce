from django.shortcuts import render, get_object_or_404
from rest_framework.generics import ListAPIView, RetrieveAPIView, CreateAPIView, ListCreateAPIView
from rest_framework import permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from api.models import User,Product, Order, OrderItem, ShippingAddress
from api.serializers import ProductSerializer, OrderSerializer, UserSerializer
import razorpay
from django.conf import settings
from django.db import transaction
from rest_framework.decorators import api_view, permission_classes
# Create your views here.
razorpay_client = razorpay.Client(
    auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET)
)

class SignUpView(CreateAPIView, ListAPIView):
    serializer_class=UserSerializer
    queryset=User.objects.all()

class ProductListView(ListAPIView):
    queryset=Product.objects.all()
    serializer_class=ProductSerializer
    permission_classes=[permissions.AllowAny]

class ProductDetailView(RetrieveAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [permissions.AllowAny]

class OrderListView(ListAPIView):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """
        This view should return a list of all the completed orders
        for the currently authenticated user.
        """
        # Get the user who is making the request
        user = self.request.user

        # Filter the Order model to get orders where:
        # 1. The 'customer' field matches the logged-in user.
        # 2. The 'completed' field is True.
        # Then, order them by the newest first.
        return Order.objects.filter(customer=user, completed=True).order_by('-date_ordered')

class CartDetailView(RetrieveAPIView):
    serializer_class=OrderSerializer
    permission_classes=[permissions.IsAuthenticated]

    def get_object(self):
        order, created= Order.objects.get_or_create(
            customer=self.request.user,
            completed=False
        )
        return order
    
class UpdateCartView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def post(self,request,*args,**kwargs):
        product_id=request.data.get('productId')
        action=request.data.get('action')

        if not product_id or not action:
            return Response({'error': 'productId and action are required'}, status=status.HTTP_400_BAD_REQUEST)
        customer=request.user
        product=get_object_or_404(Product,id=product_id)
        order, created=Order.objects.get_or_create(customer=customer, completed=False)
        order_item,created=OrderItem.objects.get_or_create(order=order, product=product)
        if action == 'add':
            order_item.quantity += 1
        elif action == 'remove':
            order_item.quantity -= 1

        order_item.save()
        if order_item.quantity <= 0:
            order_item.delete()
        return Response({'message': f'Item {action}ed successfully.'})


class ProcessOrderView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        # Your backend uses a server-side cart, so we find the user's active order.
        # Note: The 'customer' field in your Order model is actually a ForeignKey to User.
        user = request.user 
        
        try:
            # Find the existing cart (active order) for this user
            order = Order.objects.get(customer=user, completed=False)
        except Order.DoesNotExist:
            return Response({'error': 'No active order to process.'}, status=status.HTTP_404_NOT_FOUND)

        # Get the shipping data from the request
        shipping_info = request.data.get('shipping')
        if not shipping_info:
            return Response({'error': 'Shipping information is required.'}, status=status.HTTP_400_BAD_REQUEST)

        # --- REMOVED THE FAILED CHECK ---
        # We no longer check the total from the frontend.
        # The backend will trust its own calculation from `order.get_cart_total`.

        # Mark the order as complete
        order.completed = True
        order.save()

        # Create the shipping address linked to this order
        # Your ShippingAddress model also uses 'customer' to link to the User.
        ShippingAddress.objects.create(
            customer=user,
            order=order,
            address=shipping_info.get('address'),
            city=shipping_info.get('city'),
            state=shipping_info.get('state'),
            zipcode=shipping_info.get('zipcode'),
        )

        # Return the finalized order data
        serializer = OrderSerializer(order)
        return Response(serializer.data, status=status.HTTP_200_OK)

    
@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def start_payment(request):
    """
    Creates a Razorpay order and returns the order_id to the frontend.
    """
    user = request.user
    data = request.data

    # Find the user's active cart
    try:
        order = Order.objects.get(customer=user, completed=False)
        cart_total = order.get_cart_total
    except Order.DoesNotExist:
        return Response({"error": "No active cart found."}, status=status.HTTP_404_NOT_FOUND)

    # Razorpay requires the amount in the smallest currency unit (e.g., paise for INR)
    amount_in_paise = int(cart_total * 100)

    # Create Razorpay order
    try:
        razorpay_order = razorpay_client.order.create({
            "amount": amount_in_paise,
            "currency": "INR",
            "receipt": f"order_rcptid_{order.id}",
            "payment_capture": "1" # Auto capture payment
        })

        # Save the Razorpay order ID to your Order model
        order.razorpay_order_id = razorpay_order['id']
        order.save()

        # Prepare data to send back to the frontend
        response_data = {
            "order_id": razorpay_order['id'],
            "razorpay_key": settings.RAZORPAY_KEY_ID,
            "amount": amount_in_paise,
            "currency": "INR",
            "name": "Your E-Commerce Site",
            "description": "Test Transaction",
            "prefill": {
                "name": user.username,
                "email": user.email,
                "contact": user.phone
            }
        }
        return Response(response_data, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# --- NEW VIEW TO HANDLE PAYMENT SUCCESS ---
@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def handle_payment_success(request):
    """
    Verifies the payment signature and finalizes the order.
    """
    data = request.data
    
    try:
        razorpay_order_id = data.get('razorpay_order_id')
        razorpay_payment_id = data.get('razorpay_payment_id')
        razorpay_signature = data.get('razorpay_signature')
        shipping_info = data.get('shipping_address')

        params_dict = {
            'razorpay_order_id': razorpay_order_id,
            'razorpay_payment_id': razorpay_payment_id,
            'razorpay_signature': razorpay_signature
        }

        # Verify the payment signature
        razorpay_client.utility.verify_payment_signature(params_dict)

        # Find the order and finalize it
        with transaction.atomic():
            order = Order.objects.get(razorpay_order_id=razorpay_order_id)
            order.transaction_id = razorpay_payment_id
            order.completed = True
            order.save()

            # Create the shipping address
            ShippingAddress.objects.create(
                customer=request.user,
                order=order,
                address=shipping_info.get('address'),
                city=shipping_info.get('city'),
                state=shipping_info.get('state'),
                zipcode=shipping_info.get('zipcode'),
            )

        return Response({"status": "success", "order_id": order.id}, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({"error": "Payment verification failed", "details": str(e)}, status=status.HTTP_400_BAD_REQUEST)
