from rest_framework import serializers
from community.models import Routine


class RoutineSerializer(serializers.ModelSerializer):
    class Meta:
        model = Routine
        fields = ["id", "user", "title", "description", "created_at", "is_public"]
        read_only_fields = ["user", "created_at"]
