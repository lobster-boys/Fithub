from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import api_view
from ecommerce.models import UserPoint, PointTransaction
from api.serializers.ecommerce.point_serializers import (
    UserPointSerializer, PointTransactionSerializer, PointTransactionCreateSerializer
)
from users.models import User

class UserPointAPI(APIView):
    
    def get(self, request):
        """
        사용자 포인트 조회
        """
        user = User.objects.get(id="1")  # request.user로 전환 예정
        user_point, created = UserPoint.objects.get_or_create(user=user)
        serializer = UserPointSerializer(user_point)
        return Response(serializer.data)

class PointTransactionAPI(APIView):
    
    def get(self, request):
        """
        포인트 거래 내역 조회
        """
        user = User.objects.get(id="1")  # request.user로 전환 예정
        transactions = PointTransaction.objects.filter(user=user)
        serializer = PointTransactionSerializer(transactions, many=True)
        return Response(serializer.data)
    
    def post(self, request):
        """
        포인트 거래 생성 (적립/사용)
        """
        user = User.objects.get(id="1")  # request.user로 전환 예정
        serializer = PointTransactionCreateSerializer(data=request.data)
        
        if serializer.is_valid():
            transaction = serializer.save(user=user)
            
            # 사용자 포인트 잔액 업데이트
            user_point, created = UserPoint.objects.get_or_create(user=user)
            user_point.balance += transaction.amount
            user_point.save()
            
            response_serializer = PointTransactionSerializer(transaction)
            return Response(response_serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(["POST"])
def earn_points(request):
    """
    포인트 적립
    """
    user = User.objects.get(id="1")  # request.user로 전환 예정
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
        user=user,
        amount=amount,
        transaction_type="EARN",
        reference_type=reference_type,
        reference_id=reference_id,
        description=description
    )
    
    # 사용자 포인트 잔액 업데이트
    user_point, created = UserPoint.objects.get_or_create(user=user)
    user_point.balance += amount
    user_point.save()
    
    return Response({
        "message": f"{amount}P가 적립되었습니다.",
        "current_balance": user_point.balance
    })

@api_view(["POST"])
def use_points(request):
    """
    포인트 사용
    """
    user = User.objects.get(id="1")  # request.user로 전환 예정
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
    user_point, created = UserPoint.objects.get_or_create(user=user)
    
    if user_point.balance < amount:
        return Response(
            {"error": "보유 포인트가 부족합니다."}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # 포인트 거래 생성 (음수로 저장)
    transaction = PointTransaction.objects.create(
        user=user,
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