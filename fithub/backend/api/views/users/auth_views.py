from django.contrib.auth import logout as django_logout
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny


@method_decorator(csrf_exempt, name='dispatch')
class CustomLogoutView(APIView):
    """
    CSRF 없이 동작하는 커스텀 로그아웃 뷰
    """
    permission_classes = (AllowAny,)
    
    def post(self, request, *args, **kwargs):
        """POST 요청으로 로그아웃"""
        try:
            if request.user and request.user.is_authenticated:
                django_logout(request)
                return Response(
                    {'detail': 'Successfully logged out.'}, 
                    status=status.HTTP_200_OK
                )
            else:
                return Response(
                    {'detail': 'User was not authenticated.'}, 
                    status=status.HTTP_200_OK
                )
        except Exception as e:
            return Response(
                {'detail': 'Logout completed.'}, 
                status=status.HTTP_200_OK
            )
    
    def get(self, request, *args, **kwargs):
        """GET 요청으로도 로그아웃 허용 (개발 편의상)"""
        return self.post(request, *args, **kwargs) 