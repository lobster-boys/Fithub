from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from community.models import Post, PostLike

class PostLikeView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        post = get_object_or_404(Post, pk=pk)
        like, created = PostLike.objects.get_or_create(user=request.user, post=post) # 중복 좋아요 처리

        if not created:
            return Response(
                {'detail': '이미 좋아요를 누르셨습니다.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        return Response(
            {'detail': '게시글에 좋아요가 추가되었습니다.'}, 
            status=status.HTTP_201_CREATED
            )
    
    def delete(self, request, pk):
        post = get_object_or_404(Post, pk=pk)
        like = PostLike.objects.filter(user=request.user, post=post).first()
        
        if not like:
            return Response(
                {'detail': '좋아요 항목이 존재하지 않습니다.'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        like.delete()
        return Response(
            {'detail': '게시글 좋아요가 취소되었습니다.'},
            status=status.HTTP_204_NO_CONTENT
        )
        