from rest_framework import serializers
from ecommerce.models import Review
from django.contrib.auth import get_user_model

class UserBasicSerializer(serializers.ModelSerializer):
    """리뷰에서 사용할 기본 사용자 정보 시리얼라이저"""
    class Meta:
        User = get_user_model()
        model = User
        fields = ["id", "username", "first_name", "last_name"]

class ReviewGeneratedSerializer(serializers.ModelSerializer):
    user = UserBasicSerializer(read_only=True)
    
    class Meta:
        model = Review
        fields = ["id", "user", "title", "rating", "created_at"]
        read_only_fields = ["created_at"]

class ReviewSerializer(serializers.ModelSerializer):
    user = UserBasicSerializer(read_only=True)
    product_name = serializers.ReadOnlyField(source="product.name")
    
    class Meta:
        model = Review
        fields = [
            "id", "user", "product", "product_name", "order_item", "title", "content", 
            "rating", "images", "is_verified_purchase", 
            "created_at", "updated_at"
        ]
        read_only_fields = ["created_at", "updated_at", "user", "is_verified_purchase"]

class ReviewCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Review
        fields = [
            "product", "order_item", "title", "content", 
            "rating", "images"
        ]

    def validate_rating(self, value):
        """평점은 1-5 사이여야 합니다."""
        if value < 1 or value > 5:
            raise serializers.ValidationError("평점은 1부터 5까지만 가능합니다.")
        return value

    def validate_title(self, value):
        """제목 유효성 검사"""
        if not value or not value.strip():
            raise serializers.ValidationError("리뷰 제목을 입력해주세요.")
        if len(value.strip()) < 2:
            raise serializers.ValidationError("리뷰 제목은 최소 2자 이상이어야 합니다.")
        return value.strip()

    def validate_content(self, value):
        """내용 유효성 검사"""
        if not value or not value.strip():
            raise serializers.ValidationError("리뷰 내용을 입력해주세요.")
        if len(value.strip()) < 5:
            raise serializers.ValidationError("리뷰 내용은 최소 5자 이상이어야 합니다.")
        return value.strip() 