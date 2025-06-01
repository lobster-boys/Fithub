from rest_framework import serializers
from community.models import Post
from PIL import Image

# 게시글 시리얼라이즈 공통 검증 로직
class BaseUserPostSerializer(serializers.ModelSerializer):

    # 제목 길이 검증
    def validate_title(self, value):
        value = value.strip()
        if len(value) < 2:
            raise serializers.ValidationError('게시글 제목은 최소 2자 이상이어야 합니다.')
        return value

    # 내용 길이 검증
    def validate_content(self, value):
        value = value.strip()
        if len(value) < 1:
            raise serializers.ValidationError('게시글 내용은 최소 1자 이상이어야 합니다.')
        return value
    
    # 업로드 이미지 검증
    def validate_content_image(self, value):
        # 이미지를 업로드 하지 않았다면 그대로 리턴
        if not value:
            return value 
        
        # 1. 파일 확장자 검증
        valid_extensions = ['jpg', 'jpeg', 'png', 'gif']
        ext = value.name.split('.')[-1].lower()
        if ext not in valid_extensions:
            raise serializers.ValidationError(
                f"지원하지 않는 파일 확장자입니다. 지원 확장자: {', '.join(valid_extensions)}"
            )
        
        # 2. Pillow 라이브러리로 이미지 검증
        try:
            image = Image.open(value)
            image.verify() # 이미지 파일 무결성 확인
            value.seek(0) # 파일 포인터 복귀

            # 3. 해상도(이미지 크기) 검증
            max_width, max_height = 1920, 1080

            image = Image.open(value)
            if image.width > max_width or image.height > max_height:
                raise serializers.ValidationError(
                    f"이미지 해상도는 최대 {max_width}x{max_height} 픽셀을 초과할 수 없습니다."
                )
            value.seek(0)

        except Exception as e:
            raise serializers.ValidationError("올바르지 않은 이미지 파일입니다.")

        return value

# 게시글 조회 전용 Serializer
class UserPostSerializer(BaseUserPostSerializer):
    
    class Meta:
        model = Post
        fields = [
            'user',
            'title',
            'content',
            'content_category',
            'content_image',
            'like_count',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['user', 'like_count', 'created_at', 'updated_at']
        extra_kwargs = {
            'content_image': {
                'required': False,
                'allow_null': True,
            },
        }


# 게시글 생성 전용 Serializer
class UserPostCreateSerializer(BaseUserPostSerializer):

    class Meta:
        model = Post
        fields = [
            'title',
            'content',
            'content_category',
            'content_image',
        ]
        extra_kwargs = {
            'content_image': {
                'required': False,
                'allow_null': True,
            },
        }

    # 전체 데이터에 대한 검증
    def validate(self, attrs):
        return attrs

    def create(self, validated_data):
        # 게시글 생성 시, 현재 로그인한 사용자를 user 필드에 자동으로 할당
        user = self.context['request'].user
        return Post.objects.create(user=user, **validated_data)


# 게시글 업데이트 전용 Serializer
class UserPostUpdateSerializer(BaseUserPostSerializer):
    
    class Meta:
        model = Post
        fields = [
            'title',
            'content',
            'content_category',
            'content_image',
        ]
        extra_kwargs = {
            'content_image': {
                'required': False,
                'allow_null': True,
            },
        }

    # 전체 데이터 검증
    def validate(self, attrs):
        return attrs

