from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from datetime import timedelta, datetime
from django.db.models import Sum, Q

from points.models import UserPoint, PointTransaction, PointPolicy, PointExpiry
from points.services import PointService
from api.serializers.points.point_serializers import (
    UserPointSerializer,
    PointTransactionSerializer,
    PointTransactionCreateSerializer,
    PointTransactionUseSerializer,
    PointPolicySerializer,
    PointExpirySerializer,
    UserPointBalanceSerializer,
    PointSummarySerializer,
)


class UserPointViewSet(viewsets.ReadOnlyModelViewSet):
    """
    사용자 포인트 조회 ViewSet
    """
    serializer_class = UserPointSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return UserPoint.objects.filter(user=self.request.user)
    
    @action(detail=False, methods=['get'])
    def my_balance(self, request):
        """현재 사용자의 포인트 잔액 조회"""
        balance = PointService.get_user_balance(request.user)
        
        # 30일 내 만료 예정 포인트 계산
        expiring_soon = PointService.get_expiring_points(request.user, days=30)
        total_expiring = sum(exp.points_amount for exp in expiring_soon)
        
        data = {
            'balance': balance,
            'expiring_soon': total_expiring
        }
        
        serializer = UserPointBalanceSerializer(data)
        return Response(serializer.data)


class PointTransactionViewSet(viewsets.ModelViewSet):
    """
    포인트 거래 내역 ViewSet
    """
    serializer_class = PointTransactionSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return PointTransaction.objects.filter(user=self.request.user)
    
    def get_serializer_class(self):
        if self.action == 'earn_points':
            return PointTransactionCreateSerializer
        elif self.action == 'use_points':
            return PointTransactionUseSerializer
        return super().get_serializer_class()
    
    @action(detail=False, methods=['post'])
    def earn_points(self, request):
        """포인트 적립"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        try:
            transaction = PointService.earn_points(
                user=request.user,
                amount=serializer.validated_data['amount'],
                reference_type=serializer.validated_data['reference_type'],
                description=serializer.validated_data['description'],
                reference_id=serializer.validated_data.get('reference_id')
            )
            
            response_serializer = PointTransactionSerializer(transaction)
            return Response(
                response_serializer.data, 
                status=status.HTTP_201_CREATED
            )
        except ValueError as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=False, methods=['post'])
    def use_points(self, request):
        """포인트 사용"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        try:
            transaction = PointService.use_points(
                user=request.user,
                amount=serializer.validated_data['amount'],
                reference_type=serializer.validated_data['reference_type'],
                description=serializer.validated_data['description'],
                reference_id=serializer.validated_data.get('reference_id')
            )
            
            response_serializer = PointTransactionSerializer(transaction)
            return Response(
                response_serializer.data, 
                status=status.HTTP_201_CREATED
            )
        except ValueError as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=False, methods=['get'])
    def my_transactions(self, request):
        """현재 사용자의 포인트 거래 내역 조회"""
        limit = request.query_params.get('limit', 20)
        try:
            limit = int(limit)
        except (ValueError, TypeError):
            limit = 20
        
        transactions = PointService.get_user_transactions(request.user, limit=limit)
        serializer = self.get_serializer(transactions, many=True)
        return Response(serializer.data)


class PointPolicyViewSet(viewsets.ReadOnlyModelViewSet):
    """
    포인트 정책 조회 ViewSet (관리자만 수정 가능)
    """
    queryset = PointPolicy.objects.filter(is_active=True)
    serializer_class = PointPolicySerializer
    permission_classes = [IsAuthenticated]
    
    @action(detail=False, methods=['get'])
    def calculate_points(self, request):
        """정책에 따른 포인트 계산"""
        policy_type = request.query_params.get('policy_type')
        base_amount = request.query_params.get('base_amount', 0)
        
        if not policy_type:
            return Response(
                {'error': 'policy_type 파라미터가 필요합니다.'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            base_amount = float(base_amount)
        except (ValueError, TypeError):
            base_amount = 0
        
        points = PointService.calculate_points_by_policy(
            policy_type=policy_type,
            base_amount=base_amount
        )
        
        return Response({
            'policy_type': policy_type,
            'base_amount': base_amount,
            'calculated_points': points
        })


class PointExpiryViewSet(viewsets.ReadOnlyModelViewSet):
    """
    포인트 만료 정보 ViewSet
    """
    serializer_class = PointExpirySerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return PointExpiry.objects.filter(
            user=self.request.user,
            is_expired=False
        ).order_by('expiry_date')
    
    @action(detail=False, methods=['get'])
    def expiring_soon(self, request):
        """곧 만료될 포인트 조회"""
        days = request.query_params.get('days', 30)
        try:
            days = int(days)
        except (ValueError, TypeError):
            days = 30
        
        expiring_points = PointService.get_expiring_points(request.user, days=days)
        serializer = self.get_serializer(expiring_points, many=True)
        return Response(serializer.data)


class UserPointBalanceView(APIView):
    """
    사용자 포인트 잔액 조회 API
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        balance = PointService.get_user_balance(request.user)
        
        # 30일 내 만료 예정 포인트 계산
        expiring_soon = PointService.get_expiring_points(request.user, days=30)
        total_expiring = sum(exp.points_amount for exp in expiring_soon)
        
        data = {
            'balance': balance,
            'expiring_soon': total_expiring
        }
        
        serializer = UserPointBalanceSerializer(data)
        return Response(serializer.data)


class UserPointSummaryView(APIView):
    """
    사용자 포인트 요약 정보 API
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        user = request.user
        
        # 현재 잔액
        total_balance = PointService.get_user_balance(user)
        
        # 이번 달 적립/사용 포인트
        now = timezone.now()
        start_of_month = datetime(now.year, now.month, 1, tzinfo=now.tzinfo)
        
        earned_this_month = PointTransaction.objects.filter(
            user=user,
            transaction_type='EARN',
            created_at__gte=start_of_month
        ).aggregate(total=Sum('amount'))['total'] or 0
        
        used_this_month = PointTransaction.objects.filter(
            user=user,
            transaction_type='USE',
            created_at__gte=start_of_month
        ).aggregate(total=Sum('amount'))['total'] or 0
        
        used_this_month = abs(used_this_month)  # 음수를 양수로 변환
        
        # 30일 내 만료 예정 포인트
        expiring_points = PointService.get_expiring_points(user, days=30)
        expiring_in_30_days = sum(exp.points_amount for exp in expiring_points)
        
        # 최근 거래 내역 (최근 10개)
        recent_transactions = PointService.get_user_transactions(user, limit=10)
        
        data = {
            'total_balance': total_balance,
            'earned_this_month': earned_this_month,
            'used_this_month': used_this_month,
            'expiring_in_30_days': expiring_in_30_days,
            'recent_transactions': recent_transactions
        }
        
        serializer = PointSummarySerializer(data)
        return Response(serializer.data) 