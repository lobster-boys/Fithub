from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from ecommerce.models import ShippingAddress
from api.serializers.ecommerce.order_serializers import ShippingAddressSerializer


class ShippingAddressViewSet(viewsets.ModelViewSet):
    """
    배송지 관리 ViewSet
    - 사용자별 배송지 CRUD 기능 제공
    - 기본 배송지 설정 기능 포함
    """
    serializer_class = ShippingAddressSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """현재 사용자의 배송지만 반환"""
        return ShippingAddress.objects.filter(user=self.request.user).order_by('-is_default', '-created_at')

    def perform_create(self, serializer):
        """배송지 생성 시 현재 사용자로 설정"""
        # 새로운 배송지가 기본 배송지로 설정되면 기존 기본 배송지 해제
        if serializer.validated_data.get('is_default', False):
            ShippingAddress.objects.filter(
                user=self.request.user, 
                is_default=True
            ).update(is_default=False)
        
        serializer.save(user=self.request.user)

    def perform_update(self, serializer):
        """배송지 수정 시 기본 배송지 설정 관리"""
        # 새로운 배송지가 기본 배송지로 설정되면 기존 기본 배송지 해제
        if serializer.validated_data.get('is_default', False):
            ShippingAddress.objects.filter(
                user=self.request.user, 
                is_default=True
            ).exclude(id=self.get_object().id).update(is_default=False)
        
        serializer.save()

    @action(detail=True, methods=['patch'])
    def set_default(self, request, pk=None):
        """특정 배송지를 기본 배송지로 설정"""
        shipping_address = self.get_object()
        
        # 기존 기본 배송지 해제
        ShippingAddress.objects.filter(
            user=request.user, 
            is_default=True
        ).update(is_default=False)
        
        # 선택한 배송지를 기본으로 설정
        shipping_address.is_default = True
        shipping_address.save()
        
        return Response({
            'message': '기본 배송지로 설정되었습니다.',
            'data': self.get_serializer(shipping_address).data
        })

    @action(detail=False, methods=['get'])
    def default(self, request):
        """현재 사용자의 기본 배송지 조회"""
        try:
            default_address = ShippingAddress.objects.get(
                user=request.user, 
                is_default=True
            )
            serializer = self.get_serializer(default_address)
            return Response(serializer.data)
        except ShippingAddress.DoesNotExist:
            return Response(
                {'message': '기본 배송지가 설정되지 않았습니다.'}, 
                status=status.HTTP_404_NOT_FOUND
            )

    def destroy(self, request, *args, **kwargs):
        """배송지 삭제"""
        shipping_address = self.get_object()
        
        # 기본 배송지를 삭제하는 경우, 다른 배송지를 기본으로 설정
        if shipping_address.is_default:
            other_addresses = ShippingAddress.objects.filter(
                user=request.user
            ).exclude(id=shipping_address.id).first()
            
            if other_addresses:
                other_addresses.is_default = True
                other_addresses.save()
        
        return super().destroy(request, *args, **kwargs) 