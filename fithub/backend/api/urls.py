from django.urls import path, include
from rest_framework.routers import DefaultRouter

from api.views.challenge_views import (
    ChallengeViewSet,
    ChallengePointViewSet,
    SocialShareViewSet,
)
from api.views.point_transaction_views import PointTransactionViewSet
from api.views.challenge_participant_views import ChallengeParticipantViewSet
from api.views.routine_share_permission_viewset import RoutineSharePermissionViewSet
from api.views.routine_viewset import RoutineViewSet
from api.views.routine_share_link_viewset import RoutineShareLinkViewSet
from api.views.routine_feed_viewset import RoutineFeedViewSet

router = DefaultRouter()

# ── 챌린지 관련 ───────────────────────────────────────
router.register(r"challenges", ChallengeViewSet, basename="challenge")
router.register(r"points", ChallengePointViewSet, basename="challenge-point")
router.register(r"shares", SocialShareViewSet, basename="social-share")
router.register(r"transactions", PointTransactionViewSet, basename="point-transaction")
router.register(
    r"challenges/(?P<challenge_pk>\d+)/participants",
    ChallengeParticipantViewSet,
    basename="challenge-participant",
)

# ── 루틴 기본 CRUD ─────────────────────────────────────
router.register(r"routines", RoutineViewSet, basename="routine")

# ── 공유 링크 생성·관리 (cc-share-1) ─────────────────────
router.register(
    r"routine-shares",
    RoutineShareLinkViewSet,
    basename="routine-share-link",
)

# ── 공유 권한 부여·관리 (cc-share-2) ────────────────────
router.register(
    r"routine-share-permissions",
    RoutineSharePermissionViewSet,
    basename="routine-share-permission",
)

# ── 피드 추천 루틴 노출 (cr-share-2) ────────────────────
router.register(
    r"feed/routines",
    RoutineFeedViewSet,
    basename="routine-feed",
)

urlpatterns = [
    path("", include(router.urls)),
]
