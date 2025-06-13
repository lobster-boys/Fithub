from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from rest_framework.decorators import action
from ..serializers.challenge_serializers import (
    ChallengeSerializer,
    ChallengeParticipantSerializer,
    ChallengePointSerializer,
    SocialShareSerializer,
)
from challenge.models import (
    Challenge,
    ChallengeParticipant,
    ChallengePoint,
    SocialShare,
)


class IsCreatorOrReadOnly(permissions.BasePermission):
    """
    Challenge 수정/삭제 시 오직 생성자(creator)만 허용.
    다른 사용자 요청(GET)은 모두 허용.
    """

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        # PUT/PATCH/DELETE할 때는 생성자만 허용
        return obj.creator == request.user


class ChallengeViewSet(viewsets.ModelViewSet):
    """
    챌린지 CRUD API
    """

    queryset = Challenge.objects.all().order_by("-start_date")
    serializer_class = ChallengeSerializer
    permission_classes = [permissions.IsAuthenticated, IsCreatorOrReadOnly]

    def perform_create(self, serializer):
        # request.user를 creator 필드에 넣어 저장
        serializer.save(creator=self.request.user)

    def get_queryset(self):
        qs = Challenge.objects.all().order_by("-start_date")
        # 필터링 예: ?is_active=true, ?period=W/M
        is_active = self.request.query_params.get("is_active")
        period = self.request.query_params.get("period")
        if is_active is not None:
            if is_active.lower() in ["true", "1"]:
                qs = qs.filter(is_active=True)
            elif is_active.lower() in ["false", "0"]:
                qs = qs.filter(is_active=False)
        if period in [Challenge.WEEKLY, Challenge.MONTHLY]:
            qs = qs.filter(period=period)
        return qs


class ChallengeParticipantViewSet(viewsets.ModelViewSet):
    """
    챌린지 참여(Join) / 조회 / 보상(claim) API
    """

    serializer_class = ChallengeParticipantSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # 본인이 참여한 챌린지 정보만 리턴
        return ChallengeParticipant.objects.filter(
            user=self.request.user
        ).select_related("challenge")

    def perform_create(self, serializer):
        # validated_data에서 user가 없으므로 여기서 request.user 추가
        serializer.save(user=self.request.user)

    @action(
        detail=True, methods=["post"], permission_classes=[permissions.IsAuthenticated]
    )
    def claim_reward(self, request, pk=None):
        """
        [POST] /api/challenge/user-participants/{pk}/claim_reward/
        - is_completed=True인 참가자만 reward_points를 받을 수 있음
        """
        participant = get_object_or_404(ChallengeParticipant, pk=pk, user=request.user)
        if not participant.is_completed:
            return Response(
                {"detail": "아직 챌린지 목표를 달성하지 않았습니다."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if participant.reward_claimed:
            return Response(
                {"detail": "이미 보상을 수령한 상태입니다."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        points_awarded = participant.challenge.reward_points
        ChallengePoint.objects.create(
            user_challenge=participant,
            points=points_awarded,
            reason=f"{participant.challenge.name} 챌린지 보상 ({points_awarded}P)",
        )
        participant.reward_claimed = True
        participant.save(update_fields=["reward_claimed"])

        return Response(
            {"detail": f"{points_awarded} 포인트가 지급되었습니다."},
            status=status.HTTP_201_CREATED,
        )


class ChallengePointViewSet(viewsets.ReadOnlyModelViewSet):
    """
    챌린지 포인트 내역 조회 API
    """

    serializer_class = ChallengePointSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # 본인 포인트 내역만 리턴
        return ChallengePoint.objects.filter(
            user_challenge__user=self.request.user
        ).select_related("user_challenge", "user_challenge__challenge")


class SocialShareViewSet(viewsets.ModelViewSet):
    """
    SNS 공유 내역 생성/조회/수정/삭제 API
    """

    serializer_class = SocialShareSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # 본인이 생성한 공유 기록만 리턴
        return SocialShare.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
