from django.db import models
from django.contrib.auth.models import AbstractUser
from cloudinary.models import CloudinaryField
import cloudinary

class User(AbstractUser):
    phone=models.CharField(max_length=15)

class Product(models.Model):
    name=models.CharField(max_length=200, null=True)
    price=models.DecimalField(max_digits=7, decimal_places=2)
    digital=models.BooleanField(default=False, null=True, blank=False)
    image=CloudinaryField('image',null=True,blank=True)
    def __str__(self):
        return self.name
    @property
    def imageURL(self):
        if self.image and hasattr(self.image, 'url'):
            try:
                optimized_url = cloudinary.CloudinaryImage(self.image.public_id).build_url(
                    transformation=[
                        {'width': 800, 'height': 800, 'crop': 'limit'},
                        {'quality': 'auto'},
                        {'fetch_format': 'auto'}
                    ]
                )
                return optimized_url
            except Exception as e:
                print(f"Error generating optimized URL: {e}")
                return self.image.url
        else:
            return ""

class Order(models.Model):
    customer = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True) 
    date_ordered = models.DateTimeField(auto_now_add=True)
    completed=models.BooleanField(default=False, null=True, blank=False)
    transaction_id=models.CharField(max_length=200, null=True)
    razorpay_order_id = models.CharField(max_length=200, null=True, blank=True)

    def __str__(self):
        return str(self.id)
    
    @property
    def shipping(self):
        shipping = False
        orderitems=self.orderitem_set.all()
        for i in orderitems:
            if i.product.digital==False:
                shipping = True
        return shipping
    
    @property
    def get_cart_total(self):
        orderitems=self.orderitem_set.all()
        total=sum(item.get_total for item in orderitems)
        return total
    @property
    def get_cart_items(self):
        orderitems=self.orderitem_set.all()
        total=sum(item.quantity for item in orderitems)
        return total

    
class OrderItem(models.Model):
    product=models.ForeignKey(Product, on_delete=models.SET_NULL, null=True, blank=True)
    order=models.ForeignKey(Order, on_delete=models.SET_NULL, null=True, blank=True)
    quantity=models.IntegerField(default=0, null=True, blank=True)
    date_added=models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['date_added']

    @property
    def get_total(self):
        total=self.product.price*self.quantity
        return total

class ShippingAddress(models.Model):
    customer=models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    order=models.ForeignKey(Order, on_delete=models.SET_NULL, null=True, blank=True)
    address=models.CharField(max_length=200, null=True)
    city=models.CharField(max_length=200, null=True)
    state=models.CharField(max_length=200, null=True)
    zipcode=models.CharField(max_length=200, null=True)
    date_added=models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.address
    
class WishlistItem(models.Model):

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    added_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'product')

    def __str__(self):
        return f'{self.user.username} wishes for {self.product.name}'
    
class Banner(models.Model):

    name = models.CharField(max_length=100, unique=True, help_text="homepage-banner")
    image = CloudinaryField('banner_image')
    alt_text = models.CharField(max_length=200, default="E-commerce banner")

    def __str__(self):
        return self.name
    
    @property
    def imageURL(self):
        if self.image and hasattr(self.image, 'url'):
            try:
                optimized_url = cloudinary.CloudinaryImage(self.image.public_id).build_url(
                    transformation=[
                        {'width': 1920, 'crop': 'limit'},
                        {'quality': 'auto'},
                        {'fetch_format': 'auto'}
                    ]
                )
                return optimized_url
            except Exception:
                return self.image.url
        return ""
