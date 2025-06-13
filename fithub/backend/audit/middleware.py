# middleware.py
from django.utils.deprecation import MiddlewareMixin
import threading

_user = threading.local()

class AuditLogMiddleware(MiddlewareMixin):
    """변경 로그를 위한 사용자 정보 추적 미들웨어"""
    
    def process_request(self, request):
        _user.value = getattr(request, 'user', None)
        return None
    
    def process_response(self, request, response):
        if hasattr(_user, 'value'):
            del _user.value
        return response

def get_current_user():
    return getattr(_user, 'value', None)

# models.py의 save() 메서드에서 사용
def save(self, *args, **kwargs):
    self._current_user = get_current_user()
    super().save(*args, **kwargs)
