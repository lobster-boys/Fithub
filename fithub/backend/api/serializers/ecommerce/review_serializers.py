from rest_framework import serializers
from ecommerce.models import Review

class ReviewGeneratedSerializer(serializers.ModelSerializer):
    user = serializers.ReadOnlyField(source="user.username")
    
    class Meta:
        model = Review
        fields = ["id", "user", "title", "rating", "created_at"]
        read_only_fields = ["created_at"]

class ReviewSerializer(serializers.ModelSerializer):
    user = serializers.ReadOnlyField(source="user.username")
    
    class Meta:
        model = Review
        fields = [
            "id", "user", "product", "order_item", "title", "content", 
            "rating", "images", "is_verified_purchase", 
            "created_at", "updated_at"
        ]
        read_only_fields = ["created_at", "updated_at"]

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