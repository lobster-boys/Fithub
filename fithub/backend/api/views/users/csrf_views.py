from django.http import JsonResponse
from django.middleware.csrf import get_token
from django.views.decorators.csrf import ensure_csrf_cookie
from django.views.decorators.http import require_GET


@ensure_csrf_cookie
@require_GET
def get_csrf_token(request):
    """CSRF 토큰을 클라이언트에 제공하는 뷰"""
    csrf_token = get_token(request)
    return JsonResponse({'csrfToken': csrf_token}) 