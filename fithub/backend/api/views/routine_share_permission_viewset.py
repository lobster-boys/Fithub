from rest_framework import viewsets, permissions
from community.models import RoutineSharePermission
from api.serializers.routine_share_permission_serializer import (
    RoutineSharePermissionSerializer,
)
from api.permissions import IsSharedRoutine


class RoutineSharePermissionViewSet(viewsets.ModelViewSet):
    """
    루틴 공유 권한 부여·관리
    """

    queryset = RoutineSharePermission.objects.select_related(
        "routine", "user", "granted_by"
    )
    serializer_class = RoutineSharePermissionSerializer
    # 로그인된 사용자, 그리고 커스텀 권한 검사
    permission_classes = [permissions.IsAuthenticated, IsSharedRoutine]

    def get_queryset(self):
        # swagger 스키마 생성 시 단축 처리
        if getattr(self, 'swagger_fake_view', False):
            return self.queryset.none()
        
        # 본인이 부여한 권한 목록만 반환
        return self.queryset.filter(granted_by=self.request.user)

    def perform_create(self, serializer):
        # granted_by 자동 설정
        serializer.save(granted_by=self.request.user)
