from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.contrib.auth import authenticate, login, logout, get_user_model
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.authtoken.models import Token
import logging
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
import json
from .models import Order, OrderItem 
from decimal import Decimal

from products.utils import get_product_by_id



from .models import Product, Order
from .serializers import ProductSerializer, UserSerializer, OrderSerializer

User = get_user_model()

# ✅ Helper function to check admin status
def is_admin(user):
    """Check if a user is an admin (staff user)."""
    return user.is_authenticated and user.is_staff


# ✅ Fetch product by ID
@api_view(["GET"])
@permission_classes([AllowAny])
def get_product_by_id(request, product_id):
    """Fetch a single product by its ID."""
    product = get_object_or_404(Product, id=product_id)
    serializer = ProductSerializer(product)
    return Response(serializer.data, status=status.HTTP_200_OK)


# ✅ Fetch all products
@api_view(["GET"])
@permission_classes([AllowAny])
def get_products(request):
    """Fetch all products."""
    products = Product.objects.all()
    serializer = ProductSerializer(products, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


# ✅ API Root
@api_view(["GET"])
def api_root(request):
    """API root endpoint with available routes."""
    return Response({
        "products": "/api/products/",
        "products_by_category": "/api/products/category/<category_name>/",
        "register": "/api/auth/register/",
        "login": "/api/auth/login/",
        "logout": "/api/auth/logout/",
        "add_product": "/api/admin/products/add/",
        "update_product": "/api/admin/products/update/<product_id>/",
        "delete_product": "/api/admin/products/delete/<product_id>/",
        "orders": "/api/admin/orders/",
        "update_order_status": "/api/admin/orders/update/<order_id>/"
    }, status=status.HTTP_200_OK)


# ✅ Fetch products by category
@api_view(["GET"])
@permission_classes([AllowAny])
def get_products_by_category(request, category):
    """Fetch products by category."""
    products = Product.objects.filter(category=category)
    if not products.exists():
        return Response({"error": "No products found in this category"}, status=status.HTTP_404_NOT_FOUND)
    serializer = ProductSerializer(products, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


# ✅ Update Order Status
@api_view(["PUT"])
def update_order_status(request, order_id):
    """Update the status of an order."""
    order = get_object_or_404(Order, id=order_id)
    new_status = request.data.get("status")
    if new_status not in ["Pending", "Shipped", "Delivered"]:
        return Response({"error": "Invalid status"}, status=status.HTTP_400_BAD_REQUEST)
    order.status = new_status
    order.save()
    return Response({"message": "Order status updated successfully"}, status=status.HTTP_200_OK)


@api_view(["POST"])
@permission_classes([AllowAny])
def register(request):
    """Register a new user with raw password storage."""
    username = request.data.get("username")
    email = request.data.get("email")
    password = request.data.get("password")

    if not username or not email or not password:
        return Response({"error": "All fields are required"}, status=400)

    if User.objects.filter(username=username).exists():
        return Response({"error": "Username exists"}, status=400)

    if User.objects.filter(email=email).exists():
        return Response({"error": "Email exists"}, status=400)

    try:
        user = User.objects.create_user(
            username=username,
            email=email,
            password=password
        )
        
        return Response({
            "message": "User created",
            "user": {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "role": user.role
            }
        }, status=201)
        
    except Exception as e:
        return Response({"error": str(e)}, status=400)


# ✅ User Login (Supports both Email and Username)
@api_view(["POST"])
@permission_classes([AllowAny])
def login_view(request):
    """User login with username or email."""
    identifier = request.data.get("identifier")  # Can be username or email
    password = request.data.get("password")

    if not identifier or not password:
        return Response({"error": "Username/Email and Password are required"}, status=status.HTTP_400_BAD_REQUEST)

    user = authenticate(username=identifier, password=password)

    if user is None:
        try:
            user = User.objects.get(email=identifier)
            if not user.check_password(password):
                return Response({"error": "Invalid credentials"}, status=status.HTTP_400_BAD_REQUEST)
        except User.DoesNotExist:
            return Response({"error": "Invalid credentials"}, status=status.HTTP_400_BAD_REQUEST)

    login(request, user)
    token, _ = Token.objects.get_or_create(user=user)
    return Response({"message": "Login successful", "token": token.key, "user": UserSerializer(user).data}, status=status.HTTP_200_OK)


# ✅ User Logout
@api_view(["POST"])
@permission_classes([AllowAny])
def logout_view(request):
    """Logout the current user."""
    Token.objects.filter(user=request.user).delete()
    logout(request)
    return Response({"message": "Logout successful"}, status=status.HTTP_200_OK)


# ✅ Admin Login
@api_view(["POST"])
@permission_classes([AllowAny])
def admin_login(request):
    """Admin-specific login."""
    username = request.data.get("username")
    password = request.data.get("password")

    user = authenticate(username=username, password=password)

    if user and is_admin(user):
        login(request, user)
        token, _ = Token.objects.get_or_create(user=user)
        return Response({"token": token.key, "message": "Admin login successful"}, status=status.HTTP_200_OK)

    return Response({"error": "Invalid credentials or not an admin"}, status=status.HTTP_400_BAD_REQUEST)


# ✅ Add Product
@api_view(["POST"])
def add_product(request):
    """Add a new product."""
    serializer = ProductSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response({"message": "Product added successfully", "product": serializer.data}, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

logger = logging.getLogger(__name__)# ✅ Update Product
@api_view(["PUT"])
def update_product(request, product_id):
    """Update a product."""
    product = get_object_or_404(Product, id=product_id)
    
    # Log the incoming request data
    logger.info(f"Incoming request data: {request.data}")
    
    serializer = ProductSerializer(product, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response({"message": "Product updated successfully", "product": serializer.data})
    
    # Log validation errors
    logger.error(f"Validation errors: {serializer.errors}")
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ✅ Delete Product
@api_view(["DELETE"])
def delete_product(request, product_id):
    """Delete a product."""
    product = get_object_or_404(Product, id=product_id)
    product.delete()
    return Response({"message": "Product deleted successfully"}, status=status.HTTP_204_NO_CONTENT)

import traceback 
@csrf_exempt
@api_view(["POST"])
@permission_classes([AllowAny])
def create_order(request):
    try:
        data = json.loads(request.body)
        logger.info(f"📥 Received Order Data: {data}")

        if "items" not in data or not data["items"]:
            return JsonResponse({"error": "Order has no product."}, status=400)

        # Get user information
        user = request.user if request.user.is_authenticated else None
        
        # Determine fields with proper fallbacks
        email = (
            data.get('customer_email') or
            (user.email if user else None) or
            data.get('email') or
            ''
        )
        
        address = data.get('customer_address', '')  # Get address from request data

        # Create order with all fields including address
        order = Order.objects.create(
            status="Pending", 
            total_price=0,
            customer=user,
            customer_name=data.get('customer_name', user.get_full_name() if user else 'Guest'),
            customer_email=email,
            customer_address=address  # Add address to order creation
        )
        logger.info(f"🛒 Created Order ID: {order.id} | Email: {email} | Address: {address[:50]}...")

        total_price = Decimal(0)
        
        for item in data["items"]:
            product = get_object_or_404(Product, id=item["id"])
            quantity = int(item["quantity"])
            price = product.discounted_price

            OrderItem.objects.create(
                order=order,
                product=product,
                product_name=product.name,
                quantity=quantity,
                price=price,
            )
            total_price += price * quantity

        order.total_price = total_price
        order.save()
        
        logger.info(f"✅ Order {order.id} complete. Email: {order.customer_email}")
        return JsonResponse({
            "message": "Order placed successfully!",
            "order_id": order.id,
            "customer_email": order.customer_email,
            "customer_address": order.customer_address  # Include in response
        }, status=201)

    except Exception as e:
        logger.error(f"❌ Error: {e}")
        traceback.print_exc()
        return JsonResponse({"error": str(e)}, status=500)

@api_view(["GET"])
@permission_classes([AllowAny])
def get_orders(request):
    orders = Order.objects.all().order_by("-created_at").prefetch_related('order_items')
    serializer = OrderSerializer(orders, many=True)
    return Response({
        "orders": serializer.data,
        "count": orders.count()
    })