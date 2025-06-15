from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from ecommerce.models import Cart, CartItem, Product
from api.serializers.ecommerce.cart_serializers import CartSerializer, CartItemSerializer


class CartViewSet(viewsets.ModelViewSet):
    """
    장바구니 ViewSet
    - 기본 CRUD 작업
    - 내 장바구니 조회
    - 상품 추가 기능
    """
    serializer_class = CartSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """사용자의 장바구니만 조회"""
        return Cart.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        """장바구니 생성 시 현재 사용자를 자동으로 설정"""
        serializer.save(user=self.request.user)

    @action(detail=False, methods=['get'])
    def my_cart(self, request):
        """내 장바구니 조회 (프론트엔드에서 사용)"""
        cart, created = Cart.objects.get_or_create(user=request.user)
        serializer = CartSerializer(cart)
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def add_item(self, request):
        """장바구니에 상품 추가 (프론트엔드에서 사용)"""
        product_id = request.data.get('product_id')
        quantity = request.data.get('quantity', 1)
        
        if not product_id:
            return Response(
                {'error': 'product_id가 필요합니다.'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            product = Product.objects.get(id=product_id, is_active=True)
        except Product.DoesNotExist:
            return Response(
                {'error': '상품을 찾을 수 없습니다.'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        cart, created = Cart.objects.get_or_create(user=request.user)
        
        # 이미 장바구니에 있는 상품인지 확인
        cart_item, item_created = CartItem.objects.get_or_create(
            cart=cart,
            product=product,
            defaults={'quantity': quantity}
        )
        
        if not item_created:
            # 이미 있는 상품이면 수량 증가
            cart_item.quantity += quantity
            cart_item.save()
        
        serializer = CartSerializer(cart)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class CartItemViewSet(viewsets.ModelViewSet):
    """
    장바구니 아이템 ViewSet
    프론트엔드 요구사항에 맞춘 단순화된 버전
    - 기본 CRUD 작업
    """
    serializer_class = CartItemSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """사용자의 장바구니 아이템만 조회"""
        return CartItem.objects.filter(cart__user=self.request.user)







