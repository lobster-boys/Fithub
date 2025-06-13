from rest_framework import serializers
from ecommerce.models import Cart, CartItem

class CartItemSerializer(serializers.ModelSerializer):
    total_price = serializers.ReadOnlyField()
    
    class Meta:
        model = CartItem
        fields = [
            "id", "cart", "product", "product_name", "price", 
            "quantity", "created_at", "updated_at", "total_price"
        ]
        read_only_fields = ["created_at", "updated_at", "total_price"]

class CartGeneratedSerializer(serializers.ModelSerializer):
    user = serializers.ReadOnlyField(source="user.username")

    class Meta:
        model = Cart
        fields = ["id", "user", "created_at", "updated_at"]
        read_only_fields = ["created_at", "updated_at"]

class CartSerializer(serializers.ModelSerializer):
    user = serializers.ReadOnlyField(source="user.username")
    items = CartItemSerializer(many=True, read_only=True)

    class Meta:
        model = Cart
        fields = ["id", "user", "items", "created_at", "updated_at"]
        read_only_fields = ["created_at", "updated_at"]