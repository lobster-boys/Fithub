from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import api_view
from ecommerce.models import Coupon, UserCoupon
from api.serializers.ecommerce.coupon_serializers import (
    CouponSerializer, UserCouponSerializer, UserCouponCreateSerializer
)
from users.models import User

@api_view(["GET", "POST"])
def coupons(request):
    """
    쿠폰 목록 조회 및 생성
    """
    if request.method == "GET":
        coupons = Coupon.objects.filter(is_active=True)
        serializer = CouponSerializer(coupons, many=True)
        return Response(serializer.data)
    
    elif request.method == "POST":
        serializer = CouponSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(["GET", "PUT", "DELETE"])
def coupon_detail(request, coupon_id):
    """
    특정 쿠폰 조회, 수정, 삭제
    """
    coupon = get_object_or_404(Coupon, id=coupon_id)
    
    if request.method == "GET":
        serializer = CouponSerializer(coupon)
        return Response(serializer.data)
    
    elif request.method == "PUT":
        serializer = CouponSerializer(coupon, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    elif request.method == "DELETE":
        coupon.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

class UserCouponAPI(APIView):
    
    def get(self, request):
        """
        사용자 쿠폰 목록 조회
        """
        user = User.objects.get(id="1")  # request.user로 전환 예정
        user_coupons = UserCoupon.objects.filter(user=user)
        serializer = UserCouponSerializer(user_coupons, many=True)
        return Response(serializer.data)
    
    def post(self, request):
        """
        사용자에게 쿠폰 지급
        """
        user = User.objects.get(id="1")  # request.user로 전환 예정
        serializer = UserCouponCreateSerializer(data=request.data)
        
        if serializer.is_valid():
            serializer.save(user=user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(["POST"])
def use_coupon(request, coupon_code):
    """
    쿠폰 사용
    """
    user = User.objects.get(id="1")  # request.user로 전환 예정
    
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