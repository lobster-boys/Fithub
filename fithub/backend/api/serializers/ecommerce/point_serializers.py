from rest_framework import serializers
from ecommerce.models import UserPoint, PointTransaction

class UserPointSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserPoint
        fields = ["id", "user", "balance", "created_at", "updated_at"]
        read_only_fields = ["created_at", "updated_at"]

class PointTransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = PointTransaction
        fields = [
            "id", "user", "amount", "transaction_type", "reference_type",
            "reference_id", "description", "created_at"
        ]
        read_only_fields = ["created_at"]

class PointTransactionCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = PointTransaction
        fields = [
            "amount", "transaction_type", "reference_type",
            "reference_id", "description"
        ] 