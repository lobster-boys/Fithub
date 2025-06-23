from rest_framework import serializers
from django.db import transaction
from diet.models import Food, MealPlan, MealPlanFood, MealPlanLike, FoodCategory
from decimal import Decimal

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
        
        tc = attrs.get('total_calories')
        if tc is not None and tc <= 0:
            raise serializers.ValidationError("일일 총 목표 칼로리는 0보다 커야 합니다.")

        return attrs


# Food 테이블의 주요 정보
class FoodDetailSerializer(serializers.ModelSerializer):

    category_name = serializers.StringRelatedField(source='category', read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(source='category', read_only=True)

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
            'category_name',
            'category_id',
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
        extra_kwargs = {
            'meal_time': {'required': True},
            'quantity' : {'required': True}
        }


# 식단 계획 조회
class MealPlanDetailSerializer(serializers.ModelSerializer):
    items = MealPlanFoodReadSerializer(many=True, read_only=True)
    user = serializers.CharField(source='user.username', read_only=True) # user_id 대신 username으로 표현
    target_goal_display = serializers.CharField(source='get_target_goal_display', read_only=True)
    difficulty_display = serializers.CharField(source='get_difficulty_display', read_only=True)
    
    # 계산된 영양정보
    calculated_nutrition = serializers.SerializerMethodField()
    
    # 사용자 관련 정보
    is_liked_by_user = serializers.SerializerMethodField()
    is_owner = serializers.SerializerMethodField()

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
            'is_public',
            'is_recommended',
            'target_goal',
            'target_goal_display',
            'target_calories_min',
            'target_calories_max',
            'difficulty',
            'difficulty_display',
            'views_count',
            'likes_count',
            'created_at',
            'updated_at',
            'items',
            'calculated_nutrition',
            'is_liked_by_user',
            'is_owner'
        ]
        read_only_fields = ['id','user', 'views_count', 'likes_count', 'created_at', 'updated_at']

    def get_calculated_nutrition(self, obj):
        """식단 계획의 총 영양정보 계산"""
        try:
            return obj.calculate_nutrition()
        except:
            return {
                "total_calories": 0,
                "total_protein": 0,
                "total_carbs": 0,
                "total_fat": 0,
            }

    def get_is_liked_by_user(self, obj):
        """현재 사용자가 좋아요를 눌렀는지 확인"""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.likes.filter(user=request.user).exists()
        return False

    def get_is_owner(self, obj):
        """현재 사용자가 소유자인지 확인"""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.user == request.user
        return False

# MealPlan의 생성/수정 시 사용하는 시리얼라이저
# diff update 기법 사용
# 기존 항목은 업데이트, 신규 항목은 생성, 요청에 없는 항목은 삭제
class MealPlanWriteSerializer(BaseMealPlanSerializer):
    items = MealPlanFoodWriteSerializer(many=True, required=False) 

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
            'is_public',
            'is_recommended',
            'target_goal',
            'target_calories_min',
            'target_calories_max',
            'difficulty',
            'items',
        ]
        read_only_fields = ['id', 'total_calories']
        extra_kwargs = {"total_calories": {"required": False}}

    def validate(self, attrs):
        """추가 유효성 검사"""
        attrs = super().validate(attrs)
        
        # 칼로리 범위 검증
        cal_min = attrs.get('target_calories_min')
        cal_max = attrs.get('target_calories_max')
        
        if cal_min and cal_max and cal_min > cal_max:
            raise serializers.ValidationError("최소 칼로리는 최대 칼로리보다 클 수 없습니다.")
            
        return attrs

    @transaction.atomic
    def create(self, validated_data):
        # items가 없으면 빈 리스트를 기본값으로 설정
        items_data = validated_data.pop('items', [])
        # user는 view에서 context로 전달됨
        user = self.context['request'].user
        meal_plan = MealPlan.objects.create(user=user, **validated_data)
        self._sync_items(meal_plan, items_data)
        # 자동 칼로리, 영양 합산
        meal_plan.calculate_nutrition()
        return meal_plan

    @transaction.atomic
    def update(self, instance, validated_data):
        items_data = validated_data.pop("items", None)

        # 기본 필드 반영
        for attr, val in validated_data.items():
            setattr(instance, attr, val)
        instance.save()

        # items가 포함된 경우에만 diff-update
        if items_data is not None:
            self._sync_items(instance, items_data)
        
        instance.calculate_nutrition()
        return instance

    # 내부 util
    def _sync_items(self, meal_plan, raw_items):
        """
        raw_items: MealPlanFoodWriteSerializer로 검증
        MealPlan_id == request.id: update
        MealPlan_id == None: create
        MealPlan_id 누락: delete

        raw_items : 1. 이미 validated( food=객체 )  또는
                    2. 아직 미검증( food_id=pk ) 두 경우를 모두 허용
        """
        if not raw_items:
            # 빈 리스트이면 모든 항목 삭제
            meal_plan.items.all().delete()
            return 
        
        # 1) raw_items가 이미 'food' 키를 갖고 있으면 재검증 생략
        if raw_items and len(raw_items) > 0 and isinstance(raw_items[0].get('food'), Food):
            validated_items = raw_items
        else:
            ser = MealPlanFoodWriteSerializer(data=raw_items, many=True)
            ser.is_valid(raise_exception=True)
            validated_items = ser.validated_data

        existing = {}
        for obj in meal_plan.items.all():
            key = (obj.food.id, obj.meal_time)
            existing[key] = obj

        kept_keys = set()
        # validated_items가 유효한 리스트/튜플인지 확인 후 처리
        if isinstance(validated_items, (list, tuple)) and validated_items:
            for data in validated_items:
                # 만약 id가 넘겨졌다면 id로 업데이트
                if 'id' in data and data['id']:
                    obj = meal_plan.items.get(id=data['id'])
                    for k, v in data.items():
                        if k != 'id':
                            setattr(obj, k, v)
                    obj.save()
                    kept_keys.add((obj.food.id, obj.meal_time))
                else:
                    # id가 없는 경우 → (food, meal_time) 조합으로 기존 객체 검사
                    key = (data['food'].id, data['meal_time'])
                    if key in existing:
                        # 이미 존재하면 업데이트
                        obj = existing[key]
                        for k, v in data.items():
                            setattr(obj, k, v)
                        obj.save()
                        kept_keys.add(key)
                    else:
                        # 없으면 새로 생성
                        new_obj = MealPlanFood.objects.create(meal_plan=meal_plan, **data)
                        kept_keys.add((new_obj.food.id, new_obj.meal_time))

        # 기존 항목 중, kept_keys에 없는 것은 삭제
        for obj in meal_plan.items.all():
            key = (obj.food.id, obj.meal_time)
            if key not in kept_keys:
                obj.delete()


class MealPlanLikeSerializer(serializers.ModelSerializer):
    """식단 계획 좋아요 시리얼라이저"""
    
    class Meta:
        model = MealPlanLike
        fields = ['id', 'meal_plan', 'created_at']
        read_only_fields = ['created_at']

    def validate_meal_plan(self, value):
        """식단 계획 유효성 검사"""
        if not value.is_public:
            raise serializers.ValidationError("공개된 식단만 좋아요를 누를 수 있습니다.")
        return value

    def create(self, validated_data):
        """좋아요 생성 (토글 방식)"""
        request = self.context.get('request')
        meal_plan = validated_data['meal_plan']
        
        if request and request.user.is_authenticated:
            validated_data['user'] = request.user
            
            # 이미 좋아요가 있다면 삭제 (토글)
            existing_like = MealPlanLike.objects.filter(
                user=request.user, 
                meal_plan=meal_plan
            ).first()
            
            if existing_like:
                existing_like.delete()
                # 좋아요 수 감소
                meal_plan.likes_count = max(0, meal_plan.likes_count - 1)
                meal_plan.save(update_fields=['likes_count'])
                return None  # 삭제됨을 나타냄
            else:
                # 새로 생성
                like = MealPlanLike.objects.create(**validated_data)
                # 좋아요 수 증가
                meal_plan.likes_count += 1
                meal_plan.save(update_fields=['likes_count'])
                return like
        
        raise serializers.ValidationError("로그인이 필요합니다.")


class PublicMealPlanSerializer(serializers.ModelSerializer):
    """공개 식단 목록용 간소화된 시리얼라이저"""
    target_goal_display = serializers.CharField(source='get_target_goal_display', read_only=True)
    difficulty_display = serializers.CharField(source='get_difficulty_display', read_only=True)
    calculated_nutrition = serializers.SerializerMethodField()
    is_liked_by_user = serializers.SerializerMethodField()
    user_name = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = MealPlan
        fields = [
            'id', 'name', 'description', 'target_goal_display', 'difficulty_display',
            'target_calories_min', 'target_calories_max', 'views_count', 'likes_count',
            'created_at', 'calculated_nutrition', 'is_liked_by_user', 'user_name'
        ]

    def get_calculated_nutrition(self, obj):
        """간소화된 영양정보"""
        try:
            nutrition = obj.calculate_nutrition()
            return {
                "total_calories": nutrition["total_calories"],
                "total_protein": nutrition["total_protein"],
            }
        except:
            return {"total_calories": 0, "total_protein": 0}

    def get_is_liked_by_user(self, obj):
        """현재 사용자가 좋아요를 눌렀는지 확인"""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.likes.filter(user=request.user).exists()
        return False