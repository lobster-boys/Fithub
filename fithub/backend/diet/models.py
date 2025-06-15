from django.db import models
from django.conf import settings
from django.db.models import Sum, F, DecimalField
from decimal import Decimal

class Food(models.Model):

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        null=True, 
        blank=True,  
        on_delete=models.CASCADE, 
        related_name='custom_foods'
        )
    category = models.ForeignKey(
        'ecommerce.Category', 
        on_delete=models.PROTECT, 
        related_name='foods'
        )
    product = models.OneToOneField(
        'ecommerce.Product', 
        on_delete=models.CASCADE, 
        related_name='food_info')

    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)

    calories = models.DecimalField(max_digits=7, decimal_places=2, help_text='칼로리(Kcal)')
    protein = models.DecimalField(max_digits=7, decimal_places=2, help_text='단백질(g)')
    carbs = models.DecimalField(max_digits=7, decimal_places=2, help_text='탄수화물(g)')
    fat = models.DecimalField(max_digits=7, decimal_places=2, help_text='지방(g)')
    serving_size = models.CharField(max_length=50, help_text='1인분 기준량(예: "100g": "1컵")')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'diet_food'
        indexes = [
            models.Index(fields=['name'], name='idx_food_name')
        ]
        # 사용자와 제품 중 하나는 반드시 존재해야 한다.
        constraints = [
            models.CheckConstraint(
                check=(
                    models.Q(user__isnull=False) 
                    | models.Q(product__isnull=False)
                ),
                name = 'ck_food_user_or_product_not_null'
            ),
        ]

    def __str__(self):
        return self.name
    
class MealPlan(models.Model):

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='meal_plans'
    )
    name = models.CharField(max_length=100, help_text='식단 계획 이름')
    description = models.TextField(blank=True, null=True, help_text='식단 계획 설명')
    start_date = models.DateField(help_text='식단 시작일')
    end_date = models.DateField(help_text='식단 종료일')
    is_active = models.BooleanField(default=False, help_text='현재 활성화된 식단 여부')
    total_calories = models.IntegerField(help_text='일일 총 목표 칼로리')

    class Meta:
        ordering = ['-start_date']
        verbose_name = 'Meal Plan'
        verbose_name_plural = 'Meal Plans'

    def __str__(self):
        return f'{self.name} ({self.user.username})'

    def calculate_total_calories(self):
        """
        현재 식단 계획에 연결된 모든 MealPlanFood 항목의
        (Food.calories * quancity) 값을 합산하여 total_calories 필드에 업데이트
        """
        result = self.items.aggregate(
            total=Sum(F('quantity') * F('food__calories'), output_field=DecimalField())
        )
        # total_calories는 IntegerField이므로, 반올림 또는 정수 변환 후 저장
        total = result.get('total') or Decimal(0)

        self.total_calories = int(total)
        self.save(update_fields=['total_calories'])
        return self.total_calories

class MealPlanFood(models.Model):

    MEAL_TIME_CHOICES = [
        ('breakfast', '아침'),
        ('lunch',     '점심'),
        ('dinner',    '저녁'),
        ('snack',     '간식'),
    ]

    meal_plan = models.ForeignKey(
        MealPlan,
        on_delete=models.CASCADE,
        related_name='items',
        help_text='연결된 식단 계획'
    )
    food = models.ForeignKey(
        'diet.Food',
        on_delete=models.CASCADE,
        related_name='meal_plan_entries',
        help_text='식단에 포함된 음식'
    )
    quantity = models.DecimalField(
        max_digits=7,
        decimal_places=2,
        help_text='식품 양 (g 또는 ml, 갯수)'
    )
    meal_time = models.CharField(
        max_length=10,
        choices=MEAL_TIME_CHOICES,
        help_text='식사 유형'
    )

    class Meta:
        unique_together = ('meal_plan', 'food', 'meal_time') # 중복 입력 방지
        ordering = ['meal_plan', 'meal_time']
        verbose_name = 'Meal Plan Food'
        verbose_name_plural = 'Meal Plan Foods'

    def __str__(self):
        return f'{self.meal_plan.name} - {self.get_meal_time_display()} : {self.food.name}'
