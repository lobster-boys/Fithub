from rest_framework import viewsets
from community.models import RoutineSharePermission
from api.serializers.routine_share_permission_serializer import (
    RoutineSharePermissionSerializer,
)
from api.permissions import IsSharedRoutine


class RoutineSharePermissionViewSet(viewsets.ModelViewSet):
    queryset = RoutineSharePermission.objects.select_related(
        "routine", "user", "granted_by"
    )
    serializer_class = RoutineSharePermissionSerializer
    permission_classes = [IsSharedRoutine]
