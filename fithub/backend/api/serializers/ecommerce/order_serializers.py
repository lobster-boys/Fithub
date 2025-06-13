from rest_framework import serializers
from ecommerce.models import Order, OrderItem, ShippingAddress

class OrderItemSerializer(serializers.ModelSerializer):
    total_price = serializers.ReadOnlyField()
    
    class Meta:
        model = OrderItem
        fields = [
            "id", "order", "product", "product_name", "quantity", 
            "price", "created_at", "total_price"
        ]
        read_only_fields = ["created_at", "total_price"]

class ShippingAddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = ShippingAddress
        fields = [
            "id", "user", "recipient_name", "phone_number", 
            "address_line1", "address_line2", "city", "country", 
            "is_default", "created_at", "updated_at"
        ]
        read_only_fields = ["created_at", "updated_at"]

class OrderGeneratedSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = [
            "id", "user", "order_number", "status", "total_amount", 
            "created_at", "updated_at"
        ]
        read_only_fields = ["created_at", "updated_at"]

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    
    class Meta:
        model = Order
        fields = [
            "id", "user", "shipping_address", "order_number", "status",
            "total_amount", "payment_method", "points_applied", 
            "coupon_applied", "items", "created_at", "updated_at"
        ]
        read_only_fields = ["created_at", "updated_at"]

class OrderCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = [
            "shipping_address", "order_number", "status",
            "total_amount", "payment_method", "points_applied", 
            "coupon_applied"
        ]