from rest_framework import serializers
from community.models import Routine


class RoutineFeedSerializer(serializers.ModelSerializer):
    author = serializers.ReadOnlyField(source="user.username")

    class Meta:
        model = Routine
        fields = ["id", "title", "description", "author", "created_at"]
