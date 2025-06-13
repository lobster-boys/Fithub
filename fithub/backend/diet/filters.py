import django_filters
from django_filters import rest_framework as filters
from django.db import models
from .models import Food

class FoodFilter(django_filters.FilterSet):

    # 칼로리, 단백질 범위 필터
    calories_min = filters.NumberFilter(field_name="calories", lookup_expr='gte')
    calories_max = filters.NumberFilter(field_name="calories", lookup_expr='lte')
    protein_min = filters.NumberFilter(field_name="protein", lookup_expr='gte')
    protein_max = filters.NumberFilter(field_name="protein", lookup_expr='lte')
    
    # 탄수화물과 지방 범위 필터
    carbs_min = filters.NumberFilter(field_name="carbs", lookup_expr='gte')
    carbs_max = filters.NumberFilter(field_name="carbs", lookup_expr='lte')
    fat_min = filters.NumberFilter(field_name="fat", lookup_expr='gte')
    fat_max = filters.NumberFilter(field_name="fat", lookup_expr='lte')
    
    # 날짜 범위 필터
    created_after = filters.DateTimeFilter(field_name='created_at', lookup_expr='gte')
    created_before = filters.DateTimeFilter(field_name='created_at', lookup_expr='lte')
    updated_after = filters.DateTimeFilter(field_name='updated_at', lookup_expr='gte')
    updated_before = filters.DateTimeFilter(field_name='updated_at', lookup_expr='lte')
    
    # 서빙 사이즈(1회 제공량) 필터: 부분 일치 (케이스 무시, icontains)
    serving_size = filters.CharFilter(field_name='serving_size', lookup_expr='icontains')
    
    # 상품 관련 필터
    product_name = filters.CharFilter(field_name='product__name', lookup_expr='icontains')
    product_category = filters.NumberFilter(field_name='product__category__id')
    
    # 복합 검색 필터: 음식 이름, 설명, 제품명 => 하나의 검색어로 검색
    search = filters.CharFilter(method='custom_search')

    class Meta:
        model = Food
        fields = {
            'category': ['exact', 'in'],  # 다중 카테고리 필터 지원
            'name': ['exact', 'icontains'],
            'description': ['icontains'],
        }

    def custom_search(self, queryset, name, value):
        """
        음식 이름, 설명, 상품 이름 내에 검색어가 포함된 항목들을 필터링
        """
        return queryset.filter(
            models.Q(name__icontains=value) |
            models.Q(description__icontains=value) |
            models.Q(product__name__icontains=value)
            # models.Q(category__name__icontains=value) 카테고리명 
        )