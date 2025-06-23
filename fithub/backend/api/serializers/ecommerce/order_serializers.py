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
    # 프론트엔드 호환성을 위한 필드 매핑
    phone = serializers.CharField(source='phone_number', required=True)
    address = serializers.CharField(source='address_line1', required=True)
    detail_address = serializers.CharField(source='address_line2', required=False, allow_blank=True)
    postal_code = serializers.CharField(source='city', required=True)  # 임시로 city를 postal_code로 매핑
    
    class Meta:
        model = ShippingAddress
        fields = [
            "id", "recipient_name", "phone", "address", "detail_address", 
            "postal_code", "country", "is_default", "created_at", "updated_at"
        ]
        read_only_fields = ["id", "created_at", "updated_at"]
    
    def create(self, validated_data):
        # 필드 매핑 처리
        validated_data['phone_number'] = validated_data.pop('phone_number', '')
        validated_data['address_line1'] = validated_data.pop('address_line1', '')
        validated_data['address_line2'] = validated_data.pop('address_line2', '')
        validated_data['city'] = validated_data.pop('city', '')
        return super().create(validated_data)
    
    def update(self, instance, validated_data):
        # 필드 매핑 처리
        if 'phone_number' in validated_data:
            validated_data['phone_number'] = validated_data.pop('phone_number')
        if 'address_line1' in validated_data:
            validated_data['address_line1'] = validated_data.pop('address_line1')
        if 'address_line2' in validated_data:
            validated_data['address_line2'] = validated_data.pop('address_line2')
        if 'city' in validated_data:
            validated_data['city'] = validated_data.pop('city')
        return super().update(instance, validated_data)

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