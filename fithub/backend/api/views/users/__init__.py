# User profile views
from .profile_views import UserProfileCreateView, UserProfileDetail

# Social login views
from .social_views import KakaoLoginView

from dj_rest_auth.registration.views import RegisterView
from rest_framework.response import Response
from rest_framework import status
from api.serializers.users.registration_serializers import CustomRegisterSerializer


class CustomRegisterView(RegisterView):
    serializer_class = CustomRegisterSerializer
    
    def create(self, request, *args, **kwargs):
        print(f"DEBUG: Received request data: {request.data}")
        print(f"DEBUG: Request content type: {request.content_type}")
        print(f"DEBUG: Request method: {request.method}")
        print(f"DEBUG: Request headers: {dict(request.headers)}")
        
        try:
            serializer = self.get_serializer(data=request.data)
            print(f"DEBUG: Serializer created successfully")
            
            is_valid = serializer.is_valid(raise_exception=False)
            print(f"DEBUG: Serializer is_valid: {is_valid}")
            
            if not is_valid:
                print(f"DEBUG: Serializer errors: {serializer.errors}")
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
            print(f"DEBUG: Serializer validation passed, proceeding to create user")
            user = self.perform_create(serializer)
            headers = self.get_success_headers(serializer.data)
            data = self.get_response_data(user)

            if data:
                response = Response(
                    data,
                    status=status.HTTP_201_CREATED,
                    headers=headers,
                )
            else:
                response = Response(status=status.HTTP_204_NO_CONTENT, headers=headers)

            return response
            
        except Exception as e:
            print(f"DEBUG: Exception in create(): {type(e).__name__}: {e}")
            import traceback
            print(f"DEBUG: Traceback: {traceback.format_exc()}")
            raise

__all__ = [
    'UserProfileCreateView',
    'UserProfileDetail',
    'KakaoLoginView',
] 