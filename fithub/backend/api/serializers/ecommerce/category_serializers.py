from rest_framework import serializers
from ecommerce.models import Category



class CategorySimpleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = [
            "parent",
            "name",
            "description",
        ]

class CategorySerializer(serializers.ModelSerializer):
    from .product_serializers import ProductSimpleSerializer

    product = ProductSimpleSerializer(read_only=True, many=True)
    class Meta:
        model = Category
        fields = "__all__"