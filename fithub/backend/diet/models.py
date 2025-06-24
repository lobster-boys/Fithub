import re
from django.db import models
from django.conf import settings
from decimal import Decimal, InvalidOperation
from django.utils import timezone
from datetime import timedelta

# 임의로 사전에 g를 정의(외부 영양 api를 받으면 대체)
UNIT_TO_G = {
    '봉지': 120,
    '조각': 40,
    '개당': 118,
    '개':   118,
    '정':   1,
    '캡슐': 1,
    '송이': 250,
    'kg':   1000,
    'g':    1,
    'ml':   1,
    'l':    1000,
}

# 순수 음식 카테고리 모델 (ecommerce와 분리)
class FoodCategory(models.Model):
    name = models.CharField(max_length=50, unique=True)
    description = models.TextField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'diet_food_category'
        verbose_name = '음식 카테고리'
        verbose_name_plural = '음식 카테고리'
    
    def __str__(self):
        return self.name
    
# 추천 이력 테이블
class RecommendHistory(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='recommend_histories'
    )
    food = models.ForeignKey(
        'Food',
        on_delete=models.CASCADE,
        related_name='recommend_histories'
    )
    meal_type = models.CharField(
        max_length=10,
        choices=[
            ('breakfast', '아침'),
            ('lunch', '점심'),
            ('dinner', '저녁'),
        ]
    )
    recommended_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'diet_recommend_history'
        indexes = [
            models.Index(fields=['user', 'meal_type', 'recommended_at']),
        ]
    
    def __str__(self):
        return f"{self.user.username} - {self.food.name} ({self.meal_type})"
    
    @classmethod
    def get_food_recommendation_frequency(cls, user, food_id, days=30):
        """특정 음식의 최근 추천 빈도 조회"""
        cutoff_date = timezone.now() - timedelta(days=days)
        return cls.objects.filter(
            user=user,
            food_id=food_id,
            recommended_at__gte=cutoff_date
        ).count()
    
    @classmethod
    def get_frequently_recommended_foods(cls, user, meal_type, days=30, threshold=3):
        """자주 추천된 음식들 조회"""
        from django.db.models import Count
        
        cutoff_date = timezone.now() - timedelta(days=days)
        frequent_foods = cls.objects.filter(
            user=user,
            meal_type=meal_type,
            recommended_at__gte=cutoff_date
        ).values('food_id').annotate(
            count=Count('food_id')
        ).filter(count__gte=threshold).values_list('food_id', flat=True)
        
        return list(frequent_foods)
    
# 식단 기록 테이블
class DietLog(models.Model):
    MEAL_TYPE_CHOICES = [
        ('breakfast', '아침'),
        ('lunch', '점심'),
        ('dinner', '저녁'),
        ('snack', '간식'),
    ]
    
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='diet_logs'
    )
    food = models.ForeignKey(
        'Food',
        on_delete=models.CASCADE,
        related_name='diet_logs'
    )
    date = models.DateField()
    meal_type = models.CharField(max_length=10, choices=MEAL_TYPE_CHOICES)
    calories = models.DecimalField(max_digits=7, decimal_places=2)
    quantity = models.DecimalField(max_digits=7, decimal_places=2, help_text='섭취량(g)')
    recommended_at = models.DateTimeField(null=True, blank=True, help_text='추천 기반 식단 여부')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'diet_log'
        indexes = [
            models.Index(fields=['user', 'date', 'meal_type']),
        ]
        unique_together = ('user', 'food', 'date', 'meal_type')
    
    def __str__(self):
        return f"{self.user.username} - {self.food.name} ({self.date} {self.meal_type})"
    

class Food(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.CASCADE,
        related_name='custom_foods'
    )
    category = models.ForeignKey(
        'FoodCategory', # FoodCategory로 변경
        on_delete=models.PROTECT,
        related_name='foods',
        blank=True,
        null=True
    )
    product = models.OneToOneField(
        'ecommerce.Product',
        on_delete=models.CASCADE,
        related_name='food_info',
        blank=True,
        null=True
    )
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    calories = models.DecimalField(max_digits=7, decimal_places=2, help_text='칼로리(Kcal)')
    protein = models.DecimalField(max_digits=7, decimal_places=2, help_text='단백질(g)')
    carbs = models.DecimalField(max_digits=7, decimal_places=2, help_text='탄수화물(g)')
    fat = models.DecimalField(max_digits=7, decimal_places=2, help_text='지방(g)')
    serving_size = models.CharField(max_length=50, help_text='1인분 기준량(예: "100g", "1컵" 등)')
    
    # 공공 API 데이터 구분을 위한 필드 추가
    is_public_data = models.BooleanField(default=False, help_text='공공 API에서 가져온 데이터 여부')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'diet_food'
        indexes = [
            models.Index(fields=['name'], name='idx_food_name'),
            models.Index(fields=['is_public_data'], name='idx_food_is_public_data'),
        ]
        constraints = [
            models.CheckConstraint(
                check=(
                    # 공공 API 데이터는 user=None, product=None 허용
                    models.Q(is_public_data=True) |
                    # 일반 데이터는 user 또는 product 중 하나는 필수
                    (models.Q(is_public_data=False) & 
                     (models.Q(user__isnull=False) | models.Q(product__isnull=False)))
                ),
                name='ck_food_user_or_product_not_null'
            ),
        ]

    def __str__(self):
        return self.name
    

    def get_standard_serving(self):
        """
        serving_size를 Decimal로 변환
        - '100g' 또는 '250 ml' 등은 해당 숫자에 UNIT_TO_G 곱
        - '1봉지', '2조각', '1개' 등은 사전에 정의된 UNIT_TO_G 값을 곱하여 반환
        실패 시 ValidationError.
        """
        raw = (self.serving_size or '').lower().replace(' ', '')
        
        # 빈 값 처리
        if not raw:
            return Decimal('100')  # 기본값 100g
        
        try:
            # g/ml/kg/l 단위 처리
            for unit in ('kg', 'g', 'ml', 'l'):
                if raw.endswith(unit):
                    num_str = raw[:-len(unit)] or '1'
                    num = Decimal(re.sub(r'[^\d.]', '', num_str) or '1')
                    return num * UNIT_TO_G[unit]
            
            # 한글 단위 환산
            for unit, grams in UNIT_TO_G.items():
                if raw.endswith(unit):
                    num_str = raw[:-len(unit)] or '1'
                    num = Decimal(re.sub(r'[^\d.]', '', num_str) or '1') 
                    return num * grams
            
            # 숫자만 있는 경우 (단위 없음)
            num_only = re.sub(r'[^\d.]', '', raw)
            if num_only:
                return Decimal(num_only)
            
            # 기본값 반환
            return Decimal('100')
            
        except (InvalidOperation, ValueError, TypeError):
            return Decimal('100')  # 파싱 실패시 기본값


class MealPlan(models.Model):
    GOAL_TYPE_CHOICES = [
        ('weight_loss', '체중 감량'),
        ('muscle_gain', '근육 증가'),
        ('maintenance', '체중 유지'),
        ('endurance', '지구력 향상'),
        ('strength', '근력 향상'),
        ('health', '건강 관리'),
    ]
    
    DIFFICULTY_CHOICES = [
        ('easy', '쉬움'),
        ('medium', '보통'),
        ('hard', '어려움'),
    ]

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
    
    # 공개/비공개 및 추천 관련 필드 추가
    is_public = models.BooleanField(default=False, help_text='다른 사용자에게 공개 여부')
    is_recommended = models.BooleanField(default=False, help_text='추천 식단으로 사용 가능 여부')
    target_goal = models.CharField(
        max_length=20, 
        choices=GOAL_TYPE_CHOICES, 
        blank=True, 
        null=True,
        help_text='목표 운동 목적'
    )
    target_calories_min = models.IntegerField(blank=True, null=True, help_text='권장 최소 칼로리')
    target_calories_max = models.IntegerField(blank=True, null=True, help_text='권장 최대 칼로리')
    difficulty = models.CharField(
        max_length=10, 
        choices=DIFFICULTY_CHOICES, 
        default='medium',
        help_text='식단 난이도'
    )
    
    # 메타데이터
    views_count = models.PositiveIntegerField(default=0, help_text='조회수')
    likes_count = models.PositiveIntegerField(default=0, help_text='좋아요 수')
    created_at = models.DateTimeField(auto_now_add=True, null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True, null=True, blank=True)

    class Meta:
        ordering = ['-start_date']
        verbose_name = 'Meal Plan'
        verbose_name_plural = 'Meal Plans'

    def __str__(self):
        return f'{self.name} ({self.user.username})'
    
    def increment_views(self):
        """조회수 증가"""
        self.views_count += 1
        self.save(update_fields=['views_count'])
    
    def is_suitable_for_user(self, user_profile):
        """사용자 프로필에 적합한 식단인지 확인"""
        if not user_profile:
            return True
            
        # 목표 일치 확인
        if self.target_goal and user_profile.fitness_goal:
            if self.target_goal != user_profile.fitness_goal:
                return False
        
        # 칼로리 범위 확인
        if user_profile.target_calories:
            if self.target_calories_min and user_profile.target_calories < self.target_calories_min:
                return False
            if self.target_calories_max and user_profile.target_calories > self.target_calories_max:
                return False
        
        return True
    
    def _grams_from_quantity(self, item):
        """
        MealPlanFood.quantity를 실제 gram(혹은 ml)로 환산
        quantity는 항상 "인분 수"를 의미함 (1 = 1인분)
        1. 공공 API 데이터(is_public_data=True): quantity(인분수) × serving_size
        2. 상품 연동 데이터: quantity(팩 수) × unit_weight_g
        3. 사용자 커스텀 데이터: quantity(인분수) × serving_size
        """
        food = item.food
        product = food.product
        qty = Decimal(item.quantity)
        
        # 공공 API 데이터인 경우: quantity를 인분 수로 해석
        if food.is_public_data:
            try:
                serving_g = food.get_standard_serving()  # 예: 200g
                return qty * serving_g  # quantity(인분수) × 1인분 크기(g)
            except Exception:
                return qty * Decimal('100')  # 파싱 실패시 100g로 기본값
        
        # 상품 연동 데이터인 경우: 팩 수 × 단위 중량
        if product and product.is_food and product.unit_weight_g:
            return qty * Decimal(product.unit_weight_g)
        
        # 사용자 커스텀 데이터인 경우: quantity를 인분 수로 해석
        try:
            serving_g = food.get_standard_serving()  # 예: 100g
            return qty * serving_g  # quantity(인분수) × 1인분 크기(g)
        except Exception:
            return qty * Decimal('100')  # 파싱 실패시 100g로 기본값

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
                std_g = food.get_standard_serving()
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


class MealPlanLike(models.Model):
    """식단 계획 좋아요"""
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='meal_plan_likes'
    )
    meal_plan = models.ForeignKey(
        MealPlan,
        on_delete=models.CASCADE,
        related_name='likes'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'diet_meal_plan_like'
        unique_together = ('user', 'meal_plan')
        verbose_name = 'Meal Plan Like'
        verbose_name_plural = 'Meal Plan Likes'

    def __str__(self):
        return f'{self.user.username} likes {self.meal_plan.name}'
