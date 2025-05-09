# products/utils.py
from django.shortcuts import get_object_or_404
from .models import Product
from .serializers import ProductSerializer
from rest_framework.response import Response
from rest_framework import status

def get_product_by_id(product_id):
    product = get_object_or_404(Product, id=product_id)
    serializer = ProductSerializer(product)
    return Response(serializer.data, status=status.HTTP_200_OK)
