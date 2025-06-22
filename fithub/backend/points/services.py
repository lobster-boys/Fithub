from django.db import transaction
from django.utils import timezone
from django.contrib.contenttypes.models import ContentType
from datetime import timedelta
from decimal import Decimal

from .models import UserPoint, PointTransaction, PointPolicy, PointExpiry


class PointService:
    """
    포인트 관련 비즈니스 로직을 처리하는 서비스 클래스
    """
    
    @classmethod
    def get_or_create_user_point(cls, user):
        """사용자 포인트 계정 생성 또는 조회"""
        user_point, created = UserPoint.objects.get_or_create(
            user=user,
            defaults={'balance': 0}
        )
        return user_point
    
    @classmethod
    @transaction.atomic
    def earn_points(cls, user, amount, reference_type, description, 
                   reference_id=None, related_object=None, expiry_days=365):
        """
        포인트 적립
        
        Args:
            user: 사용자
            amount: 적립할 포인트
            reference_type: 참조 타입 ('CHALLENGE', 'ORDER', 등)
            description: 거래 설명
            reference_id: 참조 ID (선택)
            related_object: 관련 객체 (선택)
            expiry_days: 만료일 (기본 365일)
        """
        if amount <= 0:
            raise ValueError("적립할 포인트는 0보다 커야 합니다.")
        
        user_point = cls.get_or_create_user_point(user)
        
        # 포인트 잔액 업데이트
        user_point.balance += amount
        user_point.save()
        
        # 거래 내역 생성
        content_type = None
        object_id = None
        if related_object:
            content_type = ContentType.objects.get_for_model(related_object)
            object_id = related_object.pk
        
        transaction_record = PointTransaction.objects.create(
            user=user,
            amount=amount,
            transaction_type='EARN',
            reference_type=reference_type,
            reference_id=reference_id,
            description=description,
            content_type=content_type,
            object_id=object_id,
            balance_after=user_point.balance
        )
        
        # 포인트 만료 기록 생성
        expiry_date = timezone.now() + timedelta(days=expiry_days)
        PointExpiry.objects.create(
            user=user,
            points_amount=amount,
            earned_date=timezone.now(),
            expiry_date=expiry_date,
            source_transaction=transaction_record
        )
        
        return transaction_record
    
    @classmethod
    @transaction.atomic
    def use_points(cls, user, amount, reference_type, description,
                  reference_id=None, related_object=None):
        """
        포인트 사용
        
        Args:
            user: 사용자
            amount: 사용할 포인트
            reference_type: 참조 타입
            description: 거래 설명
            reference_id: 참조 ID (선택)
            related_object: 관련 객체 (선택)
        """
        if amount <= 0:
            raise ValueError("사용할 포인트는 0보다 커야 합니다.")
        
        user_point = cls.get_or_create_user_point(user)
        
        if user_point.balance < amount:
            raise ValueError(f"포인트 잔액이 부족합니다. (잔액: {user_point.balance}, 사용 요청: {amount})")
        
        # 포인트 잔액 업데이트
        user_point.balance -= amount
        user_point.save()
        
        # 거래 내역 생성
        content_type = None
        object_id = None
        if related_object:
            content_type = ContentType.objects.get_for_model(related_object)
            object_id = related_object.pk
        
        transaction_record = PointTransaction.objects.create(
            user=user,
            amount=-amount,
            transaction_type='USE',
            reference_type=reference_type,
            reference_id=reference_id,
            description=description,
            content_type=content_type,
            object_id=object_id,
            balance_after=user_point.balance
        )
        
        return transaction_record
    
    @classmethod
    @transaction.atomic
    def refund_points(cls, user, amount, reference_type, description,
                     reference_id=None, related_object=None):
        """포인트 환불"""
        if amount <= 0:
            raise ValueError("환불할 포인트는 0보다 커야 합니다.")
        
        user_point = cls.get_or_create_user_point(user)
        user_point.balance += amount
        user_point.save()
        
        content_type = None
        object_id = None
        if related_object:
            content_type = ContentType.objects.get_for_model(related_object)
            object_id = related_object.pk
        
        return PointTransaction.objects.create(
            user=user,
            amount=amount,
            transaction_type='REFUND',
            reference_type=reference_type,
            reference_id=reference_id,
            description=description,
            content_type=content_type,
            object_id=object_id,
            balance_after=user_point.balance
        )
    
    @classmethod
    def get_user_balance(cls, user):
        """사용자 포인트 잔액 조회"""
        user_point = cls.get_or_create_user_point(user)
        return user_point.balance
    
    @classmethod
    def get_user_transactions(cls, user, limit=None):
        """사용자 포인트 거래 내역 조회"""
        queryset = PointTransaction.objects.filter(user=user)
        if limit:
            queryset = queryset[:limit]
        return queryset
    
    @classmethod
    def calculate_points_by_policy(cls, policy_type, base_amount=None):
        """
        정책에 따른 포인트 계산
        
        Args:
            policy_type: 정책 타입
            base_amount: 기준 금액 (퍼센트 계산용)
        """
        try:
            policy = PointPolicy.objects.get(
                policy_type=policy_type,
                is_active=True
            )
        except PointPolicy.DoesNotExist:
            return 0
        
        if policy.percentage_rate and base_amount:
            # 퍼센트 기반 계산
            points = int(base_amount * policy.percentage_rate / 100)
        else:
            # 고정 포인트
            points = policy.points_amount
        
        # 최소/최대 제한 적용
        if points < policy.min_amount:
            points = policy.min_amount
        if policy.max_amount and points > policy.max_amount:
            points = policy.max_amount
            
        return points
    
    @classmethod
    @transaction.atomic
    def expire_points(cls, user=None):
        """
        만료된 포인트 처리
        
        Args:
            user: 특정 사용자만 처리 (None이면 전체 사용자)
        """
        now = timezone.now()
        
        # 만료된 포인트 조회
        expired_points_qs = PointExpiry.objects.filter(
            expiry_date__lte=now,
            is_expired=False
        )
        
        if user:
            expired_points_qs = expired_points_qs.filter(user=user)
        
        expired_count = 0
        total_expired_amount = 0
        
        for expiry_record in expired_points_qs:
            user_point = cls.get_or_create_user_point(expiry_record.user)
            
            # 실제 차감할 포인트 계산 (잔액이 부족할 수 있음)
            deduct_amount = min(expiry_record.points_amount, user_point.balance)
            
            if deduct_amount > 0:
                # 포인트 차감
                user_point.balance -= deduct_amount
                user_point.save()
                
                # 만료 거래 내역 생성
                PointTransaction.objects.create(
                    user=expiry_record.user,
                    amount=-deduct_amount,
                    transaction_type='EXPIRE',
                    reference_type='OTHER',
                    description=f"포인트 만료 ({expiry_record.earned_date.date()}에 적립)",
                    balance_after=user_point.balance
                )
            
            # 만료 처리 표시
            expiry_record.is_expired = True
            expiry_record.expired_at = now
            expiry_record.save()
            
            expired_count += 1
            total_expired_amount += deduct_amount
        
        return {
            'expired_count': expired_count,
            'total_expired_amount': total_expired_amount
        }
    
    @classmethod
    def get_expiring_points(cls, user, days=30):
        """
        곧 만료될 포인트 조회
        
        Args:
            user: 사용자
            days: 며칠 후까지의 만료 예정 포인트
        """
        expire_date = timezone.now() + timedelta(days=days)
        
        return PointExpiry.objects.filter(
            user=user,
            expiry_date__lte=expire_date,
            is_expired=False
        ).order_by('expiry_date') 