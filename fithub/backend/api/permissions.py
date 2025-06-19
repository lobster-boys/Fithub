from rest_framework import permissions
from community.models import RoutineSharePermission


class IsSharedRoutine(permissions.BasePermission):
    """
    GET(SAFE_METHODS) → VIEW 이상
    PUT/PATCH        → EDIT 이상
    DELETE           → ADMIN 전용
    """

    def has_object_permission(self, request, view, obj):
        # obj는 community.Routine 인스턴스
        user = request.user
        if not user.is_authenticated:
            return False

        # 소유자는 모든 권한 허용
        if obj.user == user:
            return True

        if request.method in permissions.SAFE_METHODS:
            return RoutineSharePermission.has_view(obj, user)
        elif request.method in ("PUT", "PATCH"):
            return RoutineSharePermission.has_edit(obj, user)
        elif request.method == "DELETE":
            return RoutineSharePermission.has_admin(obj, user)

        return False


# ======== 새로 추가되는 세분화된 권한 클래스들 ========

class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    소유자는 모든 권한, 나머지는 읽기만
    사용자 프로필, 공개 루틴 등에 사용
    """
    
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated
    
    def has_object_permission(self, request, view, obj):
        # 읽기는 인증된 사용자 모두 허용
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # 관리자는 모든 권한 허용
        if request.user.is_staff:
            return True
        
        # 수정/삭제는 소유자만
        return obj.user == request.user


class IsOwnerOnly(permissions.BasePermission):
    """
    소유자만 모든 권한 (CRUD)
    개인 데이터 - 장바구니, 주문, 운동 로그, 루틴 등에 사용
    """
    
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated
    
    def has_object_permission(self, request, view, obj):
        # 관리자는 모든 권한 허용
        if request.user.is_staff:
            return True
        
        # 소유자만 허용
        return obj.user == request.user


class PublicReadCreateOwnerWrite(permissions.BasePermission):
    """
    - 읽기: 모든 사람 허용 (인증 불필요)
    - 생성: 인증된 사용자만
    - 수정/삭제: 소유자만
    
    커뮤니티 게시글, 상품 리뷰 등에 사용
    """
    
    def has_permission(self, request, view):
        # 읽기는 인증 불필요
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # 생성/수정/삭제는 인증 필요
        return request.user and request.user.is_authenticated
    
    def has_object_permission(self, request, view, obj):
        # 읽기는 모든 사람 허용
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # 관리자는 모든 권한 허용
        if request.user.is_staff:
            return True
        
        # 수정/삭제는 소유자만
        return obj.user == request.user


class PublicReadOnly(permissions.BasePermission):
    """
    모든 사람에게 읽기만 허용, 쓰기는 관리자만
    공통 데이터(운동 종목, 음식 데이터, 카테고리 등)에 사용
    """
    
    def has_permission(self, request, view):
        # 읽기는 인증 불필요
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # 쓰기는 관리자만
        return request.user and request.user.is_authenticated and request.user.is_staff


class AuthenticatedReadOwnerWrite(permissions.BasePermission):
    """
    - 읽기: 인증된 사용자만
    - 수정/삭제: 소유자만
    
    온보딩 데이터, 사용자 통계 등에 사용
    """
    
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated
    
    def has_object_permission(self, request, view, obj):
        # 읽기는 인증된 사용자 모두 허용
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # 관리자는 모든 권한 허용
        if request.user.is_staff:
            return True
        
        # 수정/삭제는 소유자만
        return obj.user == request.user


class IsCreatorOrReadOnly(permissions.BasePermission):
    """
    생성자는 모든 권한, 나머지는 읽기만
    챌린지 등에 사용 (creator 필드 사용)
    """
    
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated
    
    def has_object_permission(self, request, view, obj):
        # 읽기는 인증된 사용자 모두 허용
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # 관리자는 모든 권한 허용
        if request.user.is_staff:
            return True
        
        # 수정/삭제는 생성자만
        return obj.creator == request.user


# ======== 권한 클래스 매핑 가이드 ========
"""
권한 클래스 사용 가이드:

1. PublicReadOnly
   - 운동 종목 (Exercise)
   - 음식 데이터 (Food) - 공통 데이터
   - 상품 카테고리 (Category)
   - 운동 타입 (WorkoutType)

2. PublicReadCreateOwnerWrite  
   - 커뮤니티 게시글 (Post)
   - 상품 리뷰 (Review)
   - 댓글 (Comment)

3. IsOwnerOnly
   - 장바구니 (Cart, CartItem)
   - 주문 (Order)
   - 개인 운동 로그 (WorkoutLog)
   - 개인 루틴 (WorkoutRoutine)
   - 포인트 내역 (PointTransaction)

4. IsOwnerOrReadOnly
   - 사용자 프로필 (UserProfile)
   - 온보딩 데이터 (OnboardingData)

5. AuthenticatedReadOwnerWrite
   - 식단 계획 (MealPlan)
   - 운동 통계 (WorkoutStats)

6. IsCreatorOrReadOnly
   - 챌린지 (Challenge)
   - 공유 루틴

7. permissions.IsAuthenticated (기본)
   - 기타 인증이 필요한 모든 API
"""
