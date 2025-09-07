from django.apps import AppConfig
import logging


class ApiConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'api'

    def ready(self):
        """Compatibility patch for django-allauth >= 0.65 and dj-rest-auth <= 7.0
        dj-rest-auth 소셜 직렬화기(code 교환 로직)가 provider.get_scope(request)
        시그니처( self, request )를 기대하지만, allauth 0.65 의 OAuth2Provider.get_scope
        는 (self) 만 받도록 변경되었습니다. 이로 인해 TypeError 가 발생합니다.

        아래 패치는 get_scope 를 래핑하여 *(self, request=None)* 형태를 모두 허용하도록
        수정합니다.
        """
        try:
            from allauth.socialaccount.providers.oauth2.provider import OAuth2Provider
            from allauth.socialaccount.providers.oauth2.client import OAuth2Client, OAuth2Error

            if not getattr(OAuth2Provider, '_fithub_scope_patch', False):
                orig_get_scope = OAuth2Provider.get_scope

                def get_scope_compat(self, *args, **kwargs):
                    # 호출이 (self, request) 형태면 -> get_scope_from_request 사용
                    if args:
                        request = args[0]
                        return OAuth2Provider.get_scope_from_request(self, request)
                    # 기존 시그니처 유지
                    return orig_get_scope(self)

                OAuth2Provider.get_scope = get_scope_compat  # type: ignore[method-assign]
                OAuth2Provider._fithub_scope_patch = True

            # Patch OAuth2Client __init__ signature mismatch (dj-rest-auth expects *scope* arg)
            if not getattr(OAuth2Client, '_fithub_init_patch', False):
                orig_init = OAuth2Client.__init__

                def init_compat(self, request, consumer_key, consumer_secret,
                                access_token_method, access_token_url, callback_url, *args, **kwargs):
                    # If an extra positional arg is given, dj-rest-auth passed `scope`
                    if args:
                        # Remove first arg (scope) – OAuth2Client no longer takes it
                        args = args[1:]
                    return orig_init(self, request, consumer_key, consumer_secret,
                                     access_token_method, access_token_url, callback_url, *args, **kwargs)

                OAuth2Client.__init__ = init_compat  # type: ignore[method-assign]
                OAuth2Client._fithub_init_patch = True

            # Add debug logging for token exchange
            def _token_debug(self, *args, **kwargs):
                try:
                    return _orig_get_access_token(self, *args, **kwargs)
                except OAuth2Error as e:
                    logging.error("★ Kakao token exchange error raw response: %s", e)
                    raise

            _orig_get_access_token = OAuth2Client.get_access_token
            OAuth2Client.get_access_token = _token_debug
        except Exception as e:
            # 로깅만 하고 앱 기동은 계속
            logging.getLogger(__name__).warning("OAuth2Provider get_scope patch failed: %s", e)
