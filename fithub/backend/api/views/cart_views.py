from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from ecommerce.models import Cart, CartItem, Product
from api.serializers.cart_serializers import CartSerializer, CartItemSerializer
from rest_framework.permissions import IsAuthenticated

# 테스트용 유저 불러오기
from users.models import User

class CartAPI(APIView):
    # permission_classes = [IsAuthenticated]

    def get(self, request):
        """
        장바구니 조회
        """
        user = User.objects.get(id="1")  # request.user로 전환 예정
        cart, created = Cart.objects.get_or_create(user=user)
        
        serializer = CartSerializer(cart)
        return Response(serializer.data)

    def post(self, request):
        """
        장바구니에 상품 추가
        """
        try:
            user = User.objects.get(id="1")
            cart, created = Cart.objects.get_or_create(user=user)
            
            product_id = request.data.get("product_id")
            quantity = int(request.data.get("quantity", 1))
            
            product = get_object_or_404(Product, id=product_id)
            
            # 기존 장바구니 아이템이 있는지 확인
            cart_item, created = CartItem.objects.get_or_create(
                cart=cart,
                product=product,
                defaults={
                    'product_name': product.name,
                    'price': product.sale_price or product.price,
                    'quantity': quantity
                }
            )
            
            if not created:
                # 기존 아이템이 있으면 수량 업데이트
                cart_item.quantity += quantity
                if cart_item.quantity <= 0:
                    cart_item.delete()
                    return Response({"message": "상품이 장바구니에서 제거되었습니다."})
                else:
                    cart_item.save()
            
            serializer = CartItemSerializer(cart_item)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            return Response(
                {"error": str(e)}, 
                status=status.HTTP_400_BAD_REQUEST
            )

class CartItemAPI(APIView):
    
    def put(self, request, item_id):
        """
        장바구니 아이템 수량 수정
        """
        try:
            cart_item = get_object_or_404(CartItem, id=item_id)
            quantity = int(request.data.get("quantity", 1))
            
            if quantity <= 0:
                cart_item.delete()
                return Response({"message": "상품이 장바구니에서 제거되었습니다."})
            
            cart_item.quantity = quantity
            cart_item.save()
            
            serializer = CartItemSerializer(cart_item)
            return Response(serializer.data)
            
        except Exception as e:
            return Response(
                {"error": str(e)}, 
                status=status.HTTP_400_BAD_REQUEST
            )
    
    def delete(self, request, item_id):
        """
        장바구니 아이템 삭제
        """
        try:
            cart_item = get_object_or_404(CartItem, id=item_id)
            cart_item.delete()
            return Response(
                {"message": "상품이 장바구니에서 제거되었습니다."}, 
                status=status.HTTP_204_NO_CONTENT
            )
        except Exception as e:
            return Response(
                {"error": str(e)}, 
                status=status.HTTP_400_BAD_REQUEST
            )




