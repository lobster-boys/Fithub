from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from community.models import Post
from ..serializers.community.post_serializers import UserPostSerializer, UserPostCreateSerializer

# 특정(id) 게시물 조회/수정/삭제
class UserPostDetail(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        post = get_object_or_404(Post, pk=pk)
        serializer = UserPostSerializer(post)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def patch(self, request, pk):
        post = get_object_or_404(Post, pk=pk)

        # 본인 게시글만 수정 가능
        if post.user != request.user:
            return Response(
                {'detail': '자신의 게시글만 수정할 수 있습니다.'},
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = UserPostCreateSerializer(post, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        post = get_object_or_404(Post, pk=pk)

        # 본인 게시글만 삭제 가능
        if post.user != request.user:
            return Response(
                {'detail': '자신의 게시글만 삭제할 수 있습니다.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        post.delete()
        return Response(
            {'detail': '게시글이 삭제되었습니다.'},
            status=status.HTTP_204_NO_CONTENT
        )


# 게시글 조회/생성 
class UserPostCreateView(APIView):
    
    permission_classes = [IsAuthenticated]

    def get(self, request):
        posts = Post.objects.all().order_by('-created_at') # 최신순 정렬
        serializer = UserPostSerializer(posts, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = UserPostCreateSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
