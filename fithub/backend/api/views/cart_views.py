from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
from rest_framework.response import Response
from ecommerce.models import Cart
from api.serializers.cart_serializers import cartSerializers
from rest_framework.permissions import IsAuthenticated

# 테스트용 유저 불러오기
from users.models import User

class CartAPI(APIView):
    # permission_classes = [IsAuthenticated]
    def get(self, request):
        """
        장바구니 호출
        """
        user = User.objects.get(id="1")
        cart = Cart.objects.get_or_create(user=user)
        serializer = cartSerializers(cart)
        return Response(serializer.data)

    def post(self, request):
        """
        장바구니 상품 추가
        """

