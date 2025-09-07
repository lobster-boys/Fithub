from rest_framework import viewsets, permissions
from community.models import Routine, RoutineSharePermission
from api.serializers.routine_feed_serializer import RoutineFeedSerializer


class RoutineFeedViewSet(viewsets.ReadOnlyModelViewSet):
    """
    피드에 노출할 추천 루틴 조회
    """

    serializer_class = RoutineFeedSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        # 공개된 루틴
        public_routines = Routine.objects.filter(is_public=True)
        # 권한으로 공유된 루틴
        shared_ids = RoutineSharePermission.objects.filter(
            user=user,
            permission__in=[
                RoutineSharePermission.VIEW,
                RoutineSharePermission.EDIT,
                RoutineSharePermission.ADMIN,
            ],
        ).values_list("routine_id", flat=True)
        shared_routines = Routine.objects.filter(id__in=shared_ids)
        # 두 쿼리셋 합치고 중복 제거 후 최신순 정렬
        return (public_routines | shared_routines).distinct().order_by("-created_at")
