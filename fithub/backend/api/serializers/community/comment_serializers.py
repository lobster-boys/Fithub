from rest_framework import serializers
from community.models import Comment

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
    user = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = Comment
        fields = [
            'id',
            'user',
            'content',
            'like_count',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['id', 'user', 'like_count', 'created_at', 'updated_at']


# 댓글 생성 전용 serializer
class CommentCreateSerializer(BaseCommentSerializer):
    
    class Meta:
        model = Comment
        fields = [
            'id',
            'user',
            'content',
            'like_count',
            'created_at'
        ]
        read_only_fields = ['id', 'user', 'like_count', 'created_at']


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

