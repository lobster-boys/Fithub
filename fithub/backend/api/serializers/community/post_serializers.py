from rest_framework import serializers
from .comment_serializers import CommentSerializer
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
# 특정 게시물 조회 시, comment 필드도 보이도록 수정
class UserPostSerializer(BaseUserPostSerializer):

    # comments 필드를 추가하여 해당 Post의 댓글들을 중첩(nested) 시리얼라이징
    comments = CommentSerializer(many=True, read_only=True)
    
    class Meta:
        model = Post
        fields = [
            'id',
            'user',
            'title',
            'content',
            'content_category',
            'content_image',
            'like_count',
            'comments',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['id', 'user', 'like_count', 'created_at', 'updated_at']
        extra_kwargs = {
            'content_image': {
                'required': False,
                'allow_null': True,
            },
        }

    # 댓글 필터링 
    def get_comments(self, instance):
        request = self.context.get('request') # post_views에서 context로 넘김
        ordering = request.query_params.get('ordering', 'latest') if request else 'latest'
        qs = instance.comments.all()  # related_name이 'comments'인 경우

        if ordering == 'latest':
            qs = qs.order_by('-created_at')
        elif ordering == 'oldest':
            qs = qs.order_by('created_at')
        elif ordering == 'like_count':
            qs = qs.order_by('-like_count')  
        
        return CommentSerializer(qs, many=True).data


# 게시글 생성 전용 Serializer
class UserPostCreateSerializer(BaseUserPostSerializer):
    user = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = Post
        fields = [
            'id',
            'user',
            'title',
            'content',
            'content_category',
            'content_image',
            'created_at'
        ]
        read_only_fields = ['id', 'user', 'created_at']
        extra_kwargs = {
            'content_image': {
                'required': False,
                'allow_null': True,
            },
        }

    def create(self, validated_data):
        # 게시글 생성 시, 현재 로그인한 사용자를 user 필드에 자동으로 할당
        user = self.context['request'].user
        return Post.objects.create(user=user, **validated_data)


# 게시글 업데이트 전용 Serializer
class UserPostUpdateSerializer(BaseUserPostSerializer):
    user = serializers.StringRelatedField(read_only=True)
    
    class Meta:
        model = Post
        fields = [
            'id',
            'user',
            'title',
            'content',
            'content_category',
            'content_image',
            'like_count',
            'comments',
            'updated_at'
        ]
        read_only_fields = ['id', 'user', 'like_count', 'updated_at']
        extra_kwargs = {
            'content_image': {
                'required': False,
                'allow_null': True,
            },
        }

