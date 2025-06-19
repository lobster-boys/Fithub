#!/usr/bin/env python3
"""
FitHub 온보딩 정보 저장 테스트 스크립트
"""

import requests
import json
import random
import string

# 기본 설정
BASE_URL = 'http://localhost:8000/api'
headers = {'Content-Type': 'application/json'}

def generate_random_username():
    """랜덤 사용자명 생성"""
    return 'onboard_user_' + ''.join(random.choices(string.ascii_lowercase + string.digits, k=8))

def test_user_registration():
    """사용자 등록 후 JWT 토큰 반환"""
    print("👤 사용자 등록 테스트...")
    
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
            return access_token, username
        else:
            print(f"   응답 내용: {response.text[:200]}")
            return None, None
            
    except Exception as e:
        print(f"   ❌ 오류: {e}")
        return None, None

def test_onboarding_save(access_token):
    """온보딩 정보 저장 테스트"""
    print("💾 온보딩 정보 저장 테스트...")
    
    try:
        auth_headers = {
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {access_token}'
        }
        
        # 온보딩 데이터 준비
        onboarding_data = {
            "fitness_level": "beginner",
            "height": 175,
            "weight": 70.5,
            "age": 25,
            "goals": ["weight_loss", "muscle_gain"],
            "methods": ["home_workout", "gym"],
            "equipment": ["dumbbell", "resistance_band"]
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

def test_onboarding_data_retrieve(access_token):
    """온보딩 정보 조회 테스트"""
    print("📖 온보딩 정보 조회 테스트...")
    
    try:
        auth_headers = {
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {access_token}'
        }
        
        response = requests.get(
            f'{BASE_URL}/onboarding/data/',
            headers=auth_headers
        )
        
        print(f"   온보딩 조회 API: {response.status_code} {response.reason}")
        
        if response.status_code == 200:
            result = response.json()
            print(f"   ✅ 완료 상태: {result.get('completed')}")
            if result.get('data'):
                data = result['data']
                print(f"   ✅ 피트니스 레벨: {data.get('fitness_level')}")
                print(f"   ✅ 키/몸무게: {data.get('height')}cm, {data.get('weight')}kg")
                print(f"   ✅ 목표: {data.get('goals')}")
            return True
        else:
            print(f"   응답 내용: {response.text[:200]}")
            return False
            
    except Exception as e:
        print(f"   ❌ 오류: {e}")
        return False

def main():
    """메인 테스트 실행"""
    print("🚀 FitHub 온보딩 정보 저장 테스트 시작")
    print("=" * 60)
    
    # 1. 사용자 등록
    access_token, username = test_user_registration()
    if not access_token:
        print("❌ 사용자 등록 실패")
        return
    
    print()
    
    # 2. 온보딩 정보 저장
    if not test_onboarding_save(access_token):
        print("❌ 온보딩 정보 저장 실패")
        return
    
    print()
    
    # 3. 온보딩 정보 조회
    if not test_onboarding_data_retrieve(access_token):
        print("❌ 온보딩 정보 조회 실패")
        return
    
    print()
    print("=" * 60)
    print("🎉 모든 온보딩 테스트 통과!")
    print(f"✅ 사용자 {username}의 온보딩이 성공적으로 완료되었습니다!")

if __name__ == "__main__":
    main() 