from rest_framework import generics, permissions
from rest_framework.response import Response
from django.db.models import Sum

from challenge_checker.models import Challenge, UserLog, ChallengeParticipant
from api.serializers.challenge_ranking_serializer import ChallengeRankingSerializer


class ChallengeRankingAPIView(generics.ListAPIView):
    """
    GET /api/challenges/{challenge_pk}/rankings/
    챌린지 참여자들의 순위를 반환
    """

    serializer_class = ChallengeRankingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def list(self, request, *args, **kwargs):
        # 1) 챌린지 가져오기
        challenge = generics.get_object_or_404(Challenge, pk=kwargs["challenge_pk"])

        # 2) 실제 참가자 ID 목록 조회
        participant_ids = challenge.participants.values_list("user_id", flat=True)

        # 3) UserLog에서 기간 내 값 집계 및 정렬
        stats = (
            UserLog.objects.filter(
                user_id__in=participant_ids,
                date__range=(challenge.start_date, challenge.end_date),
            )
            .values("user_id", "user__username")
            .annotate(total=Sum("value"))
            .order_by("-total")
        )

        # 4) 순위(rank) 부여
        ranking = []
        for idx, entry in enumerate(stats, start=1):
            ranking.append(
                {
                    "rank": idx,
                    "user_id": entry["user_id"],
                    "username": entry["user__username"],
                    "total": entry["total"] or 0,
                }
            )

        return Response(ranking)
