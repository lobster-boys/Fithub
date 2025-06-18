from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action, api_view
from rest_framework.response import Response
from ecommerce.models import UserPoint, PointTransaction
from api.serializers.ecommerce.point_serializers import (
    UserPointSerializer, PointTransactionSerializer, PointTransactionCreateSerializer
)
from users.models import User

class UserPointViewSet(viewsets.ReadOnlyModelViewSet):
    """
    사용자 포인트 ViewSet
    - 포인트 조회 기능
    """
    serializer_class = UserPointSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """사용자의 포인트만 조회"""
        return UserPoint.objects.filter(user=self.request.user)
    
    @action(detail=False, methods=['get'])
    def my_points(self, request):
        """내 포인트 조회"""
        user_point, created = UserPoint.objects.get_or_create(user=request.user)
        serializer = UserPointSerializer(user_point)
        return Response(serializer.data)

class PointTransactionViewSet(viewsets.ModelViewSet):
    """
    포인트 거래 ViewSet
    - 포인트 거래 내역 조회
    - 포인트 적립/사용 기능
    """
    serializer_class = PointTransactionSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """사용자의 포인트 거래만 조회"""
        return PointTransaction.objects.filter(user=self.request.user)
    
    def get_serializer_class(self):
        if self.action == 'create':
            return PointTransactionCreateSerializer
        return PointTransactionSerializer
    
    def perform_create(self, serializer):
        """포인트 거래 생성 시 현재 사용자를 자동으로 설정하고 잔액 업데이트"""
        transaction = serializer.save(user=self.request.user)
        
        # 사용자 포인트 잔액 업데이트
        user_point, created = UserPoint.objects.get_or_create(user=self.request.user)
        user_point.balance += transaction.amount
        user_point.save()
    
    @action(detail=False, methods=['post'])
    def earn_points(self, request):
        """포인트 적립"""
        amount = int(request.data.get("amount", 0))
        description = request.data.get("description", "포인트 적립")
        reference_type = request.data.get("reference_type", "ADMIN")
        reference_id = request.data.get("reference_id", "")
        
        if amount <= 0:
            return Response(
                {"error": "적립할 포인트는 0보다 커야 합니다."}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # 포인트 거래 생성
        transaction = PointTransaction.objects.create(
            user=request.user,
            amount=amount,
            transaction_type="EARN",
            reference_type=reference_type,
            reference_id=reference_id,
            description=description
        )
        
        # 사용자 포인트 잔액 업데이트
        user_point, created = UserPoint.objects.get_or_create(user=request.user)
        user_point.balance += amount
        user_point.save()
        
        return Response({
            "message": f"{amount}P가 적립되었습니다.",
            "current_balance": user_point.balance
        })
    
    @action(detail=False, methods=['post'])
    def use_points(self, request):
        """포인트 사용"""
        amount = int(request.data.get("amount", 0))
        description = request.data.get("description", "포인트 사용")
        reference_type = request.data.get("reference_type", "ORDER")
        reference_id = request.data.get("reference_id", "")
        
        if amount <= 0:
            return Response(
                {"error": "사용할 포인트는 0보다 커야 합니다."}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # 사용자 포인트 조회
        user_point, created = UserPoint.objects.get_or_create(user=request.user)
        
        if user_point.balance < amount:
            return Response(
                {"error": "보유 포인트가 부족합니다."}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # 포인트 거래 생성 (음수로 저장)
        transaction = PointTransaction.objects.create(
            user=request.user,
            amount=-amount,
            transaction_type="USE",
            reference_type=reference_type,
            reference_id=reference_id,
            description=description
        )
        
        # 사용자 포인트 잔액 업데이트
        user_point.balance -= amount
        user_point.save()
        
        return Response({
            "message": f"{amount}P가 사용되었습니다.",
            "current_balance": user_point.balance
        })

# 하위 호환성을 위한 레거시 뷰들
class UserPointAPI:
    """레거시 호환을 위한 클래스 (UserPointViewSet으로 redirect)"""
    def __new__(cls):
        return UserPointViewSet()

class PointTransactionAPI:
    """레거시 호환을 위한 클래스 (PointTransactionViewSet으로 redirect)"""
    def __new__(cls):
        return PointTransactionViewSet()

@api_view(["POST"])
def earn_points(request):
    """레거시 호환: PointTransactionViewSet.earn_points로 redirect"""
    viewset = PointTransactionViewSet()
    viewset.request = request
    return viewset.earn_points(request)

@api_view(["POST"])
def use_points(request):
    """레거시 호환: PointTransactionViewSet.use_points로 redirect"""
    viewset = PointTransactionViewSet()
    viewset.request = request
    return viewset.use_points(request) 