from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from ecommerce.models import Product
from api.serializers.ecommerce.product_serializers import ProductSerializer
from django.shortcuts import get_object_or_404
from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from django.db.models import Q

# Create your views here.
@api_view(["GET", "POST"])
def products(request):
    if request.method == "GET":
        product = Product.objects.all()
        serializer = ProductSerializer(product, many=True)
        return Response(serializer.data)
    
    if request.method == "POST":
        serializer = ProductSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)
    
@api_view(["GET", "PUT", "DELETE"])
def product(request, id):
    product = get_object_or_404(Product, id=id)

    if request.method == "GET":
        serializer = ProductSerializer(product)

        return Response(serializer.data)
    
    elif request.method == "PUT":
        serializer = ProductSerializer(product, data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)
    
    elif request.method == "DELETE":
        product.delete()

        return Response(
            "SUCCESS", status=status.HTTP_204_NO_CONTENT
        )

class ProductViewSet(viewsets.ReadOnlyModelViewSet):
    """
    상품 ViewSet
    프론트엔드 요구사항에 맞춘 단순화된 버전
    - 상품 목록/상세 조회
    - 카테고리별 필터링
    - 검색 기능
    """
    serializer_class = ProductSerializer
    permission_classes = [permissions.IsAuthenticated]
    
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
        
        return queryset.select_related('category').order_by('-created_at')
    
    def list(self, request, *args, **kwargs):
        """상품 목록 조회"""
        return super().list(request, *args, **kwargs)
    
    def retrieve(self, request, *args, **kwargs):
        """상품 상세 조회"""
        return super().retrieve(request, *args, **kwargs)