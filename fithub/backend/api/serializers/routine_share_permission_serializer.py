from rest_framework import serializers
from community.models import RoutineSharePermission


class RoutineSharePermissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = RoutineSharePermission
        fields = [
            "id",
            "routine",
            "user",
            "permission",
            "granted_by",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["created_at", "updated_at"]
