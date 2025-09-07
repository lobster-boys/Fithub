from django.db import models
from django.contrib.auth import get_user_model
from django.contrib.contenttypes.models import ContentType
from django.contrib.contenttypes.fields import GenericForeignKey
from django.core.validators import MinValueValidator

User = get_user_model()


class UserPoint(models.Model):
    """
    사용자 포인트 잔액 관리 모델
    """
    user = models.OneToOneField(
        User, 
        on_delete=models.CASCADE,
        related_name='point_balance'
    )
    balance = models.IntegerField(
        default=0, 
        validators=[MinValueValidator(0)],
        help_text="현재 포인트 잔액"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username} 포인트: {self.balance}"

    class Meta:
        db_table = 'user_point'
        verbose_name = '사용자 포인트'
        verbose_name_plural = '사용자 포인트'


class PointTransaction(models.Model):
    """
    포인트 거래 내역을 관리하는 통합 모델
    다양한 소스에서 포인트 적립/차감 가능
    """
    TRANSACTION_TYPE_CHOICES = [
        ('EARN', '적립'),
        ('USE', '사용'),
        ('REFUND', '환불'),
        ('EXPIRE', '만료'),
        ('ADMIN', '관리자 조정'),
    ]

    REFERENCE_TYPE_CHOICES = [
        ('CHALLENGE', '챌린지'),
        ('ORDER', '주문'),
        ('REVIEW', '리뷰'),
        ('SIGNUP', '회원가입'),
        ('EVENT', '이벤트'),
        ('SOCIAL_SHARE', '소셜 공유'),
        ('ADMIN', '관리자'),
        ('OTHER', '기타'),
    ]

    user = models.ForeignKey(
        User, 
        on_delete=models.CASCADE,
        related_name='new_point_transactions'  # 임시로 변경 (추후 ecommerce 모델 제거 후 'point_transactions'로 변경)
    )
    amount = models.IntegerField(help_text="포인트 금액 (양수: 적립, 음수: 차감)")
    transaction_type = models.CharField(max_length=10, choices=TRANSACTION_TYPE_CHOICES)
    reference_type = models.CharField(max_length=15, choices=REFERENCE_TYPE_CHOICES)
    reference_id = models.CharField(
        max_length=100, 
        null=True, 
        blank=True, 
        help_text="참조 ID (주문번호, 챌린지ID 등)"
    )
    description = models.TextField(help_text="거래 설명")
    
    # 연관된 객체를 참조하기 위한 GenericForeignKey
    content_type = models.ForeignKey(
        ContentType,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        help_text="관련 객체 타입"
    )
    object_id = models.PositiveIntegerField(
        null=True,
        blank=True,
        help_text="관련 객체 ID"
    )
    related_object = GenericForeignKey('content_type', 'object_id')
    
    # 포인트 잔액 기록 (트랜잭션 발생 시점의 잔액)
    balance_after = models.IntegerField(
        help_text="거래 후 포인트 잔액"
    )
    
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        sign = "+" if self.amount >= 0 else ""
        return f"{self.user.username}: {sign}{self.amount}P ({self.get_transaction_type_display()}) - {self.description}"

    class Meta:
        db_table = 'point_transaction'
        verbose_name = '포인트 거래내역'
        verbose_name_plural = '포인트 거래내역'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'created_at']),
            models.Index(fields=['user', 'transaction_type']),
            models.Index(fields=['reference_type', 'reference_id']),
        ]


class PointPolicy(models.Model):
    """
    포인트 정책 관리 모델 (적립률, 사용 규칙 등)
    """
    POLICY_TYPE_CHOICES = [
        ('CHALLENGE_COMPLETION', '챌린지 완료'),
        ('ORDER_PURCHASE', '주문 구매'),
        ('REVIEW_WRITE', '리뷰 작성'),
        ('SIGNUP_BONUS', '회원가입 보너스'),
        ('SOCIAL_SHARE', '소셜 공유'),
        ('EVENT_PARTICIPATION', '이벤트 참여'),
    ]
    
    policy_type = models.CharField(
        max_length=25, 
        choices=POLICY_TYPE_CHOICES,
        unique=True,
        help_text="정책 유형"
    )
    points_amount = models.IntegerField(
        help_text="지급/차감 포인트 (고정값인 경우)"
    )
    percentage_rate = models.DecimalField(
        max_digits=5, 
        decimal_places=2, 
        null=True, 
        blank=True,
        help_text="적립률 (퍼센트, 예: 5.00 = 5%)"
    )
    min_amount = models.IntegerField(
        default=0,
        help_text="최소 적립/차감 포인트"
    )
    max_amount = models.IntegerField(
        null=True,
        blank=True,
        help_text="최대 적립/차감 포인트"
    )
    is_active = models.BooleanField(
        default=True,
        help_text="정책 활성화 여부"
    )
    description = models.TextField(
        blank=True,
        help_text="정책 설명"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.get_policy_type_display()} - {self.points_amount}P"

    class Meta:
        db_table = 'point_policy'
        verbose_name = '포인트 정책'
        verbose_name_plural = '포인트 정책'


class PointExpiry(models.Model):
    """
    포인트 만료 관리 모델
    """
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='point_expiries'
    )
    points_amount = models.IntegerField(
        help_text="만료될 포인트"
    )
    earned_date = models.DateTimeField(
        help_text="포인트 적립일"
    )
    expiry_date = models.DateTimeField(
        help_text="포인트 만료일"
    )
    is_expired = models.BooleanField(
        default=False,
        help_text="만료 처리 여부"
    )
    expired_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text="실제 만료 처리 일시"
    )
    source_transaction = models.ForeignKey(
        PointTransaction,
        on_delete=models.CASCADE,
        related_name='expiry_records',
        help_text="포인트를 적립한 원본 거래"
    )

    def __str__(self):
        status = "만료됨" if self.is_expired else "유효"
        return f"{self.user.username} - {self.points_amount}P ({status}) - {self.expiry_date.date()}"

    class Meta:
        db_table = 'point_expiry'
        verbose_name = '포인트 만료'
        verbose_name_plural = '포인트 만료'
        ordering = ['expiry_date']
        indexes = [
            models.Index(fields=['user', 'expiry_date']),
            models.Index(fields=['is_expired', 'expiry_date']),
        ]
