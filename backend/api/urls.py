from django.urls import path
from . import views

urlpatterns = [
    path('register/',views.SignUpView.as_view(),name='register'),
    path('products/', views.ProductListView.as_view(), name='api_product_list'),
    path('products/<int:pk>/', views.ProductDetailView.as_view(), name='api_product_detail'),
    path('orders/',views.OrderListView.as_view(),name='orders'),
    path('cart/', views.CartDetailView.as_view(), name='api_cart_detail'),
    path('cart/update/', views.UpdateCartView.as_view(), name='api_cart_update'),
    path('process-order/', views.ProcessOrderView.as_view(), name='api_process_order'),
    path('payment/start/', views.start_payment, name='start-payment'),
    path('payment/success/', views.handle_payment_success, name='handle-payment-success'),
]