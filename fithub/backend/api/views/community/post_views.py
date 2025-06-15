from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
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
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """게시글 목록 조회 (필터링 지원)"""
        queryset = Post.objects.all()
        
        # 카테고리 필터링 (프론트엔드에서 사용)
        category = self.request.query_params.get('category')
        if category and category != 'all':
            queryset = queryset.filter(category=category)
        
        # 검색 (프론트엔드에서 사용)
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) | 
                Q(content__icontains=search)
            )
        
        # 태그 필터링
        tags = self.request.query_params.get('tags')
        if tags:
            tag_list = tags.split(',')
            for tag in tag_list:
                queryset = queryset.filter(tags__icontains=tag.strip())
        
        return queryset.select_related('author').order_by('-created_at')

    def perform_create(self, serializer):
        """게시글 생성 시 현재 사용자를 자동으로 설정"""
        serializer.save(author=self.request.user)

    @action(detail=False, methods=['get'])
    def my_posts(self, request):
        """내 게시글 목록 (프론트엔드에서 사용)"""
        queryset = Post.objects.filter(author=request.user).order_by('-created_at')
        
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
            
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def like(self, request, pk=None):
        """게시글 좋아요/좋아요 취소 (프론트엔드에서 사용)"""
        post = self.get_object()
        user = request.user
        
        if user in post.likes.all():
            post.likes.remove(user)
            liked = False
        else:
            post.likes.add(user)
            liked = True
        
        return Response({
            'liked': liked,
            'likes_count': post.likes.count()
        })









