from rest_framework import serializers
from django.contrib.contenttypes.models import ContentType
from challenge.models import (
    Challenge,
    ChallengeParticipant,
    ChallengePoint,
    SocialShare,
)


class ChallengeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Challenge
        fields = [
            "id",
            "name",
            "description",
            "period",
            "goal_type",
            "goal_value",
            "start_date",
            "end_date",
            "reward_points",
            "is_active",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def validate(self, data):
        start = data.get("start_date", getattr(self.instance, "start_date", None))
        end = data.get("end_date", getattr(self.instance, "end_date", None))
        if start and end and end < start:
            raise serializers.ValidationError("종료일은 시작일보다 빠를 수 없습니다.")
        return data


class ChallengeParticipantSerializer(serializers.ModelSerializer):
    challenge_detail = ChallengeSerializer(source="challenge", read_only=True)

    class Meta:
        model = ChallengeParticipant
        fields = [
            "id",
            "challenge",
            "challenge_detail",
            "user",
            "join_datetime",
            "current_progress",
            "is_completed",
            "completion_datetime",
            "reward_claimed",
        ]
        read_only_fields = [
            "id",
            "join_datetime",
            "current_progress",
            "is_completed",
            "completion_datetime",
            "reward_claimed",
            "user",
        ]

    def validate(self, data):
        request = self.context["request"]
        user = request.user
        challenge = data.get("challenge")
        if ChallengeParticipant.objects.filter(user=user, challenge=challenge).exists():
            raise serializers.ValidationError("이미 이 챌린지에 참여한 사용자입니다.")
        return data

    def create(self, validated_data):
        validated_data["user"] = self.context["request"].user
        return super().create(validated_data)


class ChallengePointSerializer(serializers.ModelSerializer):
    user = serializers.SerializerMethodField(read_only=True)
    challenge = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = ChallengePoint
        fields = [
            "id",
            "user_challenge",
            "user",
            "challenge",
            "points",
            "reason",
            "awarded_datetime",
        ]
        read_only_fields = [
            "id",
            "user_challenge",
            "user",
            "challenge",
            "points",
            "reason",
            "awarded_datetime",
        ]

    def get_user(self, obj):
        return obj.user_challenge.user.username

    def get_challenge(self, obj):
        return obj.user_challenge.challenge.name


class SocialShareSerializer(serializers.ModelSerializer):
    content_object_str = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = SocialShare
        fields = [
            "id",
            "content_type",
            "object_id",
            "content_object_str",
            "user",
            "platform",
            "share_url",
            "share_status",
            "created_at",
        ]
        read_only_fields = ["id", "content_object_str", "created_at", "user"]

    def get_content_object_str(self, obj):
        return str(obj.content_object)

    def validate(self, data):
        ctype = data.get("content_type")
        oid = data.get("object_id")
        # 실제로 존재하는 객체인지 확인
        if not ctype.get_object_for_this_type(pk=oid):
            raise serializers.ValidationError(
                "해당 content_type/content_id 조합으로 객체를 찾을 수 없습니다."
            )
        return data

    def create(self, validated_data):
        validated_data["user"] = self.context["request"].user
        return super().create(validated_data)
