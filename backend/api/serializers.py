from rest_framework import serializers
from .models import User, Product, Order, OrderItem, ShippingAddress

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model=User
        fields=['id','username','email','phone','password']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)

class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model=Product
        fields=['id','name', 'price', 'digital', 'image']

class OrderItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    get_total = serializers.ReadOnlyField()
    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'quantity', 'get_total']

class ShippingAddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = ShippingAddress
        exclude = ['customer', 'order'] # Exclude fields we don't need to show

# --- THIS IS THE CORRECTED ORDER SERIALIZER ---
class OrderSerializer(serializers.ModelSerializer):
    orderitems = OrderItemSerializer(many=True, read_only=True, source='orderitem_set')
    shipping_address = serializers.SerializerMethodField()
    customer = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = Order
        fields = [
            'id', 'customer', 'date_ordered', 'completed', 'transaction_id',
            'shipping', 'get_cart_total', 'get_cart_items',
            'shipping_address', 'orderitems',
        ]

    def get_shipping_address(self, obj):
        # An order can have multiple shipping addresses based on your models.
        # This safely gets the first one.
        try:
            address = obj.shippingaddress_set.first()
            return ShippingAddressSerializer(address).data
        except:
            return None