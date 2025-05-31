from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

from users.models import UserProfile
from django.shortcuts import get_object_or_404
from users.serializers import UserProfileUpdateSerializer, UserProfileCreateSerializer, UserProfileSerializer
from users.permissions import IsOwnerOrReadOnly


class UserProfileDetail(APIView):

    permission_classes = [IsAuthenticated ,IsOwnerOrReadOnly]

    def get(self, request, pk):
        profile = get_object_or_404(UserProfile, pk=pk)
        serializer = UserProfileSerializer(profile)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    def patch(self, request, pk):
        profile = get_object_or_404(UserProfile, pk=pk)
        serializer = UserProfileUpdateSerializer(profile, data=request.data, partial=True) # PATCH 요청 속성

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
    
    permission_classes = [IsAuthenticated]

    def post(slef, request):
        # 이미 프로필이 존재하는지 확인 
        if UserProfile.objects.filter(user=request.user).exists():
            return Response({'detail': '프로필이 이미 존재합니다.'}, status=status.HTTP_400_BAD_REQUEST)

        serializer = UserProfileCreateSerializer(data=request.data)

        if serializer.is_valid():
            serializer.save(user=request.user) # 현재 인증된 사용자로 저장
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
