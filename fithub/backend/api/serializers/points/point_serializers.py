from rest_framework import serializers
from points.models import UserPoint, PointTransaction, PointPolicy, PointExpiry


class UserPointSerializer(serializers.ModelSerializer):
    user_info = serializers.SerializerMethodField()
    
    class Meta:
        model = UserPoint
        fields = [
            'id', 'user', 'user_info', 'balance', 
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']
    
    def get_user_info(self, obj):
        return {
            'id': obj.user.id,
            'username': obj.user.username,
            'email': obj.user.email
        }


class PointTransactionSerializer(serializers.ModelSerializer):
    user_info = serializers.SerializerMethodField()
    transaction_type_display = serializers.CharField(
        source='get_transaction_type_display', 
        read_only=True
    )
    reference_type_display = serializers.CharField(
        source='get_reference_type_display',
        read_only=True
    )
    amount_display = serializers.SerializerMethodField()
    
    class Meta:
        model = PointTransaction
        fields = [
            'id', 'user', 'user_info', 'amount', 'amount_display',
            'transaction_type', 'transaction_type_display',
            'reference_type', 'reference_type_display',
            'reference_id', 'description', 'balance_after',
            'created_at'
        ]
        read_only_fields = ['created_at', 'balance_after']
    
    def get_user_info(self, obj):
        return {
            'id': obj.user.id,
            'username': obj.user.username
        }
    
    def get_amount_display(self, obj):
        sign = "+" if obj.amount >= 0 else ""
        return f"{sign}{obj.amount}"


class PointTransactionCreateSerializer(serializers.Serializer):
    """
    포인트 거래 생성용 시리얼라이저
    """
    amount = serializers.IntegerField(min_value=1)
    reference_type = serializers.ChoiceField(
        choices=PointTransaction.REFERENCE_TYPE_CHOICES
    )
    description = serializers.CharField(max_length=500)
    reference_id = serializers.CharField(max_length=100, required=False)
    
    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("포인트는 0보다 커야 합니다.")
        return value


class PointTransactionUseSerializer(serializers.Serializer):
    """
    포인트 사용용 시리얼라이저
    """
    amount = serializers.IntegerField(min_value=1)
    reference_type = serializers.ChoiceField(
        choices=PointTransaction.REFERENCE_TYPE_CHOICES
    )
    description = serializers.CharField(max_length=500)
    reference_id = serializers.CharField(max_length=100, required=False)
    
    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("사용할 포인트는 0보다 커야 합니다.")
        return value


class PointPolicySerializer(serializers.ModelSerializer):
    policy_type_display = serializers.CharField(
        source='get_policy_type_display',
        read_only=True
    )
    
    class Meta:
        model = PointPolicy
        fields = [
            'id', 'policy_type', 'policy_type_display',
            'points_amount', 'percentage_rate',
            'min_amount', 'max_amount', 'is_active',
            'description', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']


class PointExpirySerializer(serializers.ModelSerializer):
    user_info = serializers.SerializerMethodField()
    days_until_expiry = serializers.SerializerMethodField()
    status_display = serializers.SerializerMethodField()
    
    class Meta:
        model = PointExpiry
        fields = [
            'id', 'user', 'user_info', 'points_amount',
            'earned_date', 'expiry_date', 'days_until_expiry',
            'is_expired', 'status_display', 'expired_at'
        ]
        read_only_fields = [
            'earned_date', 'expired_at', 'days_until_expiry', 'status_display'
        ]
    
    def get_user_info(self, obj):
        return {
            'id': obj.user.id,
            'username': obj.user.username
        }
    
    def get_days_until_expiry(self, obj):
        if obj.is_expired:
            return None
        
        from django.utils import timezone
        days = (obj.expiry_date - timezone.now()).days
        return max(0, days)
    
    def get_status_display(self, obj):
        if obj.is_expired:
            return "만료됨"
        
        days = self.get_days_until_expiry(obj)
        if days is None:
            return "만료됨"
        elif days == 0:
            return "오늘 만료"
        elif days <= 7:
            return f"{days}일 후 만료"
        elif days <= 30:
            return f"{days}일 후 만료"
        else:
            return "유효함"


class UserPointBalanceSerializer(serializers.Serializer):
    """
    사용자 포인트 잔액 조회용 간단한 시리얼라이저
    """
    balance = serializers.IntegerField()
    expiring_soon = serializers.IntegerField(help_text="30일 내 만료 예정 포인트")
    
    
class PointSummarySerializer(serializers.Serializer):
    """
    포인트 요약 정보 시리얼라이저
    """
    total_balance = serializers.IntegerField()
    earned_this_month = serializers.IntegerField()
    used_this_month = serializers.IntegerField()
    expiring_in_30_days = serializers.IntegerField()
    recent_transactions = PointTransactionSerializer(many=True) 