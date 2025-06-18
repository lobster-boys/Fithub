from rest_framework import permissions
from community.models import RoutineSharePermission


class IsSharedRoutine(permissions.BasePermission):
    """
    GET(SAFE_METHODS) → VIEW 이상
    PUT/PATCH        → EDIT 이상
    DELETE           → ADMIN 전용
    """

    def has_object_permission(self, request, view, obj):
        # obj는 community.Routine 인스턴스
        user = request.user
        if not user.is_authenticated:
            return False

        # 소유자는 모든 권한 허용
        if obj.user == user:
            return True

        if request.method in permissions.SAFE_METHODS:
            return RoutineSharePermission.has_view(obj, user)
        elif request.method in ("PUT", "PATCH"):
            return RoutineSharePermission.has_edit(obj, user)
        elif request.method == "DELETE":
            return RoutineSharePermission.has_admin(obj, user)

        return False
