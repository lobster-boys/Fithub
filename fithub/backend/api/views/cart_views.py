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
        user = User.objects.get(id="1") # request.user로 전환 예정
        cart, created = Cart.objects.get_or_create( 
            # 리턴값이 카트 객체와 생성인지 호출인지 같이 리턴된다. (<Cart: {}>, False)
            user=user,
            defaults={"cart_items": "{}"} # 생성될때 defaults 값 설정
            )
        

        serializer = CartSerializers(cart)
        return Response(serializer.data)

    def post(self, request):
        """
        장바구니 상품 추가
        """
        try:
            user = User.objects.get(id="1")
            cart = Cart.objects.get(user=user)

            cart_items = json.loads(cart.cart_items)
            
            product_id = str(request.data.get("product_id"))
            quantity = int(request.data.get("quantity"))

            if product_id in cart_items:
                # 상품이 카트에 존재할때 갯수 추가
                cart_items[product_id]["quantity"] += quantity
                if cart_items[product_id]["quantity"] <= 0: 
                    # 0 아래로 내려갈 시에 상품 제거
                    del cart_items[product_id]
            else:
                # 상품이 없을때 해당 상품 번호의 딕셔너리 생성
                cart_items[product_id] = {
                    "quantity": quantity,
                }
            
            cart.cart_items = json.dumps(cart_items)
            cart.save()

            return Response("POST 성공")
        except:
            return Response("POST 실패")




