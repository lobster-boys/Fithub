from rest_framework.permissions import BasePermission

class IsOwnerOrReadOnly(BasePermission):
    # 인증된 사용자만 자신의 프로필을 수정할 수 있도록 권한 설정
    # 다른 사용자의 프로필에 접근할 경우 조회만 가능(ReadOnly)
    # 공식 문서: https://www.django-rest-framework.org/api-guide/permissions/

    def has_object_permission(self, request, view, obj):

        # 일기 요청일 경우 모든 사용자 허용
        if request.method in ['GET', 'HEAD', 'OPTIONS']:
            return True
        
        # 관리자는 모든 프로필을 수정 가능
        if request.user.is_staff:
            return True
        
        # 쓰기 요청(PATCH, DELETE) 요청의 경우, 객체의 소유자만 허용
        return obj.user == request.user