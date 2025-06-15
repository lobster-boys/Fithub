from rest_framework import status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from ecommerce.models import Order
from api.serializers.ecommerce.order_serializers import OrderSerializer, OrderCreateSerializer
from api.views.base import BaseViewSet, UserOwnedMixin

# 테스트용 유저 불러오기
from users.models import User

class OrderViewSet(UserOwnedMixin, BaseViewSet):
    """주문 ViewSet"""
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]
    user_field = 'user'
    
    def get_serializer_class(self):
        if self.action == 'create':
            return OrderCreateSerializer
        return OrderSerializer
    
    def get_queryset(self):  # type: ignore
        # 사용자의 주문만 조회
        return super().get_queryset()  # type: ignore
    
    def perform_create(self, serializer):
        """주문 생성 시 현재 사용자를 자동으로 설정"""
        serializer.save(user=self.request.user)
    
    @action(detail=False, methods=['get'])
    def my_orders(self, request):
        """내 주문 목록"""
        queryset = self.get_queryset()
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
            
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def recent(self, request):
        """최근 주문 목록"""
        queryset = self.get_queryset().order_by('-created_at')[:10]
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """주문 취소"""
        order = self.get_object()
        
        # 주문 상태 확인 (예: 배송 전에만 취소 가능)
        if hasattr(order, 'status') and order.status in ['shipped', 'delivered']:  # type: ignore
            return Response(
                {"error": "배송이 시작된 주문은 취소할 수 없습니다."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # 주문 취소 로직
        if hasattr(order, 'status'):
            order.status = 'cancelled'  # type: ignore
            order.save()  # type: ignore
        
        return Response({"message": "주문이 취소되었습니다."})
    
    @action(detail=False, methods=['get'])
    def summary(self, request):
        """주문 요약 정보"""
        queryset = self.get_queryset()
        total_orders = queryset.count()
        
        # 상태별 주문 수 (모델에 status 필드가 있다고 가정)
        status_counts = {}
        if hasattr(Order, 'status'):
            from django.db.models import Count
            status_counts = dict(
                queryset.values_list('status').annotate(count=Count('status'))  # type: ignore
            )
        
        return Response({
            "total_orders": total_orders,
            "status_counts": status_counts
        })


# 레거시 뷰들 (하위 호환성을 위해 유지)
class OrdersAPI(APIView):
    """전체 주문내역"""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        """주문내역 조회"""
        try:
            orders = Order.objects.filter(user=request.user)
            serializer = OrderSerializer(orders, many=True)
            return Response(serializer.data)
        except Exception as e:
            return Response(
                {"error": str(e)}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
    def post(self, request):
        """주문내역 생성"""
        try:
            serializer = OrderCreateSerializer(data=request.data)
            if serializer.is_valid():
                serializer.save(user=request.user)
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response(
                {"error": str(e)}, 
                status=status.HTTP_400_BAD_REQUEST
            )


class OrderAPI(APIView):
    """단일 주문내역"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request, pk):
        """단일 주문내역 조회"""
        try:
            order = Order.objects.get(id=pk, user=request.user)
            serializer = OrderSerializer(order)
            return Response(serializer.data)
        except Order.DoesNotExist:
            return Response(
                {"error": "주문을 찾을 수 없습니다."}, 
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {"error": str(e)}, 
                status=status.HTTP_400_BAD_REQUEST
            )

