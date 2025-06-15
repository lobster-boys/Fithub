from django.contrib import admin
from .models import Food, MealPlan, MealPlanFood

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

class MealPlanFoodInline(admin.TabularInline):
    """
    MealPlan 편집 화면에 MealPlanFood를 인라인으로 보여줌.
    """
    model = MealPlanFood
    extra = 1
    # food 필드에 raw_id_fields 혹은 autocomplete_fields 적용
    raw_id_fields = ('food',)
    # 만약 Food에 autocomplete_fields 설정이 되어 있다면 아래 주석 해제 가능
    autocomplete_fields = ('food',)
    fields = ('food', 'quantity', 'meal_time')


@admin.register(MealPlan)
class MealPlanAdmin(admin.ModelAdmin):
    list_display = (
        'name',
        'user',
        'start_date',
        'end_date',
        'is_active',
        'total_calories',
    )
    list_filter = (
        'is_active',
        'start_date',
        'end_date',
        'user',
    )
    search_fields = (
        'name',
        'description',
        'user__username',
    )
    raw_id_fields = ('user',)
    fieldsets = (
        (None, {
            'fields': ('user', 'name', 'description'),
        }),
        ('기간 및 목표', {
            'fields': (('start_date', 'end_date'), 'is_active', 'total_calories'),
            'description': '식단 계획의 기간과 일일 칼로리 목표를 입력하세요.'
        }),
    )
    # MealPlan 편집 화면에 MealPlanFood 인라인을 붙입니다.
    inlines = (MealPlanFoodInline,)


@admin.register(MealPlanFood)
class MealPlanFoodAdmin(admin.ModelAdmin):
    list_display = ('meal_plan', 'food', 'quantity', 'meal_time')
    list_filter = ('meal_time', 'meal_plan__user')
    search_fields = ('meal_plan__name', 'food__name')
    raw_id_fields = ('meal_plan', 'food')
