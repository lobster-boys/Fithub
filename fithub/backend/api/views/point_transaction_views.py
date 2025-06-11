from rest_framework import viewsets, permissions
from challenge_checker.models import PointTransaction
from api.serializers.point_transaction_serializer import PointTransactionSerializer


class PointTransactionViewSet(viewsets.ReadOnlyModelViewSet):
    """
    로그인한 유저의 포인트 적립 내역 조회 API
    """

    serializer_class = PointTransactionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # 본인 기록만 리턴
        return PointTransaction.objects.filter(user=self.request.user)
