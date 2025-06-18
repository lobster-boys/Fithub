from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.db.models import Q
from community.models import Post
from api.serializers.community.post_serializers import UserPostSerializer


class PostViewSet(viewsets.ModelViewSet):
    """
    커뮤니티 게시글 ViewSet
    - 기본 CRUD 작업
    - 내 게시글 조회
    - 좋아요 기능
    """
    serializer_class = UserPostSerializer
    permission_classes = [AllowAny]  # 임시로 권한 변경
    
    def get_queryset(self):
        """게시글 목록 조회 (필터링 지원)"""
        queryset = Post.objects.all()
        
        # 카테고리 필터링 (프론트엔드에서 사용)
        category = self.request.query_params.get('category')
        if category and category != 'all':
            queryset = queryset.filter(content_category=category)
        
        # 검색 기능 (제목 + 내용)
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) | Q(content__icontains=search)
            )
        
        # 태그 필터링
        tags = self.request.query_params.get('tags')
        if tags:
            tag_list = tags.split(',')
            for tag in tag_list:
                queryset = queryset.filter(tags__icontains=tag.strip())
        
        return queryset.select_related('user').order_by('-created_at')

    def perform_create(self, serializer):
        """게시글 생성 시 현재 사용자를 자동으로 설정"""
        if self.request.user.is_authenticated:
            serializer.save(user=self.request.user)
        else:
            # 인증되지 않은 사용자는 생성할 수 없음
            return Response(
                {'error': '로그인이 필요합니다.'}, 
                status=status.HTTP_401_UNAUTHORIZED
            )

    @action(detail=False, methods=['get'])
    def my_posts(self, request):
        """내가 작성한 게시글 조회 (프론트엔드에서 사용)"""
        if not request.user.is_authenticated:
            return Response([])
        
        queryset = Post.objects.filter(user=request.user).order_by('-created_at')
        serializer = UserPostSerializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def like(self, request, pk=None):
        """게시글 좋아요 토글 (프론트엔드에서 사용)"""
        if not request.user.is_authenticated:
            return Response(
                {'error': '로그인이 필요합니다.'}, 
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        try:
            post = self.get_object()
            from community.models import PostLike
            
            # 좋아요 토글
            like_obj, created = PostLike.objects.get_or_create(
                user=request.user, 
                post=post
            )
            
            if not created:
                # 이미 좋아요가 있으면 삭제
                like_obj.delete()
                post.like_count = max(0, post.like_count - 1)
                liked = False
            else:
                # 새로운 좋아요
                post.like_count += 1
                liked = True
            
            post.save()
            
            return Response({
                'liked': liked,
                'like_count': post.like_count
            })
            
        except Post.DoesNotExist:
            return Response(
                {'error': '게시글을 찾을 수 없습니다.'}, 
                status=status.HTTP_404_NOT_FOUND
            )









