from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views.challenge_views import (
    ChallengeViewSet,
    ChallengeParticipantViewSet,
    ChallengePointViewSet,
    SocialShareViewSet,
)

router = DefaultRouter()
router.register(r"challenges", ChallengeViewSet, basename="challenge")
router.register(
    r"user-participants", ChallengeParticipantViewSet, basename="challenge-participant"
)
router.register(r"points", ChallengePointViewSet, basename="challenge-point")
router.register(r"shares", SocialShareViewSet, basename="social-share")

urlpatterns = [
    path("", include(router.urls)),
]
