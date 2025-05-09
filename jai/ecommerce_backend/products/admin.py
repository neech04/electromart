from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, Product, Order, OrderItem

# ✅ Register Custom User Model
@admin.register(User)
class CustomUserAdmin(UserAdmin):  # ✅ Use Django's UserAdmin for better admin control
    list_display = ('id', 'username', 'email', 'role', 'is_active', 'is_superuser')  # ✅ Removed 'is_staff'
    search_fields = ('username', 'email')
    list_filter = ('role', 'is_active')  # ✅ Use 'is_active' instead of 'is_staff'
    
    fieldsets = (
        (None, {'fields': ('username', 'email', 'password')}),
        ('Permissions', {'fields': ('role', 'is_active', 'is_superuser')}),
    )

    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('username', 'email', 'password1', 'password2', 'role', 'is_active'),
        }),
    )


# ✅ Register Product Model
@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'category', 'price', 'stock')
    search_fields = ('name', 'category')
    list_filter = ('category',)


# ✅ OrderItem Inline for OrderAdmin
class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 1  # Allows adding extra inline items


# ✅ Register Order Model
@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('id', 'customer', 'get_products', 'get_total_quantity', 'total_price', 'status', 'created_at')
    search_fields = ('customer__username',)
    list_filter = ('status',)
    inlines = [OrderItemInline]  # Show order items inline in the admin panel

    def get_products(self, obj):
        """Retrieve products from OrderItem"""
        return ", ".join([item.product_name for item in obj.orderitem_set.all()])
    get_products.short_description = "Products"

    def get_total_quantity(self, obj):
        """Sum all item quantities"""
        return sum(item.quantity for item in obj.orderitem_set.all())
    get_total_quantity.short_description = "Total Quantity"
