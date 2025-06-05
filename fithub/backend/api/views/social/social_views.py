from allauth.socialaccount.providers.kakao.views import KakaoOAuth2Adapter
from allauth.socialaccount.providers.naver.views import NaverOAuth2Adapter
from allauth.socialaccount.providers.google.views import GoogleOAuth2Adapter
from allauth.socialaccount.providers.oauth2.client import OAuth2Client
from dj_rest_auth.registration.views import SocialLoginView
import os

class KakaoLoginView(SocialLoginView):
    adapter_class = KakaoOAuth2Adapter
    client_class = OAuth2Client
    callback_url = os.environ.get("KAKAO_CALLBACK_URL", "http://localhost:3000/auth/kakao/callback/")


class NaverLoginView(SocialLoginView):
    adapter_class = NaverOAuth2Adapter
    client_class = OAuth2Client
    callback_url = os.environ.get("KAKAO_CALLBACK_URL", "http://localhost:3000/auth/naver/callback/")



class GoogleLoginView(SocialLoginView):
    adapter_class = GoogleOAuth2Adapter
    client_class = OAuth2Client
    callback_url = os.environ.get("KAKAO_CALLBACK_URL", "http://localhost:3000/auth/google/callback/")
