from rest_framework import serializers
from challenge_checker.models import ChallengeParticipant


class ChallengeParticipantSerializer(serializers.ModelSerializer):
    user_id = serializers.IntegerField(source="user.id", read_only=True)
    username = serializers.CharField(source="user.username", read_only=True)
    joined_at = serializers.DateTimeField(read_only=True)

    class Meta:
        model = ChallengeParticipant
        fields = ["id", "user_id", "username", "joined_at"]
        read_only_fields = ["id", "user_id", "username", "joined_at"]
