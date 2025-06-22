# diet/admin.py (최소 설정)
from django.contrib import admin
from .models import Food, FoodCategory, MealPlan, MealPlanFood, RecommendHistory, DietLog

# FoodCategory Admin 등록
@admin.register(FoodCategory)
class FoodCategoryAdmin(admin.ModelAdmin):
    search_fields = ['name'] 
    list_display = ['name', 'is_active']

# 나머지 모델들도 기본 등록
admin.site.register(Food)
admin.site.register(MealPlan)
admin.site.register(MealPlanFood)
admin.site.register(RecommendHistory)
admin.site.register(DietLog)
