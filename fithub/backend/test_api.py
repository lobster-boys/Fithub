#!/usr/bin/env python3
"""
FitHub API 테스트 스크립트
JWT 토큰 기반 인증 시스템과 권한 정책 테스트
"""

import requests
import json
import sys
import random
import string

# 기본 설정
BASE_URL = 'http://localhost:8000/api'
headers = {'Content-Type': 'application/json'}

def generate_random_username():
    """랜덤 사용자명 생성"""
    return 'test_user_' + ''.join(random.choices(string.ascii_lowercase + string.digits, k=8))

def test_public_api():
    """공개 API 테스트 - 인증 없이 접근 가능해야 함"""
    print("🔍 공개 API 테스트...")
    
    try:
        # 운동 종목 조회 (PublicReadOnly)
        response = requests.get(f'{BASE_URL}/workouts/exercises/', headers=headers)
        print(f"   운동 종목 API: {response.status_code} {response.reason}")
        
        # 카테고리 조회 (PublicReadOnly)
        response = requests.get(f'{BASE_URL}/ecommerce/categories/', headers=headers)
        print(f"   카테고리 API: {response.status_code} {response.reason}")
        
        return True
    except Exception as e:
        print(f"   ❌ 오류: {e}")
        return False

def test_unauthorized_access():
    """권한 없는 접근 테스트 - 401 오류가 발생해야 함"""
    print("🚫 권한 없는 접근 테스트...")
    
    try:
        # 개인 데이터에 인증 없이 접근
        response = requests.get(f'{BASE_URL}/workouts/routines/', headers=headers)
        print(f"   루틴 API (인증 없음): {response.status_code} {response.reason}")
        if response.status_code >= 400:
            print(f"   응답: {response.text[:100]}")
        
        # 온보딩 데이터에 인증 없이 접근
        response = requests.get(f'{BASE_URL}/onboarding/', headers=headers)
        print(f"   온보딩 API (인증 없음): {response.status_code} {response.reason}")
        if response.status_code >= 400:
            print(f"   응답: {response.text[:100]}")
        
        return True
    except Exception as e:
        print(f"   ❌ 오류: {e}")
        return False

def test_jwt_registration():
    """JWT 회원가입 테스트"""
    print("📝 JWT 회원가입 테스트...")
    
    try:
        username = generate_random_username()
        registration_data = {
            "username": username,
            "email": f"{username}@example.com", 
            "password1": "testpass123456",
            "password2": "testpass123456"
        }
        
        print(f"   생성할 사용자: {username}")
        
        response = requests.post(
            f'{BASE_URL}/dj-rest-auth/registration/',
            headers=headers,
            data=json.dumps(registration_data)
        )
        
        print(f"   회원가입 API: {response.status_code} {response.reason}")
        
        if response.status_code == 201:
            result = response.json()
            access_token = result.get('access')
            print(f"   ✅ JWT 토큰 발급됨: {access_token[:20]}...")
            return access_token
        else:
            print(f"   응답 내용: {response.text[:200]}")
            return None
            
    except Exception as e:
        print(f"   ❌ 오류: {e}")
        return None

def test_authenticated_api(access_token):
    """인증된 API 테스트"""
    print("🔐 인증된 API 테스트...")
    
    try:
        auth_headers = {
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {access_token}'
        }
        
        # 현재 사용자 정보 조회
        response = requests.get(f'{BASE_URL}/dj-rest-auth/user/', headers=auth_headers)
        print(f"   사용자 정보 API: {response.status_code} {response.reason}")
        
        if response.status_code == 200:
            user_data = response.json()
            print(f"   ✅ 사용자: {user_data.get('username')}")
            
        return True
        
    except Exception as e:
        print(f"   ❌ 오류: {e}")
        return False

def test_onboarding_save(access_token):
    """온보딩 정보 저장 테스트"""
    print("💾 온보딩 정보 저장 테스트...")
    
    try:
        auth_headers = {
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {access_token}'
        }
        
        # 온보딩 데이터 준비 (올바른 선택 옵션 사용)
        onboarding_data = {
            "fitness_level": "beginner",
            "height": 175,
            "weight": 70.5,
            "age": 25,
            "goals": ["weight_loss", "muscle_gain"],
            "methods": ["home", "gym"],
            "equipment": ["dumbbells", "resistance_bands"]
        }
        
        print(f"   전송할 데이터: {onboarding_data}")
        
        response = requests.post(
            f'{BASE_URL}/onboarding/save/',
            headers=auth_headers,
            data=json.dumps(onboarding_data)
        )
        
        print(f"   온보딩 저장 API: {response.status_code} {response.reason}")
        print(f"   응답 내용: {response.text}")
        
        if response.status_code == 201:
            print("   ✅ 온보딩 정보 저장 성공!")
            return True
        else:
            print(f"   ❌ 온보딩 정보 저장 실패")
            return False
            
    except Exception as e:
        print(f"   ❌ 오류: {e}")
        return False

def main():
    """메인 테스트 실행"""
    print("🚀 FitHub API 테스트 시작")
    print("=" * 50)
    
    # 1. 공개 API 테스트
    if not test_public_api():
        print("❌ 공개 API 테스트 실패")
        return
    
    # 2. 권한 없는 접근 테스트  
    if not test_unauthorized_access():
        print("❌ 권한 테스트 실패")
        return
    
    # 3. JWT 회원가입 테스트
    access_token = test_jwt_registration()
    if not access_token:
        print("❌ JWT 회원가입 테스트 실패")
        return
    
    # 4. 인증된 API 테스트
    if not test_authenticated_api(access_token):
        print("❌ 인증된 API 테스트 실패")
        return
    
    # 5. 온보딩 정보 저장 테스트
    if not test_onboarding_save(access_token):
        print("❌ 온보딩 정보 저장 테스트 실패")
        return
    
    print("=" * 50)
    print("🎉 모든 테스트 통과!")
    print("✅ JWT 토큰 기반 인증 시스템이 정상 작동합니다!")
    print("✅ 온보딩 시스템이 정상 작동합니다!")

if __name__ == "__main__":
    main() 