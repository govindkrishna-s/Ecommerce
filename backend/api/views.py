from django.shortcuts import render, get_object_or_404
from rest_framework.generics import ListAPIView, RetrieveAPIView, CreateAPIView, ListCreateAPIView
from rest_framework import permissions, status, filters
from rest_framework.views import APIView
from rest_framework.response import Response
from api.models import User,Product, Order, OrderItem, ShippingAddress, WishlistItem, Banner
from api.serializers import ProductSerializer, OrderSerializer, UserSerializer, WishlistItemSerializer, BannerSerializer
import razorpay
from django.conf import settings
from django.db import transaction
from rest_framework.decorators import api_view, permission_classes
from django.views.decorators.cache import cache_page
from django.utils.decorators import method_decorator

razorpay_client = razorpay.Client(
    auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET)
)

class SignUpView(CreateAPIView):
    serializer_class=UserSerializer

@method_decorator(cache_page(60 * 60), name='dispatch')
class ProductListView(ListAPIView):
    queryset=Product.objects.all()
    serializer_class=ProductSerializer
    permission_classes=[permissions.AllowAny]

    filter_backends = [filters.SearchFilter]
    search_fields = ['name']

class ProductDetailView(RetrieveAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [permissions.AllowAny]

class OrderListView(ListAPIView):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):

        user = self.request.user
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

        user = request.user 
        
        try:

            order = Order.objects.get(customer=user, completed=False)
        except Order.DoesNotExist:
            return Response({'error': 'No active order to process.'}, status=status.HTTP_404_NOT_FOUND)

        shipping_info = request.data.get('shipping')
        if not shipping_info:
            return Response({'error': 'Shipping information is required.'}, status=status.HTTP_400_BAD_REQUEST)

        order.completed = True
        order.save()

        ShippingAddress.objects.create(
            customer=user,
            order=order,
            address=shipping_info.get('address'),
            city=shipping_info.get('city'),
            state=shipping_info.get('state'),
            zipcode=shipping_info.get('zipcode'),
        )


        serializer = OrderSerializer(order)
        return Response(serializer.data, status=status.HTTP_200_OK)

    
@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def start_payment(request):

    user = request.user
    data = request.data


    try:
        order = Order.objects.get(customer=user, completed=False)
        cart_total = order.get_cart_total
    except Order.DoesNotExist:
        return Response({"error": "No active cart found."}, status=status.HTTP_404_NOT_FOUND)

    amount_in_paise = int(cart_total * 100)

    try:
        razorpay_order = razorpay_client.order.create({
            "amount": amount_in_paise,
            "currency": "INR",
            "receipt": f"order_rcptid_{order.id}",
            "payment_capture": "1" 
        })


        order.razorpay_order_id = razorpay_order['id']
        order.save()


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



@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def handle_payment_success(request):

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

 
        razorpay_client.utility.verify_payment_signature(params_dict)

        with transaction.atomic():
            order = Order.objects.get(razorpay_order_id=razorpay_order_id)
            order.transaction_id = razorpay_payment_id
            order.completed = True
            order.save()

   
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

class WishlistListView(ListAPIView):
    serializer_class = WishlistItemSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return WishlistItem.objects.filter(user=self.request.user).order_by('-added_at')


class WishlistAddView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        product_id = request.data.get('product_id')
        if not product_id:
            return Response({"error": "Product ID is required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            product = Product.objects.get(id=product_id)
 
            wishlist_item, created = WishlistItem.objects.get_or_create(user=request.user, product=product)
            if created:
                return Response({"status": "success", "message": "Item added to wishlist."}, status=status.HTTP_201_CREATED)
            else:
                return Response({"status": "success", "message": "Item is already in wishlist."}, status=status.HTTP_200_OK)
        except Product.DoesNotExist:
            return Response({"error": "Product not found."}, status=status.HTTP_404_NOT_FOUND)


class WishlistRemoveView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        product_id = request.data.get('product_id')
        if not product_id:
            return Response({"error": "Product ID is required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            wishlist_item = WishlistItem.objects.get(user=request.user, product_id=product_id)
            wishlist_item.delete()
            return Response({"status": "success", "message": "Item removed from wishlist."}, status=status.HTTP_200_OK)
        except WishlistItem.DoesNotExist:
            return Response({"error": "Item not found in wishlist."}, status=status.HTTP_404_NOT_FOUND)
        
@api_view(['GET'])
@cache_page(60 * 60)
def get_homepage_banner(request):
    try:
        banner = Banner.objects.get(name="homepage-banner")
        serializer = BannerSerializer(banner)
        return Response(serializer.data)
    except Banner.DoesNotExist:
        return Response({"error": "Homepage banner not found in database."}, status=404)