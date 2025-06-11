from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views.challenge_views import (
    ChallengeViewSet,
    ChallengeParticipantViewSet,
    ChallengePointViewSet,
    SocialShareViewSet,
)
from .views.point_transaction_views import PointTransactionViewSet
from .views.challenge_participant_views import ChallengeParticipantViewSet
from .views.challenge_ranking_views import ChallengeRankingAPIView

router = DefaultRouter()
router.register(r"challenges", ChallengeViewSet, basename="challenge")
router.register(
    r"user-participants", ChallengeParticipantViewSet, basename="challenge-participant"
)
router.register(r"points", ChallengePointViewSet, basename="challenge-point")
router.register(r"shares", SocialShareViewSet, basename="social-share")

router.register(r"transactions", PointTransactionViewSet, basename="point-transaction")

router.register(
    r"challenges/(?P<challenge_pk>\d+)/participants",
    ChallengeParticipantViewSet,
    basename="challenge-participant",
)

urlpatterns = [
    path("", include(router.urls)),
    path(
        "challenges/<int:challenge_pk>/rankings/",
        ChallengeRankingAPIView.as_view(),
        name="challenge-ranking",
    ),
]
