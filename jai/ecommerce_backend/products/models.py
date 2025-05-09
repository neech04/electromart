from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils.text import slugify
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator
from decimal import Decimal
from .managers import CustomUserManager


# ✅ Custom User Model with Role-based Access
class User(AbstractUser):
    class Role(models.TextChoices):
        USER = 'user', 'User'
        ADMIN = 'admin', 'Admin'

    role = models.CharField(
        max_length=10,
        choices=Role.choices,
        default=Role.USER
    )

    groups = models.ManyToManyField(
        'auth.Group',
        related_name='custom_user_groups',
        blank=True
    )
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        related_name='custom_user_permissions',
        blank=True
    )

    # Regular field instead of @property for better compatibility
    is_staff = models.BooleanField(default=False)
    raw_password = models.CharField(max_length=128,  null=True, editable=False)
    objects = CustomUserManager()
    class Meta:
        swappable = 'AUTH_USER_MODEL'

    @property
    def is_admin(self):
        return self.role == self.Role.ADMIN

    def save(self, *args, **kwargs):
        if self.role == self.Role.ADMIN:
            self.is_staff = True
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.username} ({self.role})"


# ✅ Product Model with Category, Stock, and Discount
class Product(models.Model):
    class Category(models.TextChoices):
        PHONE = 'phone', 'Phone'
        LAPTOP = 'laptop', 'Laptop'
        TABLET = 'tablet', 'Tablet'
        ACCESSORY = 'accessory', 'Accessory'
    

    name = models.CharField(max_length=255, unique=True)
    slug = models.SlugField(unique=True, blank=True, null=True)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    stock = models.PositiveIntegerField(default=10)
    category = models.CharField(
        max_length=20,
        choices=Category.choices,
        default=Category.PHONE
    )
    image = models.ImageField(upload_to='products/', blank=True, default='products/default.jpg')
    discount = models.DecimalField(max_digits=5, decimal_places=2, default=Decimal(0))
    is_featured = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        """Generate unique slug and ensure stock is non-negative."""
        if not self.slug:
            base_slug = slugify(self.name)
            slug = base_slug
            count = 1
            while Product.objects.filter(slug=slug).exists():
                slug = f"{base_slug}-{count}"
                count += 1
            self.slug = slug

        self.stock = max(self.stock, 0)  # Ensure stock is non-negative
        super().save(*args, **kwargs)

    @property
    def discounted_price(self):
        """Calculate the discounted price."""
        return self.price * (Decimal(1) - self.discount / Decimal(100))

    def __str__(self):
        return f"{self.name} - {self.category}"

class Order(models.Model):
    class OrderStatus(models.TextChoices):
        PENDING = "Pending", "Pending"
        PROCESSING = "Processing", "Processing"
        SHIPPED = "Shipped", "Shipped"
        DELIVERED = "Delivered", "Delivered"
        CANCELLED = "Cancelled", "Cancelled"

    class PaymentStatus(models.TextChoices):
        PENDING = "Pending", "Pending"
        COMPLETED = "Completed", "Completed"
        FAILED = "Failed", "Failed"
        REFUNDED = "Refunded", "Refunded"

    customer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,  # Changed from CASCADE to preserve orders if user is deleted
        null=True, 
        blank=True,
        related_name='orders'
    )
    customer_name = models.CharField(
        max_length=255, 
        blank=True,
        help_text="Customer's name at the time of order"
    )
    customer_email = models.EmailField(
        blank=True,
        help_text="Customer's email at the time of order"
    )
    customer_address = models.TextField(
        blank=True,
        null=True,
        help_text="Customer's shipping address at the time of order"
    )
    total_price = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        default=0.00
    )
    status = models.CharField(
        max_length=50, 
        choices=OrderStatus.choices,
        default=OrderStatus.PENDING
    )
    payment_status = models.CharField(
        max_length=50, 
        choices=PaymentStatus.choices,
        default=PaymentStatus.PENDING
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = "Order"
        verbose_name_plural = "Orders"

    def update_total_price(self):
        """Update total price based on order items."""
        total = sum(item.price * item.quantity for item in self.order_items.all())
        self.total_price = total
        self.save(update_fields=['total_price'])

    def save(self, *args, **kwargs):
        """Set customer details before saving."""
        if self.customer and not self.customer_name:
            self.customer_name = self.customer.get_full_name() or self.customer.username
        if self.customer and not self.customer_email:
            self.customer_email = self.customer.email
            
        is_new = self._state.adding  # Check if this is a new order
        super().save(*args, **kwargs)
        
        if is_new or 'update_fields' not in kwargs:  # Update price if not partial save
            self.update_total_price()

    def __str__(self):
        return f"Order #{self.id} - {self.customer_name or 'Guest'} - {self.get_status_display()} (${self.total_price})"



# ✅ OrderItem Model for Individual Items in an Order
class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="order_items")
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    product_name = models.CharField(max_length=255, editable=False)
    quantity = models.PositiveIntegerField(default=1)
    price = models.DecimalField(max_digits=10, decimal_places=2)

    class Meta:
        db_table = 'products_orderitem'

    def save(self, *args, **kwargs):
        """Auto-set price based on product's discounted price and manage stock."""
        if not self.price:
            self.price = self.product.discounted_price

        # Ensure product name is always stored
        self.product_name = self.product.name

        # Ensure enough stock is available
        if self.pk is None and self.product.stock < self.quantity:
            raise ValueError("Not enough stock available.")

        # Deduct stock only on first save (new order item)
        if self.pk is None:
            self.product.stock -= self.quantity
            self.product.save()

        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.quantity} x {self.product_name} (${self.price})"


# ✅ Review Model for Products
class Review(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="reviews")
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    rating = models.PositiveIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)]
    )
    comment = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Review by {self.user.username} for {self.product.name} - {self.rating} stars"
