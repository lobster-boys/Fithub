from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action, api_view
from rest_framework.response import Response

# 기존 ecommerce 포인트 모델은 Points 앱으로 이전됨
from points.models import UserPoint, PointTransaction
from api.serializers.points.point_serializers import (
    UserPointSerializer, PointTransactionSerializer, PointTransactionCreateSerializer
)
from points.services import PointService
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
        """포인트 거래 생성 시 현재 사용자를 자동으로 설정 - 이제 PointService를 통해 처리해야 함"""
        # PointService.earn_points() 또는 PointService.use_points()를 사용하세요
        transaction = serializer.save(user=self.request.user)
        # 잔액 업데이트는 PointService에서 자동으로 처리됨
    
    @action(detail=False, methods=['post'])
    def earn_points(self, request):
        """포인트 적립 - PointService 사용"""
        amount = int(request.data.get("amount", 0))
        description = request.data.get("description", "포인트 적립")
        reference_type = request.data.get("reference_type", "ADMIN")
        reference_id = request.data.get("reference_id", "")
        
        if amount <= 0:
            return Response(
                {"error": "적립할 포인트는 0보다 커야 합니다."}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # PointService를 사용하여 포인트 적립
            PointService.earn_points(
                user=request.user,
                amount=amount,
                reference_type=reference_type,
                description=description,
                reference_id=reference_id
            )
            
            current_balance = PointService.get_user_balance(request.user)
            return Response({
                "message": f"{amount}P가 적립되었습니다.",
                "current_balance": current_balance
            })
        except ValueError as e:
            return Response(
                {"error": str(e)}, 
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=False, methods=['post'])
    def use_points(self, request):
        """포인트 사용 - PointService 사용"""
        amount = int(request.data.get("amount", 0))
        description = request.data.get("description", "포인트 사용")
        reference_type = request.data.get("reference_type", "ORDER")
        reference_id = request.data.get("reference_id", "")
        
        if amount <= 0:
            return Response(
                {"error": "사용할 포인트는 0보다 커야 합니다."}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # PointService를 사용하여 포인트 사용
            PointService.use_points(
                user=request.user,
                amount=amount,
                reference_type=reference_type,
                description=description,
                reference_id=reference_id
            )
            
            current_balance = PointService.get_user_balance(request.user)
            return Response({
                "message": f"{amount}P가 사용되었습니다.",
                "current_balance": current_balance
            })
        except ValueError as e:
            return Response(
                {"error": str(e)}, 
                status=status.HTTP_400_BAD_REQUEST
            )

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