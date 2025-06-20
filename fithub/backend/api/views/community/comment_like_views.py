from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from community.models import Comment, CommentLike

class CommentLikeView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        """댓글 좋아요 토글 - 이미 좋아요가 있으면 취소, 없으면 추가"""
        comment = get_object_or_404(Comment, pk=pk)
        like = CommentLike.objects.filter(user=request.user, comment=comment).first()
        
        if like:
            # 이미 좋아요가 있으면 취소
            like.delete()
            liked = False
        else:
            # 좋아요가 없으면 추가
            CommentLike.objects.create(user=request.user, comment=comment)
            liked = True
        
        # 실제 좋아요 개수 계산 (정확한 카운트)
        actual_like_count = CommentLike.objects.filter(comment=comment).count()
        comment.like_count = actual_like_count
        comment.save()
        
        return Response({
            "detail": f"댓글 좋아요가 {'추가' if liked else '취소'}되었습니다.",
            "liked": liked,
            "like_count": actual_like_count
        }, status=status.HTTP_200_OK)

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