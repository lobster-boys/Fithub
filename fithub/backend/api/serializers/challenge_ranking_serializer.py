from rest_framework import serializers


class ChallengeRankingSerializer(serializers.Serializer):
    rank = serializers.IntegerField()
    user_id = serializers.IntegerField()
    username = serializers.CharField()
    total = serializers.IntegerField(help_text="챌린지 기간 동안 누적된 값")
