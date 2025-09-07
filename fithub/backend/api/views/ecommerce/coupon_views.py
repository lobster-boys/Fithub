from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action, api_view
from rest_framework.response import Response
from ecommerce.models import Coupon, UserCoupon
from api.serializers.ecommerce.coupon_serializers import (
    CouponSerializer, UserCouponSerializer, UserCouponCreateSerializer
)
from users.models import User
from django.utils import timezone
from django.db.models import F

class CouponViewSet(viewsets.ModelViewSet):
    """
    쿠폰 ViewSet
    - 기본 CRUD 작업
    - 쿠폰 사용 기능
    """
    queryset = Coupon.objects.all()
    serializer_class = CouponSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """현재 사용 가능한 쿠폰만 필터링"""
        now = timezone.now()
        return Coupon.objects.filter(
            start_date__lte=now,
            end_date__gte=now,
            usage_count__lt=F('usage_limit')
        )

    @action(detail=False, methods=['post'])
    def use_coupon(self, request):
        """쿠폰 사용"""
        coupon_code = request.data.get('coupon_code')
        user = request.user  # 실제 인증된 사용자 사용
        
        if not coupon_code:
            return Response(
                {"error": "쿠폰 코드가 필요합니다."}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            coupon = Coupon.objects.get(code=coupon_code)
            user_coupon = UserCoupon.objects.get(user=user, coupon=coupon, is_used=False)
            
            if coupon.is_active:
                user_coupon.is_used = True
                user_coupon.save()
                
                coupon.usage_count += 1
                coupon.save()
                
                return Response({"message": "쿠폰이 성공적으로 사용되었습니다."})
            else:
                return Response(
                    {"error": "사용할 수 없는 쿠폰입니다."}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
                
        except (Coupon.DoesNotExist, UserCoupon.DoesNotExist):
            return Response(
                {"error": "유효하지 않은 쿠폰입니다."}, 
                status=status.HTTP_404_NOT_FOUND
            )

class UserCouponViewSet(viewsets.ModelViewSet):
    """
    사용자 쿠폰 ViewSet
    - 사용자의 쿠폰 목록 조회
    - 쿠폰 지급 기능
    """
    serializer_class = UserCouponSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """사용자의 쿠폰만 조회"""
        return UserCoupon.objects.filter(user=self.request.user)
    
    def get_serializer_class(self):
        if self.action == 'create':
            return UserCouponCreateSerializer
        return UserCouponSerializer
    
    def perform_create(self, serializer):
        """쿠폰 지급 시 현재 사용자를 자동으로 설정"""
        serializer.save(user=self.request.user)

# 하위 호환성을 위한 레거시 뷰들
@api_view(["GET", "POST"])
def coupons(request):
    """레거시 호환: CouponViewSet으로 redirect"""
    viewset = CouponViewSet()
    viewset.request = request
    if request.method == "GET":
        return viewset.list(request)
    elif request.method == "POST":
        return viewset.create(request)

@api_view(["GET", "PUT", "DELETE"])
def coupon_detail(request, coupon_id):
    """레거시 호환: CouponViewSet으로 redirect"""
    viewset = CouponViewSet()
    viewset.request = request
    if request.method == "GET":
        return viewset.retrieve(request, pk=coupon_id)
    elif request.method == "PUT":
        return viewset.update(request, pk=coupon_id)
    elif request.method == "DELETE":
        return viewset.destroy(request, pk=coupon_id)

class UserCouponAPI:
    """레거시 호환을 위한 클래스 (UserCouponViewSet으로 redirect)"""
    def __new__(cls):
        return UserCouponViewSet()

@api_view(["POST"])
def use_coupon(request, coupon_code):
    """레거시 호환: CouponViewSet.use_coupon으로 redirect"""
    viewset = CouponViewSet()
    viewset.request = request
    request.data['coupon_code'] = coupon_code
    return viewset.use_coupon(request) 