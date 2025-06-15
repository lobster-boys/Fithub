from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from ecommerce.models import Category
from api.serializers.ecommerce.category_serializers import CategorySerializer
from django.shortcuts import get_object_or_404
from rest_framework import viewsets, permissions
from rest_framework.decorators import action

# Create your views here.
@api_view(["GET", "POST"])
def categories(request):
    if request.method == "GET":
        category = Category.objects.all()
        serializer = CategorySerializer(category, many=True)
        return Response(serializer.data)
    
    if request.method == "POST":
        serializer = CategorySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)
    
@api_view(["GET", "PUT", "DELETE"])
def category(request, id):
    category = get_object_or_404(Category, id=id)

    if request.method == "GET":
        serializer = CategorySerializer(category)

        return Response(serializer.data)
    
    elif request.method == "PUT":
        serializer = CategorySerializer(category, data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)
    
    elif request.method == "DELETE":
        category.delete()

        return Response(
            "SUCCESS", status=status.HTTP_204_NO_CONTENT
        )

class CategoryViewSet(viewsets.ModelViewSet):
    """
    카테고리 ViewSet
    - list: 카테고리 목록 조회
    - create: 카테고리 생성
    - retrieve: 카테고리 상세 조회
    - update/partial_update: 카테고리 수정
    - destroy: 카테고리 삭제
    """
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=True, methods=['get'])
    def products(self, request, pk=None):
        """특정 카테고리의 상품 목록"""
        category = self.get_object()
        # 추후 Product 모델과 연결 시 구현
        return Response({
            'category': CategorySerializer(category).data,
            'products': []  # 임시
        })

    @action(detail=False, methods=['get'])
    def tree(self, request):
        """카테고리 트리 구조 (계층형)"""
        # 부모-자식 관계가 있다면 트리 구조로 반환
        categories = self.get_queryset()
        serializer = self.get_serializer(categories, many=True)
        return Response(serializer.data)