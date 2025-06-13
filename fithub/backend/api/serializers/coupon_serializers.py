from rest_framework import serializers
from ecommerce.models import Coupon, UserCoupon

class CouponGeneratedSerializer(serializers.ModelSerializer):
    class Meta:
        model = Coupon
        fields = ["id", "code", "discount_type", "discount_value"]

class CouponSerializer(serializers.ModelSerializer):
    is_active = serializers.ReadOnlyField()
    
    class Meta:
        model = Coupon
        fields = [
            "id", "code", "discount_type", "discount_value", 
            "min_purchase_amount", "max_discount_amount", "start_date", 
            "end_date", "usage_limit", "usage_count", "is_active",
            "created_at", "updated_at"
        ]
        read_only_fields = ["created_at", "updated_at", "is_active"]

class UserCouponSerializer(serializers.ModelSerializer):
    coupon = CouponGeneratedSerializer(read_only=True)
    
    class Meta:
        model = UserCoupon
        fields = [
            "id", "user", "coupon", "is_used", 
            "created_at", "updated_at"
        ]
        read_only_fields = ["created_at", "updated_at"]

class UserCouponCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserCoupon
        fields = ["coupon", "is_used"] 