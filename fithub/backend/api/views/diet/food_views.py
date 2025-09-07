from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from diet.models import Food, FoodCategory
from ...serializers.diet.food_serializers import FoodSerializer, FoodCreateSerializer, FoodUpdateSerializer, FoodCategorySerializer
from ...permissions import PublicReadOnly


class FoodViewSet(viewsets.ModelViewSet):
    """
    음식 ViewSet
    - list: 음식 목록 조회 (공개)
    - create: 음식 생성 (인증 필요)
    - retrieve: 음식 상세 조회 (공개)
    - update/partial_update: 음식 수정 (소유자만)
    - destroy: 음식 삭제 (소유자만)
    """
    queryset = Food.objects.all()
    permission_classes = [PublicReadOnly]

    def get_serializer_class(self):
        if self.action == 'create':
            return FoodCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return FoodUpdateSerializer
        return FoodSerializer

    def get_queryset(self):
        queryset = Food.objects.select_related('category').all()
        
        # 검색어 필터
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(name__icontains=search)
        
        # 카테고리 필터 (카테고리 이름으로 필터링)
        category = self.request.query_params.get('category')
        if category:
            queryset = queryset.filter(category__name=category)
        
        # 사용자별 필터
        user_only = self.request.query_params.get('user_only')
        if user_only and user_only.lower() == 'true':
            queryset = queryset.filter(user=self.request.user)
            
        return queryset.order_by('name')

    def perform_create(self, serializer):
        """음식 생성 시 현재 사용자를 자동으로 설정"""
        serializer.save(user=self.request.user)

    def destroy(self, request, *args, **kwargs):
        """음식 삭제 - 본인이 추가한 음식만 삭제 가능"""
        food = self.get_object()
        
        if food.user != request.user:
            return Response(
                {"error": "자신이 추가한 음식만 삭제할 수 있습니다."},
                status=status.HTTP_403_FORBIDDEN
            )
        
        food.delete()
        return Response(
            {'detail': '음식이 삭제되었습니다.'},
            status=status.HTTP_204_NO_CONTENT
        )

    @action(detail=False, methods=['get'])
    def categories(self, request):
        """음식 카테고리 목록 조회"""
        categories = FoodCategory.objects.filter(is_active=True).order_by('name')
        serializer = FoodCategorySerializer(categories, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def by_category(self, request):
        """카테고리별 음식 목록 조회"""
        category_name = request.query_params.get('category')
        if not category_name:
            return Response(
                {'error': '카테고리 이름이 필요합니다.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            category = FoodCategory.objects.get(name=category_name, is_active=True)
        except FoodCategory.DoesNotExist:
            return Response(
                {'error': f'카테고리 "{category_name}"를 찾을 수 없습니다.'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        foods = Food.objects.filter(category=category).order_by('name')
        
        # 페이지네이션 적용
        page = self.paginate_queryset(foods)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(foods, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def my_foods(self, request):
        """사용자가 추가한 음식 목록"""
        queryset = Food.objects.filter(user=request.user)
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
            
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def popular(self, request):
        """인기 음식 목록 (추후 사용 빈도 기반으로 구현)"""
        queryset = self.get_queryset()[:20]  # 임시로 상위 20개
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def nutrition_info(self, request, pk=None):
        """음식 영양 정보 상세"""
        food = self.get_object()
        serializer = self.get_serializer(food)
        
        # 영양소 정보를 더 자세히 구성
        nutrition_data = serializer.data
        nutrition_data['detailed_nutrition'] = {
            'macronutrients': {
                'carbohydrates_g': nutrition_data.get('carbs', 0),
                'protein_g': nutrition_data.get('protein', 0),
                'fat_g': nutrition_data.get('fat', 0),
            },
            'calories_per_serving': nutrition_data.get('calories', 0),
            'serving_info': nutrition_data.get('serving_size', ''),
        }
        
        return Response(nutrition_data)
