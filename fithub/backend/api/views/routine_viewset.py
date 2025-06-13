from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from community.models import Routine
from api.serializers.routine_serializer import RoutineSerializer


class IsOwnerOrAdmin(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        return obj.user == request.user


class RoutineViewSet(viewsets.ModelViewSet):
    queryset = Routine.objects.all()
    serializer_class = RoutineSerializer
    permission_classes = [permissions.IsAuthenticated]

    @action(
        detail=True,
        methods=["post"],
        permission_classes=[permissions.IsAuthenticated, IsOwnerOrAdmin],
    )
    def toggle_public(self, request, pk=None):
        routine = self.get_object()
        routine.is_public = not routine.is_public
        routine.save()
        return Response({"is_public": routine.is_public})
