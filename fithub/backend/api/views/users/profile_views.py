from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from ...serializers.users import userprofile_serializers
from users.models import UserProfile
from django.shortcuts import get_object_or_404
from users.permissions import IsOwnerOrReadOnly
from api.views.base import BaseViewSet, UserOwnedMixin


class UserProfileViewSet(UserOwnedMixin, BaseViewSet):
    """사용자 프로필 ViewSet"""
    queryset = UserProfile.objects.all()
    serializer_class = userprofile_serializers.UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrReadOnly]
    user_field = 'user'
    search_fields = ['bio', 'location']
    
    def get_serializer_class(self):
        if self.action == 'create':
            return userprofile_serializers.UserProfileCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return userprofile_serializers.UserProfileUpdateSerializer
        return userprofile_serializers.UserProfileSerializer
    
    def perform_create(self, serializer):
        # 이미 프로필이 존재하는지 확인
        if UserProfile.objects.filter(user=self.request.user).exists():
            from rest_framework.exceptions import ValidationError
            raise ValidationError({'detail': '프로필이 이미 존재합니다.'})
        
        serializer.save(user=self.request.user)
    
    @action(detail=False, methods=['get'])
    def my_profile(self, request):
        """현재 사용자의 프로필 조회"""
        try:
            profile = UserProfile.objects.get(user=request.user)
            serializer = self.get_serializer(profile)
            return Response(serializer.data)
        except UserProfile.DoesNotExist:
            return Response(
                {'detail': '프로필이 존재하지 않습니다.'}, 
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=False, methods=['post'])
    def create_my_profile(self, request):
        """현재 사용자의 프로필 생성"""
        if UserProfile.objects.filter(user=request.user).exists():
            return Response(
                {'detail': '프로필이 이미 존재합니다.'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = userprofile_serializers.UserProfileCreateSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['patch'])
    def update_my_profile(self, request):
        """현재 사용자의 프로필 업데이트"""
        try:
            profile = UserProfile.objects.get(user=request.user)
        except UserProfile.DoesNotExist:
            return Response(
                {'detail': '프로필이 존재하지 않습니다.'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        serializer = userprofile_serializers.UserProfileUpdateSerializer(
            profile, data=request.data, partial=True
        )
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['delete'])
    def delete_my_profile(self, request):
        """현재 사용자의 프로필 삭제"""
        try:
            profile = UserProfile.objects.get(user=request.user)
            profile.delete()
            return Response(
                {'detail': '프로필이 삭제되었습니다.'}, 
                status=status.HTTP_204_NO_CONTENT
            )
        except UserProfile.DoesNotExist:
            return Response(
                {'detail': '프로필이 존재하지 않습니다.'}, 
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=True, methods=['get'])
    def public_info(self, request, pk=None):
        """다른 사용자의 공개 정보 조회"""
        profile = self.get_object()
        
        # 공개 정보만 반환하는 간단한 serializer
        public_data = {
            'id': profile.id,
            'username': profile.user.username,
            'bio': profile.bio,
            'location': profile.location,
            'profile_image': profile.profile_image.url if profile.profile_image else None,
            'created_at': profile.created_at,
        }
        
        return Response(public_data)


# 레거시 뷰들 (하위 호환성을 위해 유지)
class UserProfileDetail(APIView):
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrReadOnly]

    def get(self, request, pk):
        profile = get_object_or_404(UserProfile, pk=pk)
        serializer = userprofile_serializers.UserProfileSerializer(profile)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    def patch(self, request, pk):
        profile = get_object_or_404(UserProfile, pk=pk)
        serializer = userprofile_serializers.UserProfileUpdateSerializer(profile, data=request.data, partial=True)

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        profile = get_object_or_404(UserProfile, pk=pk)

        if profile.user != request.user:
            return Response({'detail': '자신의 프로필만 삭제할 수 있습니다.'}, status=status.HTTP_403_FORBIDDEN)
        
        profile.delete()
        return Response({'detail': '프로필이 삭제되었습니다.'}, status=status.HTTP_204_NO_CONTENT)
    

class UserProfileCreateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        # 이미 프로필이 존재하는지 확인 
        if UserProfile.objects.filter(user=request.user).exists():
            return Response({'detail': '프로필이 이미 존재합니다.'}, status=status.HTTP_400_BAD_REQUEST)

        serializer = userprofile_serializers.UserProfileCreateSerializer(data=request.data)

        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
