from rest_framework import serializers
from community.models import Comment

# 사용자 정보 시리얼라이저 (댓글용)
class UserBasicSerializer(serializers.ModelSerializer):
    
    class Meta:
        from users.models import User
        model = User
        fields = ['id', 'username', 'first_name', 'last_name']
        read_only_fields = ['id', 'username', 'first_name', 'last_name']

# 댓글 시리얼라이즈 공통 검증 로직
class BaseCommentSerializer(serializers.ModelSerializer):
    
    def validate_content(self, value):
        value = value.strip()

        # 댓글 공백 방지
        if not value: 
            raise serializers.ValidationError('댓글 내용은 비어있을 수 없습니다.')
        
        # 댓글 최대 길이 제한
        if len(value) > 300:
            raise serializers.ValidationError('댓글 내용은 300자 이내여야 합니다.')
        
        return value
    

# 댓글 조회 전용 serializer
class CommentSerializer(serializers.ModelSerializer):
    user = UserBasicSerializer(read_only=True)
    is_liked = serializers.SerializerMethodField()

    class Meta:
        model = Comment
        fields = [
            'id',
            'user',
            'content',
            'like_count',
            'is_liked',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['id', 'user', 'like_count', 'is_liked', 'created_at', 'updated_at']

    def get_is_liked(self, obj):
        """현재 사용자가 이 댓글에 좋아요를 눌렀는지 확인"""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            from community.models import CommentLike
            return CommentLike.objects.filter(user=request.user, comment=obj).exists()
        return False


# 댓글 생성 전용 serializer
class CommentCreateSerializer(BaseCommentSerializer):
    user = UserBasicSerializer(read_only=True)
    is_liked = serializers.SerializerMethodField()
    
    class Meta:
        model = Comment
        fields = [
            'id',
            'user',
            'content',
            'like_count',
            'is_liked',
            'created_at'
        ]
        read_only_fields = ['id', 'user', 'like_count', 'is_liked', 'created_at']

    def get_is_liked(self, obj):
        """새로 생성된 댓글은 좋아요가 없으므로 False 반환"""
        return False


# 댓글 업데이트 전용 serializer
class CommentUpdateSerializer(BaseCommentSerializer):

    class Meta:
        model = Comment
        fields = [
            'id',
            'user',
            'content',
            'like_count',
            'updated_at'
        ]
        read_only_fields = ['id', 'user', 'like_count', 'updated_at']

