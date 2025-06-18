from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from ecommerce.models import Category
from api.serializers.ecommerce.category_serializers import CategorySerializer

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
    permission_classes = [permissions.AllowAny]  # 개발 테스트용 - 나중에 IsAuthenticated로 변경

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

# 하위 호환성을 위한 레거시 뷰 함수들 (ViewSet으로 redirect)
from rest_framework.decorators import api_view

@api_view(['GET', 'POST'])
def categories(request):
    """레거시 호환: CategoryViewSet.list()로 redirect"""
    viewset = CategoryViewSet()
    viewset.request = request
    if request.method == "GET":
        return viewset.list(request)
    elif request.method == "POST":
        return viewset.create(request)

@api_view(['GET', 'PUT', 'DELETE'])
def category(request, id):
    """레거시 호환: CategoryViewSet.retrieve/update/destroy로 redirect"""
    viewset = CategoryViewSet()
    viewset.request = request
    if request.method == "GET":
        return viewset.retrieve(request, pk=id)
    elif request.method == "PUT":
        return viewset.update(request, pk=id)
    elif request.method == "DELETE":
        return viewset.destroy(request, pk=id)