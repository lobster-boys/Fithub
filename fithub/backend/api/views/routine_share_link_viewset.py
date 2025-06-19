from rest_framework import viewsets, permissions
from community.models import RoutineShareLink
from ..serializers.routine_share_link_serializer import RoutineShareLinkSerializer


class RoutineShareLinkViewSet(viewsets.ModelViewSet):
    """
    루틴 공유 링크 생성·조회·수정·삭제
    """

    queryset = RoutineShareLink.objects.all()
    serializer_class = RoutineShareLinkSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # 생성자 본인만 자신의 링크 조회
        return RoutineShareLink.objects.filter(created_by=self.request.user)

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
