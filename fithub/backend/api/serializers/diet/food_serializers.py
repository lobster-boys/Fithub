from rest_framework import serializers
from diet.models import Food
from ecommerce.models import Product

# Food 시리얼라이즈 공통 검증 로직
class BaseFoodSerializer(serializers.ModelSerializer):
    
    def validate_name(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError('음식 이름은 빈 값일 수 없습니다.')
        return value

    def validate_calories(self, value):
        if value is None:
            raise serializers.ValidationError('칼로리 값을 입력해 주세요.')
        if value < 0:
            raise serializers.ValidationError('칼로리는 음수일 수 없습니다.')
        return value
    
    def validate_protein(self, value):
        if value is not None and value < 0:
            raise serializers.ValidationError('단백질 양은 음수일 수 없습니다.')
        return value
    
    def validate_carbs(self, value):
        if value is not None and value < 0:
            raise serializers.ValidationError('탄수화물 양은 음수일 수 없습니다.')
        return value
    
    def validate_fat(self, value):
        if value is not None and value < 0:
            raise serializers.ValidationError('지방 양은 음수일 수 없습니다.')
        return value
    
    def validate_serving_size(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError('1회 제공량은 필수 입력 항목입니다.')
        return value
    
    def validate(self, attrs):
        # 사용자가 음식 정보를 커스텀 생성하면, category, product null 허용 로직
        return super().validate(attrs)

# Food 조회 시리얼라이저
class FoodSerializer(serializers.ModelSerializer):

    category = serializers.PrimaryKeyRelatedField(read_only=True)
    product  = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = Food
        fields = '__all__'
    
    # 제품이 음식(is_food)가 아니라면 category와 product는 보여지지 않음
    def to_representation(self, instance):
        data = super().to_representation(instance)
        prod = getattr(instance, 'product', None)
        if not (prod and prod.is_food):
            data.pop('category', None)
            data.pop('product', None)
        return data

# Food 생성 시리얼라이저
class FoodCreateSerializer(BaseFoodSerializer):
    
    # 사용자가 직접 음식 정보를 추가할 때, product 없이도 정보 등록 가능
    product = serializers.PrimaryKeyRelatedField(
        queryset = Product.objects.all(),
        allow_null = True,
        required=False,
    )

    class Meta:
        model = Food
        fields = [
            'category',
            'product',
            'name',
            'description',
            'calories',
            'protein',
            'carbs',
            'fat',
            'serving_size'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def create(self, validated_data):
        # 사용자가 직접 음식 정보를 추가한다면, 현재 로그인한 사용자를 user 필드에 자동으로 할당
        user = self.context['request'].user
        return Food.objects.create(user=user, **validated_data)


# Food 업데이트 시리얼라이저
class FoodUpdateSerializer(BaseFoodSerializer):
    
    class Meta:
        model = Food
        fields = FoodCreateSerializer.Meta.fields
        read_only_fields = ['id', 'created_at', 'updated_at']

    def update(self, instance, validated_data):
        if instance.user != self.context['request'].user:
            raise serializers.ValidationError('자신이 추가한 음식만 수정할 수 있습니다.')
        return super().update(instance, validated_data)