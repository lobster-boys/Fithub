from django.contrib import admin
from .models import Food

@admin.register(Food)
class FoodAdmin(admin.ModelAdmin):
    # admin 리스트 페이지에 표시될 필드
    list_display = ('name', 'category', 'product', 'calories', 'protein', 'carbs', 'fat', 'serving_size')

    # 필터 사이드바에 표시
    list_filter = ('category', 'product', 'calories')

    # 검색 기능
    search_fields = ('name', 'description')

    # 외래키 항목을 Raw ID로 하여 랜더링 속도 개선
    raw_id_fields = ('user',)

    # 외래키를 자동완성 필드로 사용
    autocomplete_fields = ('category', 'product')

    # 레코드 정렬 옵션: 이름순 정렬 
    ordering = ('name',)

    # 상세 페이지를 그룹화하여 Fieldset으로 가독성을 높임
    fieldsets = (
        (None, {
            'fields': ('name', 'description', 'category', 'product', 'user')
        }),
        ('영양 정보', {
            'fields': (('calories', 'protein', 'carbs', 'fat'), 'serving_size'),
            'description': '1인분 기준 영양 정보 입력'
        }),
    )

    # Admin 페이지에서 개선된 성능을 위해 select_related 사용
    def get_queryset(self, request):
        qs = super().get_queryset(request)
        return qs.select_related('category', 'product')  # 외래키 관계에 대해 최적화

