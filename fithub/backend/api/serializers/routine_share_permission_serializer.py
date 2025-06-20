from rest_framework import serializers
from community.models import RoutineSharePermission


class RoutineSharePermissionSerializer(serializers.ModelSerializer):
    granted_by = serializers.ReadOnlyField(source="granted_by.username")

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
        read_only_fields = ["created_at", "updated_at", "granted_by"]
