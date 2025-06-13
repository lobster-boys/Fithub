from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views.challenge_views import (
    ChallengeViewSet,
    ChallengePointViewSet,
    SocialShareViewSet,
)
from .views.point_transaction_views import PointTransactionViewSet
from .views.challenge_participant_views import ChallengeParticipantViewSet
from .views.challenge_ranking_views import ChallengeRankingAPIView
from api.views.routine_share_permission_viewset import RoutineSharePermissionViewSet
from .views.routine_viewset import RoutineViewSet

router = DefaultRouter()
router.register(r"challenges", ChallengeViewSet, basename="challenge")
router.register(r"points", ChallengePointViewSet, basename="challenge-point")
router.register(r"shares", SocialShareViewSet, basename="social-share")

router.register(r"transactions", PointTransactionViewSet, basename="point-transaction")

router.register(
    r"challenges/(?P<challenge_pk>\d+)/participants",
    ChallengeParticipantViewSet,
    basename="challenge-participant",
)
router.register(
    r"routine-share", RoutineSharePermissionViewSet, basename="routine-share"
)

router.register(r"routines", RoutineViewSet, basename="routine")

urlpatterns = [
    path("", include(router.urls)),
    path(
        "challenges/<int:challenge_pk>/rankings/",
        ChallengeRankingAPIView.as_view(),
        name="challenge-ranking",
    ),
]
