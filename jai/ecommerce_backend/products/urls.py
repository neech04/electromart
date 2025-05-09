from django.urls import path
from .views import (
    api_root, get_products, get_products_by_category, get_product_by_id, register, login_view, 
    logout_view, admin_login, add_product, update_product, get_orders, update_order_status, 
    delete_product, create_order  # ✅ Added create_order
)

urlpatterns = [
    path('api/', api_root, name='api_root'),
    path('api/products/', get_products, name='get_products'),
    path('api/products/<int:product_id>/', get_product_by_id, name='get_product_by_id'),
    path('api/products/category/<str:category>/', get_products_by_category, name='get_products_by_category'),
    path('api/auth/register/', register, name='register'),
    path('api/auth/login/', login_view, name='login'),
    path('api/auth/logout/', logout_view, name='logout'),
    path('api/admin/login/', admin_login, name='admin_login'),
    path('api/admin/products/add/', add_product, name='add_product'),
    path('api/admin/products/update/<int:product_id>/', update_product, name='update_product'),
    path('api/admin/products/delete/<int:product_id>/', delete_product, name='delete_product'),
    
    # ✅ Orders
    path('api/orders/create/', create_order, name='create_order'),  # ✅ New Route for Order Creation
    path('api/admin/orders/', get_orders, name='get_orders'),
    path('api/admin/orders/update/<int:order_id>/', update_order_status, name='update_order_status'),
]
