from rest_framework import serializers
from django.db import transaction
from diet.models import Food, MealPlan, MealPlanFood

# 공통 검증
class BaseMealPlanSerializer(serializers.ModelSerializer):
    def validate(self, attrs):
        # instance가 존재하면(업데이트) 기존 값을 fallback으로 사용
        sd = attrs.get('start_date') or (self.instance.start_date if self.instance else None)
        ed = attrs.get('end_date') or (self.instance.end_date if self.instance else None)

        if sd is None or ed is None:
            raise serializers.ValidationError("start_date와 end_date는 반드시 입력되어야 합니다.")

        if sd > ed:
            raise serializers.ValidationError("시작일이 종료일보다 늦을 수 없습니다.")

        total_calories = attrs.get('total_calories')
        if total_calories is not None and total_calories <= 0:
            raise serializers.ValidationError("일일 총 목표 칼로리는 0보다 커야 합니다.")

        return attrs


# Food 테이블의 주요 정보
class FoodDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = Food
        fields = [
            'id',
            'name',
            'description',
            'calories',
            'protein',
            'carbs',
            'fat',
            'serving_size',
        ]

# MealPlanFood의 조회 시 사용하는 시리얼라이저
class MealPlanFoodReadSerializer(serializers.ModelSerializer):
    food = FoodDetailSerializer(read_only=True)

    class Meta:
        model = MealPlanFood
        fields = [
            'id',
            'food',
            'quantity',
            'meal_time',
        ]

# MealPlanFood의 생성/수정 시 사용하는 시리얼라이저
class MealPlanFoodWriteSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(required=False)
    food_id = serializers.PrimaryKeyRelatedField(source='food', queryset=Food.objects.all())

    class Meta:
        model = MealPlanFood
        fields = [
            'id',
            'food_id',
            'quantity',
            'meal_time'
        ]
        read_only_fields = ['id']

# 식단 계획 조회
class MealPlanDetailSerializer(serializers.ModelSerializer):
    items = MealPlanFoodReadSerializer(many=True, read_only=True)
    user = serializers.CharField(source='user.usernmae', read_only=True) # user_id 대신 username으로 표현

    class Meta:
        model = MealPlan
        fields = [
            'id',
            'user',
            'name',
            'description',
            'start_date',
            'end_date',
            'is_active',
            'total_calories',
            'items'
        ]
        read_only_fields = ['id','user']

# MealPlan의 생성/수정 시 사용하는 시리얼라이저
# diff update 기법 사용
# 기존 항목은 업데이트, 신규 항목은 생성, 요청에 없는 항목은 삭제
class MealPlanWriteSerializer(BaseMealPlanSerializer):
    items = MealPlanFoodWriteSerializer(many=True)

    class Meta:
        model = MealPlan
        fields = [
            'id',
            'name',
            'description',
            'start_date',
            'end_date',
            'is_active',
            'total_calories',
            'items',
        ]
        read_only_fields = ['id']

    @transaction.atomic
    def create(self, validated_data):
        # items가 없으면 빈 리스트를 기본값으로 설정
        items_data = validated_data.pop('items', [])
        # user는 view에서 context로 전달됨
        user = self.context['request'].user
        meal_plan = MealPlan.objects.create(user=user, **validated_data)
        # 만약 items_data가 존재하면 처리 (빈 리스트이면 반복문이 실행되지 않음)
        for item_data in items_data:
            MealPlanFood.objects.create(meal_plan=meal_plan, **item_data)
        return meal_plan

    @transaction.atomic
    def update(self, instance, validated_data):
        items_data = validated_data.pop('items', [])
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # 기존 MealPlanFood 항목을 불러와 딕셔너리로 만든다.
        existing_items = {item.id: item for item in instance.items.all()}

        incoming_item_ids = []
        for item in items_data:
            # item에 id가 있다면 업데이트, 없으면 새로 생성
            item_id = item.get('id', None)
            if item_id and item_id in existing_items:
                existing_instance = existing_items[item_id]
                for attr, value in item.items():
                    setattr(existing_instance, attr, value)
                existing_instance.save()
                incoming_item_ids.append(item_id)
            else:
                new_item = MealPlanFood.objects.create(meal_plan=instance, **item)
                incoming_item_ids.append(new_item.id)

        for existing_id, existing_item in existing_items.items():
            if existing_id not in incoming_item_ids:
                existing_item.delete()

        return instance

