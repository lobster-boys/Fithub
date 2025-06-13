from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from challenge_checker.models import Challenge, ChallengeParticipant
from api.serializers.challenge_participant_serializer import (
    ChallengeParticipantSerializer,
)


class ChallengeParticipantViewSet(viewsets.ModelViewSet):
    """
    - GET  /api/challenges/{challenge_pk}/participants/     : 참가자 리스트
    - POST /api/challenges/{challenge_pk}/participants/     : 챌린지 참여 등록
    - DELETE /api/challenges/{challenge_pk}/participants/{pk}/ : 참여 취소
    """

    serializer_class = ChallengeParticipantSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        challenge_pk = self.kwargs["challenge_pk"]
        return ChallengeParticipant.objects.filter(challenge_id=challenge_pk)

    def perform_create(self, serializer):
        challenge_pk = self.kwargs["challenge_pk"]
        challenge = Challenge.objects.get(pk=challenge_pk)
        # 중복 참여 방지는 모델의 unique_together가 처리
        serializer.save(challenge=challenge, user=self.request.user)

    def create(self, request, *args, **kwargs):
        # 이미 참여 중이라면 400 리턴
        challenge_pk = kwargs["challenge_pk"]
        exists = ChallengeParticipant.objects.filter(
            challenge_id=challenge_pk, user=request.user
        ).exists()
        if exists:
            return Response(
                {"detail": "이미 참여 중인 챌린지입니다."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        return super().create(request, *args, **kwargs)
