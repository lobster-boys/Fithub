#!/usr/bin/env python3
import requests
import json

def test_onboarding_choices():
    """온보딩 선택지 API 테스트"""
    print("🔍 온보딩 선택지 API 테스트...")
    
    try:
        response = requests.get('http://localhost:8000/api/onboarding/choices/')
        print(f"상태코드: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print("✅ 성공! 받은 선택지:")
            print(json.dumps(data, indent=2, ensure_ascii=False))
        else:
            print(f"❌ 실패: {response.text}")
            
    except Exception as e:
        print(f"❌ 오류: {e}")

if __name__ == "__main__":
    test_onboarding_choices() 