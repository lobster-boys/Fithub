from rest_framework import serializers
from ecommerce.models import Cart, CartItem, Product

class ProductInCartSerializer(serializers.ModelSerializer):
    """장바구니에서 사용할 상품 정보 serializer"""
    images = serializers.SerializerMethodField()
    
    class Meta:
        model = Product
        fields = [
            "id", "name", "description", "price", "sale_price", 
            "image_url", "images", "is_active", "stock_quantity"
        ]
    
    def get_images(self, obj):
        # image_url이 있으면 리스트로 반환, 없으면 빈 리스트
        if obj.image_url:
            return [obj.image_url]
        return []

class CartItemSerializer(serializers.ModelSerializer):
    total_price = serializers.ReadOnlyField()
    product = ProductInCartSerializer(read_only=True)
    
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