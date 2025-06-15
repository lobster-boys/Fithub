"""
ViewSet 기반 API Views를 위한 공통 베이스 클래스 및 믹스인
"""
from typing import Any, Protocol, Optional, Type
from django.db import models, transaction
from django.http import HttpRequest
from rest_framework import viewsets, permissions, status, serializers
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from rest_framework.request import Request


class StandardResultsSetPagination(PageNumberPagination):
    """표준 페이지네이션 설정"""
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100


# ViewSet 기능을 정의하는 Protocol
class ViewSetProtocol(Protocol):
    """ViewSet이 제공해야 하는 메서드들을 정의하는 Protocol"""
    request: Request
    queryset: Optional[models.QuerySet[Any]]
    search_fields: Optional[list[str]]
    user_field: str
    
    def get_queryset(self) -> models.QuerySet[Any]: ...
    def get_serializer(self, *args: Any, **kwargs: Any) -> serializers.BaseSerializer: ...
    def get_object(self) -> models.Model: ...
    def paginate_queryset(self, queryset: models.QuerySet[Any]) -> Optional[list[Any]]: ...
    def get_paginated_response(self, data: Any) -> Response: ...


class BaseViewSet(viewsets.ModelViewSet):
    """
    모든 ViewSet의 베이스 클래스
    공통 기능들을 여기에 정의
    """
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = StandardResultsSetPagination
    search_fields: Optional[list[str]] = None
    
    def get_queryset(self):
        """기본 쿼리셋 - 각 ViewSet에서 오버라이드"""
        return super().get_queryset()
    
    @action(detail=False, methods=['get'])
    def search(self, request):
        """공통 검색 기능"""
        search_term = request.query_params.get('q', '')
        if not search_term:
            return Response({'error': '검색어를 입력해주세요.'}, status=400)
        
        # 각 ViewSet에서 search_fields를 정의해야 함
        if self.search_fields:
            queryset = self.get_queryset()
            for field in self.search_fields:
                queryset = queryset.filter(**{f"{field}__icontains": search_term})
            
            page = self.paginate_queryset(queryset)
            if page is not None:
                serializer = self.get_serializer(page, many=True)
                return self.get_paginated_response(serializer.data)
                
            serializer = self.get_serializer(queryset, many=True)
            return Response(serializer.data)
        
        return Response({'error': '검색 기능이 지원되지 않습니다.'}, status=400)


class UserOwnedMixin:
    """사용자 소유 객체를 위한 믹스인"""
    user_field: str = 'user'
    
    def get_queryset(self: ViewSetProtocol) -> models.QuerySet[Any]:
        """현재 사용자의 객체만 반환"""
        queryset = super().get_queryset()  # type: ignore
        user_field = getattr(self, 'user_field', 'user')
        return queryset.filter(**{user_field: self.request.user})
    
    def perform_create(self: ViewSetProtocol, serializer: serializers.BaseSerializer) -> None:
        """생성 시 현재 사용자를 자동으로 설정"""
        user_field = getattr(self, 'user_field', 'user')
        serializer.save(**{user_field: self.request.user})


class BulkActionMixin:
    """벌크 액션을 위한 믹스인"""
    
    @action(detail=False, methods=['post'])
    def bulk_create(self: ViewSetProtocol, request: Request) -> Response:
        """대량 생성"""
        serializer = self.get_serializer(data=request.data, many=True)
        if serializer.is_valid():
            with transaction.atomic():
                serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['patch'])
    def bulk_update(self: ViewSetProtocol, request: Request) -> Response:
        """대량 수정"""
        try:
            items = request.data.get('items', [])  # type: ignore
        except (AttributeError, TypeError):
            return Response({'error': 'items 필드가 필요합니다.'}, status=400)
            
        if not items:
            return Response({'error': 'items 필드가 필요합니다.'}, status=400)
        
        updated_items = []
        queryset = self.get_queryset()
        model_class = queryset.model
        
        with transaction.atomic():
            for item_data in items:
                try:
                    item_id = item_data.get('id')  # type: ignore
                except (AttributeError, TypeError):
                    continue
                    
                if not item_id:
                    continue
                
                try:
                    instance = queryset.get(id=item_id)
                    serializer = self.get_serializer(instance, data=item_data, partial=True)
                    if serializer.is_valid():
                        serializer.save()
                        updated_items.append(serializer.data)
                except model_class.DoesNotExist:
                    continue
        
        return Response(updated_items)
    
    @action(detail=False, methods=['delete'])
    def bulk_delete(self: ViewSetProtocol, request: Request) -> Response:
        """대량 삭제"""
        try:
            ids = request.data.get('ids', [])  # type: ignore
        except (AttributeError, TypeError):
            return Response({'error': 'ids 필드가 필요합니다.'}, status=400)
            
        if not ids:
            return Response({'error': 'ids 필드가 필요합니다.'}, status=400)
        
        with transaction.atomic():
            deleted_count = self.get_queryset().filter(id__in=ids).delete()[0]
        
        return Response({'deleted_count': deleted_count})


class ToggleActiveMixin:
    """활성/비활성 토글을 위한 믹스인"""
    
    @action(detail=True, methods=['post'])
    def toggle_active(self: ViewSetProtocol, request: Request, pk: Optional[str] = None) -> Response:
        """활성/비활성 상태 토글"""
        instance = self.get_object()
        if hasattr(instance, 'is_active'):
            # type: ignore를 사용하여 타입 체커 우회
            instance.is_active = not instance.is_active  # type: ignore
            instance.save()
            
            serializer = self.get_serializer(instance)
            return Response(serializer.data)
        
        return Response({'error': 'is_active 필드가 없습니다.'}, status=400)


class StatsMixin:
    """통계 기능을 위한 믹스인"""
    
    @action(detail=False, methods=['get'])
    def stats(self: ViewSetProtocol, request: Request) -> Response:
        """기본 통계"""
        queryset = self.get_queryset()
        total_count = queryset.count()
        
        stats_data = {
            'total_count': total_count,
        }
        
        # 활성/비활성 상태가 있다면 추가
        if hasattr(queryset.model, 'is_active'):
            active_count = queryset.filter(is_active=True).count()
            inactive_count = total_count - active_count
            stats_data.update({
                'active_count': active_count,
                'inactive_count': inactive_count,
            })
        
        # 생성일이 있다면 추가
        if hasattr(queryset.model, 'created_at'):
            from datetime import datetime, timedelta
            today = datetime.now().date()
            week_ago = today - timedelta(days=7)
            month_ago = today - timedelta(days=30)
            
            stats_data.update({
                'created_today': queryset.filter(created_at__date=today).count(),
                'created_this_week': queryset.filter(created_at__date__gte=week_ago).count(),
                'created_this_month': queryset.filter(created_at__date__gte=month_ago).count(),
            })
        
        return Response(stats_data)


class FavoritesMixin:
    """즐겨찾기 기능을 위한 믹스인"""
    
    @action(detail=True, methods=['post'])
    def add_to_favorites(self: ViewSetProtocol, request: Request, pk: Optional[str] = None) -> Response:
        """즐겨찾기 추가"""
        # 구현은 각 앱에서 favorite 모델에 따라 달라질 수 있음
        return Response({'message': '즐겨찾기에 추가되었습니다.'})
    
    @action(detail=True, methods=['delete'])
    def remove_from_favorites(self: ViewSetProtocol, request: Request, pk: Optional[str] = None) -> Response:
        """즐겨찾기 제거"""
        # 구현은 각 앱에서 favorite 모델에 따라 달라질 수 있음
        return Response({'message': '즐겨찾기에서 제거되었습니다.'})
    
    @action(detail=False, methods=['get'])
    def favorites(self: ViewSetProtocol, request: Request) -> Response:
        """사용자의 즐겨찾기 목록"""
        # 구현은 각 앱에서 favorite 모델에 따라 달라질 수 있음
        return Response([]) 