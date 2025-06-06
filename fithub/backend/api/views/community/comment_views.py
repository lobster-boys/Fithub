from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from community.models import Post, Comment
from ...serializers.community.comment_serializers import CommentCreateSerializer, CommentUpdateSerializer

# 특정 게시물의 댓글 수정/삭제/작성 
class UserCommentDetail(APIView):
    
    permission_classes = [IsAuthenticated]

    def post(self, request, post_id):
        post = get_object_or_404(Post, pk=post_id)
        serializer = CommentCreateSerializer(data=request.data, context={'request': request})

        if serializer.is_valid():
            serializer.save(post=post, user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request, post_id, pk):
        comment = get_object_or_404(Comment, pk=pk, post__id= post_id)

        if comment.user != request.user:
            return Response(
                {'detail': '자신의 댓글만 수정할 수 있습니다.'},
                status=status.HTTP_403_FORBIDDEN
            ) 

        serializer = CommentUpdateSerializer(comment, data=request.data, partial=True, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, post_id, pk):
        comment = get_object_or_404(Comment, pk=pk, post__id = post_id)
        
        if comment.user != request.user:
            return Response(
                {'detail': '자신의 댓글만 삭제할 수 있습니다.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        comment.delete()
        return Response(
            {'detail': '댓글이 삭제되었습니다.'},
            status=status.HTTP_204_NO_CONTENT
        )
