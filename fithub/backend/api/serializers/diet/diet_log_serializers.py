from rest_framework import serializers
from django.db import transaction
from django.utils import timezone
from diet.models import DietLog, Food
from decimal import Decimal

class FoodBasicSerializer(serializers.ModelSerializer):
    """DietLog에서 사용할 기본 Food 정보"""
    category_name = serializers.StringRelatedField(source='category', read_only=True)
    
    class Meta:
        model = Food
        fields = ['id', 'name', 'calories', 'protein', 'carbs', 'fat', 'serving_size', 'category_name']

class DietLogSerializer(serializers.ModelSerializer):
    """DietLog 조회용 serializer"""
    food = FoodBasicSerializer(read_only=True)
    user_name = serializers.StringRelatedField(source='user.username', read_only=True)
    meal_type_display = serializers.CharField(source='get_meal_type_display', read_only=True)
    is_recommended = serializers.SerializerMethodField()
    
    class Meta:
        model = DietLog
        fields = [
            'id', 'user_name', 'food', 'date', 'meal_type', 'meal_type_display',
            'calories', 'quantity', 'is_recommended', 'recommended_at', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']
    
    def get_is_recommended(self, obj):
        """추천 기반 식단인지 여부"""
        return obj.recommended_at is not None

class DietLogCreateSerializer(serializers.ModelSerializer):
    """수동 DietLog 생성용 serializer"""
    food_id = serializers.PrimaryKeyRelatedField(
        source='food', 
        queryset=Food.objects.all(),
        write_only=True
    )
    
    class Meta:
        model = DietLog
        fields = ['food_id', 'date', 'meal_type', 'quantity']
        
    def validate_meal_type(self, value):
        if value not in ['breakfast', 'lunch', 'dinner', 'snack']:
            raise serializers.ValidationError("meal_type은 breakfast, lunch, dinner, snack 중 하나여야 합니다.")
        return value
    
    def validate_quantity(self, value):
        if value <= 0:
            raise serializers.ValidationError("섭취량은 0보다 커야 합니다.")
        return value
    
    def create(self, validated_data):
        # 사용자 자동 할당
        user = self.context['request'].user
        food = validated_data['food']
        quantity = validated_data['quantity']
        
        # 칼로리 계산 (food.calories는 serving_size 기준)
        try:
            serving_g = food.get_standard_serving()
            ratio = quantity / serving_g if serving_g > 0 else 0
            calculated_calories = food.calories * ratio
        except Exception:
            calculated_calories = 0
        
        return DietLog.objects.create(
            user=user,
            calories=calculated_calories,
            recommended_at=None,  # 수동 생성은 추천 기반 아님
            **validated_data
        )

class DietLogUpdateSerializer(serializers.ModelSerializer):
    """DietLog 수정용 serializer"""
    
    class Meta:
        model = DietLog
        fields = ['quantity', 'meal_type']
        
    def validate_quantity(self, value):
        if value <= 0:
            raise serializers.ValidationError("섭취량은 0보다 커야 합니다.")
        return value
    
    def update(self, instance, validated_data):
        # quantity가 변경되면 칼로리 재계산
        if 'quantity' in validated_data:
            food = instance.food
            new_quantity = validated_data['quantity']
            
            try:
                serving_g = food.get_standard_serving()
                ratio = new_quantity / serving_g if serving_g > 0 else 0
                instance.calories = food.calories * ratio
            except Exception:
                pass  # 계산 실패시 기존 칼로리 유지
        
        # 다른 필드 업데이트
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        instance.save()
        return instance

class RecommendationItemSerializer(serializers.Serializer):
    """추천 기반 DietLog 생성을 위한 입력 serializer"""
    food_id = serializers.IntegerField()
    quantity = serializers.DecimalField(max_digits=7, decimal_places=2)
    meal_type = serializers.ChoiceField(choices=['breakfast', 'lunch', 'dinner'])
    
    def validate_food_id(self, value):
        try:
            Food.objects.get(id=value)
        except Food.DoesNotExist:
            raise serializers.ValidationError(f"ID {value}에 해당하는 음식이 존재하지 않습니다.")
        return value
    
    def validate_quantity(self, value):
        if value <= 0:
            raise serializers.ValidationError("섭취량은 0보다 커야 합니다.")
        return value

class DietLogFromRecommendationSerializer(serializers.Serializer):
    """추천 기반 DietLog 생성용 serializer"""
    recommendations = RecommendationItemSerializer(many=True)
    date = serializers.DateField()
    
    def validate_recommendations(self, value):
        if not value:
            raise serializers.ValidationError("추천 항목이 비어있습니다.")
        return value
    
    @transaction.atomic
    def create(self, validated_data):
        user = self.context['request'].user
        recommendations = validated_data['recommendations']
        date = validated_data['date']
        recommended_at = timezone.now()
        
        created_logs = []
        
        for item in recommendations:
            food = Food.objects.get(id=item['food_id'])
            quantity = item['quantity']
            meal_type = item['meal_type']
            
            # 칼로리 계산
            try:
                serving_g = food.get_standard_serving()
                ratio = quantity / serving_g if serving_g > 0 else 0
                calculated_calories = food.calories * ratio
            except Exception:
                calculated_calories = 0
            
            # 중복 체크 및 생성/업데이트
            diet_log, created = DietLog.objects.update_or_create(
                user=user,
                food=food,
                date=date,
                meal_type=meal_type,
                defaults={
                    'quantity': quantity,
                    'calories': calculated_calories,
                    'recommended_at': recommended_at
                }
            )
            
            created_logs.append(diet_log)
        
        return created_logs


class MealFoodItemSerializer(serializers.Serializer):
    """식사 내 개별 음식 항목"""
    food_id = serializers.IntegerField()
    # 프론트에서 숫자(float)로 전달돼도 허용하도록 FloatField 사용
    quantity = serializers.FloatField()
    
    def validate_food_id(self, value):
        try:
            Food.objects.get(id=value)
        except Food.DoesNotExist:
            raise serializers.ValidationError(f"ID {value}에 해당하는 음식이 존재하지 않습니다.")
        return value
    
    def validate_quantity(self, value):
        try:
            numeric_val = float(value)
        except (TypeError, ValueError):
            raise serializers.ValidationError("수량은 숫자여야 합니다.")

        if numeric_val <= 0:
            raise serializers.ValidationError("섭취량은 0보다 커야 합니다.")

        # 소수점 둘째자리까지 반올림하여 반환
        return round(numeric_val, 2)


class MealLogCreateSerializer(serializers.Serializer):
    """복수 음식이 포함된 식사 기록 생성용 serializer"""
    meal_name = serializers.CharField(max_length=200, required=False)
    meal_time = serializers.ChoiceField(choices=['breakfast', 'lunch', 'dinner', 'snack'])
    date = serializers.DateField()
    foods = MealFoodItemSerializer(many=True)
    notes = serializers.CharField(max_length=500, required=False, allow_blank=True)
    
    def validate_meal_time(self, value):
        if value not in ['breakfast', 'lunch', 'dinner', 'snack']:
            raise serializers.ValidationError("meal_time은 breakfast, lunch, dinner, snack 중 하나여야 합니다.")
        return value
    
    def validate_foods(self, value):
        if not value:
            raise serializers.ValidationError("최소 하나의 음식을 추가해야 합니다.")
        return value
    
    @transaction.atomic
    def create(self, validated_data):
        user = self.context['request'].user
        foods_data = validated_data.pop('foods')
        meal_time = validated_data['meal_time']
        date = validated_data['date']
        notes = validated_data.get('notes', '')
        
        created_logs = []
        
        for food_data in foods_data:
            food = Food.objects.get(id=food_data['food_id'])
            quantity = food_data['quantity']

            # 계산을 위해 Decimal 변환
            try:
                qty_dec = Decimal(str(quantity))
            except Exception:
                qty_dec = Decimal('0')

            # 칼로리 계산
            try:
                serving_g = food.get_standard_serving()  # Decimal 반환
                ratio = qty_dec / serving_g if serving_g > 0 else Decimal('0')
                calculated_calories = food.calories * ratio
            except Exception:
                calculated_calories = Decimal('0')
            
            # DietLog 생성
            diet_log = DietLog.objects.create(
                user=user,
                food=food,
                date=date,
                meal_type=meal_time,
                quantity=qty_dec,
                calories=calculated_calories,
                recommended_at=None  # 수동 생성은 추천 기반 아님
            )
            
            created_logs.append(diet_log)
        
        return created_logs
