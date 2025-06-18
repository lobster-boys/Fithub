from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action, api_view
from rest_framework.response import Response
from ecommerce.models import Product
from api.serializers.ecommerce.product_serializers import ProductSerializer
from django.db.models import Q

# Create your views here.
@api_view(["GET", "POST"])
def products(request):
    """레거시 호환: ProductViewSet.list()로 redirect"""
    viewset = ProductViewSet()
    viewset.request = request
    if request.method == "GET":
        return viewset.list(request)
    elif request.method == "POST":
        return viewset.create(request)

@api_view(["GET", "PUT", "DELETE"])
def product(request, id):
    """레거시 호환: ProductViewSet.retrieve/update/destroy로 redirect"""
    viewset = ProductViewSet()
    viewset.request = request
    if request.method == "GET":
        return viewset.retrieve(request, pk=id)
    elif request.method == "PUT":
        return viewset.update(request, pk=id)
    elif request.method == "DELETE":
        return viewset.destroy(request, pk=id)

class ProductViewSet(viewsets.ModelViewSet):
    """
    상품 ViewSet
    - 기본 CRUD 작업
    - 카테고리별 필터링
    - 검색 기능
    """
    serializer_class = ProductSerializer
    permission_classes = [permissions.AllowAny]  # 개발 테스트용 - 나중에 IsAuthenticated로 변경
    
    def get_queryset(self):
        """상품 목록 조회 (필터링 지원)"""
        queryset = Product.objects.filter(is_active=True)
        
        # 카테고리 필터링 (프론트엔드에서 사용)
        category_id = self.request.query_params.get('category')
        if category_id:
            queryset = queryset.filter(category_id=category_id)
        
        # 검색 (프론트엔드에서 사용)
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) | 
                Q(description__icontains=search)
            )
        
        # 가격 범위 필터링
        min_price = self.request.query_params.get('min_price')
        max_price = self.request.query_params.get('max_price')
        if min_price:
            queryset = queryset.filter(price__gte=min_price)
        if max_price:
            queryset = queryset.filter(price__lte=max_price)
        
        return queryset.select_related('category').order_by('-id')
    
    @action(detail=False, methods=['get'])
    def search(self, request):
        """상품 검색"""
        queryset = self.get_queryset()
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)