# 💪 FitHub - 피트니스 통합 플랫폼

## 📋 프로젝트 개요

FitHub는 운동, 식단, 커뮤니티, 이커머스를 통합한 올인원 피트니스 플랫폼입니다. 사용자들이 건강한 라이프스타일을 유지하고 목표를 달성할 수 있도록 돕는 종합적인 웹 애플리케이션입니다.

### 주요 기능
- 🏋️ **운동 관리**: 운동 루틴 생성, 운동 기록 추적, 통계 분석
- 🍎 **식단 관리**: 식품 영양 정보, 식단 기록, 맞춤형 식단 추천
- 🏆 **챌린지 시스템**: 개인/그룹 챌린지 참여, 목표 달성 추적
- 💬 **커뮤니티**: 운동/식단 정보 공유, 사용자 간 소통
- 🛒 **이커머스**: 피트니스 관련 제품 구매, 리뷰 시스템
- 💰 **포인트 시스템**: 활동 보상, 포인트 적립 및 사용
- 📊 **통계 및 분석**: 개인 운동/식단 데이터 시각화

---

## 🛠️ 기술 스택

### Backend
- **Framework**: Django 5.1.6
- **API**: Django REST Framework 3.16.0
- **인증**: JWT (djangorestframework-simplejwt), dj-rest-auth
- **소셜 로그인**: django-allauth (카카오, 네이버, 구글)
- **데이터베이스**: SQLite (개발), PostgreSQL (프로덕션 권장)
- **추천 시스템**: PuLP (선형 프로그래밍)

### Frontend
- **Framework**: React 18.2.0
- **빌드 도구**: Vite 5.4.19
- **라우팅**: React Router DOM 6.20.0
- **HTTP 클라이언트**: Axios 1.6.2
- **스타일링**: Tailwind CSS 3.4.17
- **애니메이션**: Framer Motion 10.16.4
- **아이콘**: Lucide React

---

## 📁 프로젝트 구조

```
FitHub/
├── fithub/
│   ├── backend/          # Django 백엔드
│   │   ├── api/         # API 뷰셋 및 시리얼라이저
│   │   ├── users/       # 사용자 관리
│   │   ├── workouts/    # 운동 관리
│   │   ├── diet/        # 식단 관리
│   │   ├── community/   # 커뮤니티
│   │   ├── ecommerce/   # 이커머스
│   │   ├── challenge/   # 챌린지
│   │   ├── points/      # 포인트 시스템
│   │   ├── audit/       # 감사 로그
│   │   └── config/      # Django 설정
│   └── frontend/        # React 프론트엔드
│       ├── src/
│       │   ├── api/     # API 클라이언트
│       │   ├── components/  # React 컴포넌트
│       │   ├── pages/   # 페이지 컴포넌트
│       │   ├── hooks/   # 커스텀 훅
│       │   └── context/ # Context API
│       └── public/      # 정적 파일
└── README.md
```

## 🚀 설치 및 실행

### 사전 요구사항
- Python 3.8 이상
- Node.js 16.0 이상
- npm 또는 yarn

### 1. 저장소 클론
```bash
git clone <repository-url>
cd Fithub
```

### 2. 백엔드 설정

#### 가상환경 생성 및 활성화
```bash
# Windows
python -m venv fithub_env
fithub_env\Scripts\activate

# macOS/Linux
python -m venv fithub_env
source fithub_env/bin/activate
```

#### 의존성 설치
```bash
cd fithub/backend
pip install -r requirements.txt
```

#### 데이터베이스 마이그레이션
```bash
python manage.py makemigrations
python manage.py migrate
```

#### 슈퍼유저 생성
```bash
python manage.py createsuperuser
```

#### 초기 데이터 로드 (선택사항)
```bash
python manage.py load_initial_workout_data
python manage.py foods_seed
python manage.py categories_seed
python manage.py products_seed
```

#### 개발 서버 실행
```bash
python manage.py runserver
```

### 3. 프론트엔드 설정

#### 의존성 설치
```bash
cd fithub/frontend
npm install
```

#### 개발 서버 실행
```bash
npm run dev
```

### 4. 접속
- 백엔드: http://localhost:8000
- 프론트엔드: http://localhost:3000
- Django Admin: http://localhost:8000/admin

---

## 📖 모듈별 상세 설명

### 1. Users (사용자 관리)
- 사용자 인증 및 권한 관리
- 프로필 관리 (신체 정보, 운동 목표 등)
- 소셜 로그인 (카카오, 네이버, 구글)
- JWT 기반 인증

### 2. Workouts (운동 관리)
- **운동 종목 관리**: 다양한 운동 종목 데이터베이스
- **운동 루틴**: 개인 맞춤형 운동 루틴 생성 및 관리
- **운동 기록**: 일일 운동 로그 및 세트별 상세 기록
- **통계 분석**: 운동 진행 상황 추적 및 분석

### 3. Diet (식단 관리)
- **식품 데이터베이스**: 영양 정보가 포함된 식품 DB
- **식단 기록**: 일일 식사 기록 및 칼로리 추적
- **식단 추천**: PuLP를 활용한 최적화된 식단 추천
- **영양 분석**: 매크로 영양소 분석 및 시각화

### 4. Community (커뮤니티)
- **게시글 작성**: 운동/식단 팁, 경험 공유
- **댓글 시스템**: 게시글에 대한 피드백 및 토론
- **좋아요 기능**: 유용한 콘텐츠 추천
- **카테고리별 분류**: 운동, 식단, 일반 등 주제별 분류

### 5. Challenge (챌린지)
- **챌린지 생성**: 개인 또는 그룹 챌린지 생성
- **참여 관리**: 챌린지 참가 신청 및 진행 상황 추적
- **순위 시스템**: 참가자 간 랭킹 및 리더보드
- **보상 시스템**: 챌린지 완료 시 포인트 지급

### 6. E-commerce (이커머스)
- **상품 관리**: 피트니스 관련 제품 카탈로그
- **장바구니**: 상품 추가/삭제, 수량 조정
- **주문 처리**: 주문 생성 및 상태 관리
- **리뷰 시스템**: 상품 리뷰 및 평점
- **추천 시스템**: 사용자 맞춤형 상품 추천

### 7. Points (포인트 시스템)
- **포인트 적립**: 운동 기록, 챌린지 완료 등 활동별 포인트 지급
- **포인트 사용**: 이커머스 구매 시 할인 적용
- **거래 내역**: 포인트 적립/사용 내역 관리

### 8. Onboarding (온보딩)
- **초기 설정**: 신규 사용자 신체 정보 입력
- **목표 설정**: 운동 목표 및 선호도 설정
- **맞춤형 추천**: 사용자 정보 기반 초기 추천

### 9. Audit (감사 로그)
- **변경 이력**: 데이터 변경 사항 추적
- **사용자 활동**: 사용자 행동 로깅
- **보안 감사**: 시스템 접근 및 변경 모니터링

## 🔌 API 사용 예제

### 인증
```javascript
// 로그인
POST /api/auth/login/
{
  "email": "user@example.com",
  "password": "password123"
}

// 응답
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

### 운동 기록 생성
```javascript
// Headers
Authorization: Bearer <access_token>

// 요청
POST /api/workouts/logs/
{
  "routine": 1,
  "date": "2024-01-15",
  "notes": "오늘 컨디션 좋음"
}
```

### 식단 기록 조회
```javascript
// 특정 날짜의 식단 기록 조회
GET /api/diet/logs/?date=2024-01-15
```

### 상품 검색
```javascript
// 프로틴 관련 상품 검색
GET /api/ecommerce/products/?search=protein&min_price=10000&max_price=50000
```

## 🐛 일반적인 문제 해결

### npm 설치 문제
프론트엔드 npm 설치 시 문제가 발생하면:
```bash
cd fithub/frontend
npm cache clean --force
rmdir /s /q node_modules  # Windows
rm -rf node_modules       # macOS/Linux
del package-lock.json     # Windows
rm package-lock.json      # macOS/Linux
npm install
```

### CORS 에러
백엔드 `settings.py`에서 프론트엔드 URL이 `CORS_ALLOWED_ORIGINS`에 포함되어 있는지 확인:
```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:3001",
]
```

### 데이터베이스 마이그레이션 충돌
```bash
python manage.py migrate --fake-initial
```

## 👥 팀원 및 기여

- 홍태준
- 신용서
- 김규학
- 김유찬
- 박재정

## 📄 라이선스

이 프로젝트는 교육 목적으로 제작되었습니다.