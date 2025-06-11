from rest_framework import serializers
from challenge_checker.models import PointTransaction


class PointTransactionSerializer(serializers.ModelSerializer):
    # 만약 챌린지 이름을 같이 보여주고 싶다면 SerializerMethodField 를 추가
    challenge_name = serializers.CharField(source="challenge.name", read_only=True)

    class Meta:
        model = PointTransaction
        fields = ["id", "points", "timestamp", "challenge", "challenge_name"]
        read_only_fields = fields
