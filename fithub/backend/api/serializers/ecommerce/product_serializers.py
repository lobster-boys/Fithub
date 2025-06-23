from rest_framework import serializers
from ecommerce.models import Product, Category

class ProductSimpleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = ["id", "name", "price", "recommendations_score"]

class ProductSerializer(serializers.ModelSerializer):
    from .category_serializers import CategorySimpleSerializer

    category = CategorySimpleSerializer(read_only=True)
    
    class Meta:
        model = Product
        fields = [
            "id", "category", "name", "slug", "description", 
            "price", "sale_price", "stock_quantity", "is_food", 
            "is_active", "is_featured", "recommendations_score"
        ]
        read_only_fields = ["slug", "category"]

class ProductAdminSerializer(serializers.ModelSerializer):
    """관리자용 상품 시리얼라이저 - 카테고리 생성/수정 가능"""
    category = serializers.JSONField(write_only=True, required=False)
    category_info = serializers.SerializerMethodField(read_only=True)
    
    class Meta:
        model = Product
        fields = [
            "id", "category", "category_info", "name", "slug", "description", 
            "price", "sale_price", "stock_quantity", "is_food", "unit_weight_g",
            "is_active", "is_featured", "recommendations_score", "image_url"
        ]
        read_only_fields = ["slug", "category_info"]

    def get_category_info(self, obj):
        """카테고리 정보 읽기용"""
        from .category_serializers import CategorySimpleSerializer
        return CategorySimpleSerializer(obj.category).data if obj.category else None

    def create(self, validated_data):
        category_data = validated_data.pop("category", None)
        category = None
        
        if category_data:
            if isinstance(category_data, dict):
                # 카테고리 이름으로 찾기 또는 생성
                category, _ = Category.objects.get_or_create(
                    name=category_data.get('name', ''),
                    defaults={
                        'description': category_data.get('description', ''),
                        'is_active': category_data.get('is_active', True)
                    }
                )
            elif isinstance(category_data, (int, str)):
                # ID로 찾기
                try:
                    category = Category.objects.get(id=category_data)
                except Category.DoesNotExist:
                    pass
        
        product = Product.objects.create(**validated_data, category=category)
        return product

    def update(self, instance, validated_data):
        # 카테고리 처리
        category_data = validated_data.pop('category', None)
        if category_data:
            if isinstance(category_data, dict):
                # 카테고리 정보가 중첩된 경우 처리
                category_name = category_data.get('name', '')
                if isinstance(category_name, str) and category_name.startswith('{'):
                    try:
                        # JSON 문자열로 저장된 경우 파싱
                        import json
                        parsed_name = json.loads(category_name)
                        category_name = parsed_name.get('name', '')
                    except (json.JSONDecodeError, TypeError):
                        # 파싱 실패시 문자열에서 추출 시도
                        import re
                        match = re.search(r"'name':\s*'([^']+)'", category_name)
                        if match:
                            category_name = match.group(1)
                
                # 카테고리 이름으로 찾기 또는 생성
                if category_name:
                    category, _ = Category.objects.get_or_create(
                        name=category_name,
                        defaults={
                            'description': category_data.get('description', ''),
                            'is_active': category_data.get('is_active', True)
                        }
                    )
                    instance.category = category
            elif isinstance(category_data, (int, str)):
                # ID로 찾기 또는 문자열 처리
                if isinstance(category_data, str) and category_data.startswith('{'):
                    try:
                        # JSON 문자열로 저장된 경우 파싱
                        import json
                        parsed_data = json.loads(category_data)
                        category_name = parsed_data.get('name', '')
                        if category_name:
                            category, _ = Category.objects.get_or_create(
                                name=category_name,
                                defaults={'is_active': True}
                            )
                            instance.category = category
                    except (json.JSONDecodeError, TypeError):
                        # 파싱 실패시 문자열에서 추출 시도
                        import re
                        match = re.search(r"'name':\s*'([^']+)'", category_data)
                        if match:
                            category_name = match.group(1)
                            category, _ = Category.objects.get_or_create(
                                name=category_name,
                                defaults={'is_active': True}
                            )
                            instance.category = category
                else:
                    try:
                        category = Category.objects.get(id=int(category_data))
                        instance.category = category
                    except (Category.DoesNotExist, ValueError):
                        pass

        # 나머지 필드 업데이트
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        instance.save()
        return instance