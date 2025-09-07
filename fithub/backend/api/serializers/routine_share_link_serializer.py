from rest_framework import serializers
from community.models import RoutineShareLink


class RoutineShareLinkSerializer(serializers.ModelSerializer):
    share_url = serializers.SerializerMethodField()

    class Meta:
        model = RoutineShareLink
        fields = [
            "id",
            "routine",
            "uuid",
            "share_url",
            "created_at",
            "expires_at",
            "is_active",
        ]
        read_only_fields = ("uuid", "created_by", "created_at")

    def get_share_url(self, obj):
        request = self.context.get("request")
        path = f"/share/{obj.uuid}/"
        return request.build_absolute_uri(path) if request else path
