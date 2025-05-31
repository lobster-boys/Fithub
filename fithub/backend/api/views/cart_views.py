from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
from rest_framework.response import Response
from ecommerce.models import Cart
from api.serializers.cart_serializers import CartSerializers
from rest_framework.permissions import IsAuthenticated
import json

# 테스트용 유저 불러오기
from users.models import User

class CartAPI(APIView):
    # permission_classes = [IsAuthenticated]

    def get(self, request):
        """
        장바구니 호출
        """
        user = User.objects.get(id="1")
        cart = Cart.objects.get_or_create(
            user=user,
            defaults={"cart_items": "{}"}
            )
        serializer = CartSerializers(cart)
        return Response(serializer.data)

    def post(self, request):
        """
        장바구니 상품 추가
        """
        print(request.data)
        try:
            user = User.objects.get(id="1")
            cart = Cart.objects.get(user=user)

            cart_items = json.loads(cart.cart_items)

            product_id = request.data.get("product_id")
            quantity = int(request.data.get("quantity"))

            if product_id in cart_items:
                cart_items[product_id]["quantity"] += quantity
            else:
                cart_items[product_id] = {
                    "quantity": quantity,
                }
            
            cart.cart_items = json.dumps(cart_items)
            cart.save()
            return Response("POST 성공")
        except:
            return Response("POST 실패")




