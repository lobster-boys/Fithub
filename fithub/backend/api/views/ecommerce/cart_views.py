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
        try:
            product_id = request.data.get('product_id')
            quantity = request.data.get('quantity', 1)
            
            print(f"[CartView] 장바구니 추가 요청: user={request.user.username}, product_id={product_id}, quantity={quantity}")
            
            if not product_id:
                return Response(
                    {'error': 'product_id가 필요합니다.'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            try:
                product = Product.objects.get(id=product_id, is_active=True)
                print(f"[CartView] 상품 찾기 성공: {product.name}, price={product.price}, sale_price={product.sale_price}")
            except Product.DoesNotExist:
                print(f"[CartView] 상품을 찾을 수 없음: product_id={product_id}")
                return Response(
                    {'error': '상품을 찾을 수 없습니다.'}, 
                    status=status.HTTP_404_NOT_FOUND
                )
            
            cart, created = Cart.objects.get_or_create(user=request.user)
            print(f"[CartView] 장바구니 생성/조회: cart_id={cart.id}, created={created}")
            
            # 실제 판매가격 계산 (할인가가 있으면 할인가, 없으면 원가)
            actual_price = product.sale_price if product.sale_price and product.sale_price > 0 else product.price
            print(f"[CartView] 계산된 실제 가격: {actual_price}")
            
            # 이미 장바구니에 있는 상품인지 확인
            cart_item, item_created = CartItem.objects.get_or_create(
                cart=cart,
                product=product,
                defaults={
                    'quantity': quantity,
                    'product_name': product.name,  # 상품명 설정
                    'price': actual_price          # 실제 판매가격 설정
                }
            )
            
            print(f"[CartView] CartItem 생성/조회: item_id={cart_item.id}, created={item_created}, quantity={cart_item.quantity}")
            
            if not item_created:
                # 이미 있는 상품이면 수량 증가하고 최신 가격으로 업데이트
                old_quantity = cart_item.quantity
                cart_item.quantity += quantity
                cart_item.price = actual_price  # 가격 업데이트
                cart_item.save()
                print(f"[CartView] 수량 업데이트: {old_quantity} -> {cart_item.quantity}")
            
            serializer = CartSerializer(cart)
            print(f"[CartView] 장바구니 추가 성공")
            return Response(serializer.data, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            print(f"[CartView] 예상치 못한 오류: {str(e)}")
            import traceback
            traceback.print_exc()
            return Response(
                {'error': f'서버 오류가 발생했습니다: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class CartItemViewSet(viewsets.ModelViewSet):
    """
    장바구니 아이템 ViewSet
    - 기본 CRUD 작업
    """
    serializer_class = CartItemSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """사용자의 장바구니 아이템만 조회"""
        return CartItem.objects.filter(cart__user=self.request.user)







