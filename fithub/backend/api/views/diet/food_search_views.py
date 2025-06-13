# diet/views/food_search_views.py
from rest_framework import generics, filters
from django_filters.rest_framework import DjangoFilterBackend
from diet.models import Food
from ...serializers.diet.food_serializers import FoodSerializer
from diet.filters import FoodFilter

"""
- 기본 검색(이름, 설명, 상품명)
GET /api/diet/foods/search/?search=apple

- 칼로리 범위 필터링
GET /api/diet/foods/search/?calories_min=100&calories_max=300

- 단백질, 탄수화물, 지방 범위 필터링
GET /api/diet/foods/search/?protein_min=5&protein_max=20&carbs_min=30&carbs_max=50&fat_min=0&fat_max=10

- 날짜 기준 필터링 (생성일/수정일)
GET /api/diet/foods/search/?created_after=2025-05-30T00:00:00&created_before=2025-06-11T23:59:59

- 상품 및 카테고리 관련 필터
GET /api/diet/foods/search/?product_name=juice&product_category=2

- 정렬 옵션 추가 (예: 칼로리 오름차순, 최신순 등)
GET /api/diet/foods/search/?ordering=calories
GET /api/diet/foods/search/?ordering=-created_at (내림차순)

- 쿼리 스트링 조합
* 'apple'이 포함되면서 칼로리가 100~300인 음식들을 최근 생성된 순으로 정렬
GET /api/diet/foods/search/?search=apple&calories_min=100&calories_max=300&ordering=-created_at
"""

class FoodSearchListView(generics.ListAPIView):
    queryset = Food.objects.all()
    serializer_class = FoodSerializer

    # 필터, 검색, 정렬 백엔드 추가
    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter
    ]
    filterset_class = FoodFilter  # 커스텀 필터 클래스 지정

    # SearchFilter에서 사용할 필드들 
    search_fields = [
        'name', 
        'description', 
        'product__name', 
        'category__name'
    ]
    
    # OrderingFilter에서 사용할 필드들
    ordering_fields = [
        'created_at', 
        'updated_at', 
        'calories', 
        'protein', 
        'carbs', 
        'fat'
    ]
    ordering = ['-created_at']  # 기본 정렬 옵션