from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from community.models import Comment, CommentLike

class CommentLikeView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        comment = get_object_or_404(Comment, pk=pk)
        like, created = CommentLike.objects.get_or_create(user=request.user, comment=comment)
        
        if not created:
            return Response(
                {"detail": "이미 좋아요를 누르셨습니다."},
                status=status.HTTP_400_BAD_REQUEST
            )
        return Response({"detail": "댓글에 좋아요가 추가되었습니다."}, status=status.HTTP_201_CREATED)

    def delete(self, request, pk):
        """
        댓글 좋아요 취소: 현재 로그인한 사용자가 pk에 해당하는 댓글에 누른 좋아요를 취소합니다.
        """
        comment = get_object_or_404(Comment, pk=pk)
        like = CommentLike.objects.filter(user=request.user, comment=comment).first()
        
        if not like:
            return Response(
                {"detail": "좋아요 항목이 존재하지 않습니다."},
                status=status.HTTP_404_NOT_FOUND
            )
        like.delete()
        return Response({"detail": "댓글 좋아요가 취소되었습니다."}, status=status.HTTP_204_NO_CONTENT)