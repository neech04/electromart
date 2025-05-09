from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import Product, User, Order





class ProductSerializer(serializers.ModelSerializer):
    image = serializers.CharField(required=False, allow_blank=True)  # Allow URLs

    class Meta:
        model = Product
        fields = ['id', 'name', 'price',  'description','category', 'image']

# ✅ Order Serializer
class OrderSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = '__all__'


# ✅ User Serializer
class UserSerializer(serializers.ModelSerializer):
    """Handles user serialization and password encryption."""
    
    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'role', 'password']
        extra_kwargs = {'password': {'write_only': True}}  # Ensures password isn't returned in responses

    def create(self, validated_data):
        """Creates a user with an encrypted password in MySQL."""
        validated_data.setdefault('role', 'user')  # Assign default role if missing
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            role=validated_data.get('role', 'user')  # Default role: 'user'
        )
        return user


# ✅ Login Serializer
class LoginSerializer(serializers.Serializer):
    """Handles user authentication using either username or email."""
    
    identifier = serializers.CharField(required=True)  # Can be username or email
    password = serializers.CharField(write_only=True, min_length=6)

    def validate(self, data):
        """Authenticates user via username or email."""
        
        identifier = data.get('identifier')  # Username or email
        password = data.get('password')

        if not identifier or not password:
            raise serializers.ValidationError("Username/Email and Password are required.")

        user = None

        # Check if the identifier is an email or username
        if '@' in identifier:
            user = User.objects.filter(email=identifier).first()
        else:
            user = User.objects.filter(username=identifier).first()

        if user and user.check_password(password):
            return {"user": user}  # Return the user object

        raise serializers.ValidationError("Invalid login credentials.")
