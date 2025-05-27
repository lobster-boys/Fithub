from rest_framework import serializers
from ecommerce.models import Product, Category

class ProductSimpleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = ["id", "name"]

class ProductSerializer(serializers.ModelSerializer):
    from api.serializers.category_serializers import CategorySimpleSerializer

    category = CategorySimpleSerializer()
    class Meta:
        model = Product
        fields = "__all__"

    def create(self, validated_data):
        category_data = validated_data.pop("category")

        category, _ = Category.objects.get_or_create(**category_data)
        product = Product.objects.create(**validated_data, category=category)

        return product