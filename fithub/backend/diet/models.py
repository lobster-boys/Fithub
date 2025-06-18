from django.db import models
from django.conf import settings
from decimal import Decimal, InvalidOperation
from django.core.exceptions import ValidationError

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
        on_delete=models.CASCADE, # seed 생성할 때 빼고는 PROTECT 사용
        related_name='foods'
        )
    product = models.OneToOneField(
        'ecommerce.Product', 
        on_delete=models.CASCADE, 
        related_name='food_info',
        blank=True,
        null=True) # 커스텀 Food를 위한 blank, null 허용

    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)

    calories = models.DecimalField(max_digits=7, decimal_places=2, help_text='칼로리(Kcal)')
    protein = models.DecimalField(max_digits=7, decimal_places=2, help_text='단백질(g)')
    carbs = models.DecimalField(max_digits=7, decimal_places=2, help_text='탄수화물(g)')
    fat = models.DecimalField(max_digits=7, decimal_places=2, help_text='지방(g)')
    serving_size = models.CharField(max_length=50, help_text='1인분 기준량(예: "100g", "1컵" 등)')
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
    
    def get_standard_serving(self):
        """
        serving_size를 Decimal로 변환
        """
        try:
            quantity_str = self.serving_size.lower().\
                replace(' ', '').\
                replace('g', '').\
                replace('ml', '').\
                replace('kg', '').\
                replace('L', '').\
                replace('개', '').\
                replace('개당', '').\
                replace('조각', '').\
                replace('봉지', '').\
                replace('정', '').\
                replace('캡슐', '').\
                replace('송이', '').\
                strip()
            return Decimal(quantity_str)
        except(InvalidOperation, AttributeError):
            raise ValidationError("serving_size 형식 오류: 숫자+단위(g/ml) 이어야 합니다.")
    
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
    total_calories = models.IntegerField(help_text='일일 총 목표 칼로리', null=True, blank=True)

    class Meta:
        ordering = ['-start_date']
        verbose_name = 'Meal Plan'
        verbose_name_plural = 'Meal Plans'

    def __str__(self):
        return f'{self.name} ({self.user.username})'
    
    def _grams_from_quantity(self, item):
        """
        MealPlanFood.quantity를 실제 gram(혹은 ml)로 환산
        1. food.product.unit_weight_g > 0 ➜ quantity(팩 수) x unit_weight_g
        2. food.product.unit_weight_g = 0 ➜ quantity 자체가 이미 g로 간주
        """
        food = item.food
        product = food.product
        qty = Decimal(item.quantity)

        if product and product.is_food and product.unit_weight_g:
            return qty * Decimal(product.unit_weight_g) # 팩 수 x g
        
        return qty # g로 입력된 경우 

    def calculate_nutrition(self):
        """
        1인분 기준 비율 계산
        연동 상품(unit_weight_g) 있을 때 팩 수 ➜ g 환산
        커스텀 Food 는 product=None 이므로 quantity(g) 그대로 사용
        """
        total_kcal = total_pro = total_carb = total_fat = Decimal(0)

        for item in self.items.select_related('food', 'food__product'):
            food = item.food

            # 실제 섭취 g
            actual_g = self._grams_from_quantity(item)

            # Food.serving_size(예: '100g') 파싱
            try:
                std_g = food.get_standard_serving() # Decimal
            except Exception:
                continue  # 잘못된 serving_size면 건너뜀

            ratio = actual_g / std_g if std_g else Decimal(0)

            # 비율 곱셈
            total_kcal += food.calories * ratio
            total_pro  += food.protein * ratio
            total_carb += food.carbs * ratio
            total_fat  += food.fat * ratio

        self.total_calories = int(total_kcal)
        self.save(update_fields=["total_calories"])

        return {
            "total_calories": int(total_kcal),
            "total_protein": round(total_pro, 2),
            "total_carbs": round(total_carb, 2),
            "total_fat": round(total_fat, 2),
        }


    def calculate_goal_achievement(self):
        """
        사용자의 목표 대비 현재 식단의 달성률을 계산
        """
        nutrition = self.calculate_nutrition()
        profile = self.user.profile

        achievement = {
            "calories_achievement": round((nutrition["total_calories"] / Decimal(profile.target_calories)) * 100, 2) if profile.target_calories else 0,
            "protein_achievement": round((nutrition["total_protein"] / profile.target_protein) * 100, 2) if profile.target_protein else 0,
            "carbs_achievement": round((nutrition["total_carbs"] / profile.target_carbs) * 100, 2) if profile.target_carbs else 0,
            "fat_achievement": round((nutrition["total_fat"] / profile.target_fat) * 100, 2) if profile.target_fat else 0,
        }
        return achievement


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
