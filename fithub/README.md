# FitHub - 건강한 라이프스타일 플랫폼

운동 관리, 식단 관리, 커뮤니티, 이커머스 기능을 제공하는 통합 피트니스 플랫폼입니다.

## 프로젝트 구조

- `frontend/`: React + Vite 기반 프론트엔드
- `backend/`: Django REST Framework 기반 백엔드

## 개발 환경 설정

### 프론트엔드 설정

1. 가상환경 생성 및 활성화:

```bash
# Windows
python -m venv fithub_env
fithub_env\Scripts\activate

# macOS/Linux
python3 -m venv fithub_env
source fithub_env/bin/activate
```

2. Node.js 설치 (https://nodejs.org/en/download/)

3. 프론트엔드 패키지 설치:

```bash
cd fithub/frontend
npm install
```

4. 개발 서버 실행:

```bash
npm run dev
```

### 백엔드 설정

1. Django 및 필요 패키지 설치:

```bash
cd fithub/backend
pip install -r requirements.txt
```

2. 데이터베이스 마이그레이션:

```bash
python manage.py migrate
```

3. 개발 서버 실행:

```bash
python manage.py runserver
```

## 기능 소개

- **사용자 관리**: 회원가입, 로그인, 프로필 관리
- **운동 관리**: 운동 루틴 생성, 운동 로그 기록
- **식단 관리**: 식단 계획, 식단 로그 기록
- **커뮤니티**: 게시글, 댓글, 좋아요
- **이커머스**: 상품 목록, 장바구니, 주문

## 기술 스택

### 프론트엔드
- React
- Vite
- React Router
- Axios
- Tailwind CSS

### 백엔드
- Django
- Django REST Framework
- PostgreSQL (예정)

## ERD 구조

- 사용자(Users): User, UserProfile, SocialAccount
- 이커머스(Shop): Category, Product, Order
- 운동(Workouts): Exercise, WorkoutRoutine, WorkoutLog, RoutineExercise
- 식단(Diet): Food, MealPlan, DietLog
- 커뮤니티(Community): Post, Comment, Like 