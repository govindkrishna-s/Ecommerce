from rest_framework import serializers
from .models import User, Product, Order, OrderItem, ShippingAddress, WishlistItem, Banner

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model=User
        fields=['id','username','email','phone','password']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)

class ProductSerializer(serializers.ModelSerializer):
    image = serializers.CharField(source='imageURL', read_only=True)
    class Meta:
        model=Product
        fields=['id','name', 'price', 'digital', 'image']

class OrderItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    get_total = serializers.ReadOnlyField()
    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'quantity', 'get_total']

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        if not instance.product:
            representation['product'] = {
                'id': None,
                'name': '[Product no longer available]',
                'price': '0.00',
                'digital': False,
                'image': None
            }
        return representation

class ShippingAddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = ShippingAddress
        exclude = ['customer', 'order']


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

        try:
            address = obj.shippingaddress_set.first()
            return ShippingAddressSerializer(address).data
        except:
            return None
        
class WishlistItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    
    class Meta:
        model = WishlistItem
        fields = ['id', 'product']

class BannerSerializer(serializers.ModelSerializer):
    image_url = serializers.CharField(source='imageURL', read_only=True)
    class Meta:
        model = Banner
        fields = ['name', 'image_url', 'alt_text']