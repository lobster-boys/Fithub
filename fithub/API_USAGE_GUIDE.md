# 🔐 **FitHub API 사용 가이드 (JWT 토큰 기반)**

## 📋 **개요**

FitHub API는 JWT 토큰 기반 인증 시스템을 사용하며, 세분화된 권한 정책을 통해 안전하고 효율적인 API 접근을 제공합니다.

## 🚀 **빠른 시작**

### 1. 기본 설정
```javascript
// axiosConfig.js에서 이미 설정됨
const API_BASE_URL = 'http://localhost:8000/api';
```

### 2. 인증 플로우
```javascript
// 1. 회원가입
const registerResponse = await axios.post('/dj-rest-auth/registration/', {
  username: 'username',
  email: 'email@example.com',
  password1: 'password123',
  password2: 'password123'
});

// 2. 로그인 (회원가입 후 자동 로그인됨)
const loginResponse = await axios.post('/dj-rest-auth/login/', {
  username: 'username',
  password: 'password123'
});

// 3. 토큰은 localStorage에 자동 저장됨
const accessToken = loginResponse.data.access;
```

## 🔑 **권한 정책 가이드**

### 1. **PublicReadOnly** 🌍
**누구나 읽기 가능, 관리자만 쓰기**
- 운동 종목 (`/workouts/exercises/`)
- 상품 카테고리 (`/ecommerce/categories/`)
- 상품 목록 (`/ecommerce/products/`)
- 음식 데이터 (`/diet/foods/`)

```javascript
// 인증 없이 접근 가능
const exercises = await axios.get('/workouts/exercises/');
const categories = await axios.get('/ecommerce/categories/');
```

### 2. **PublicReadCreateOwnerWrite** 📝
**읽기는 누구나, 생성은 인증 필요, 수정/삭제는 작성자만**
- 커뮤니티 게시글 (`/community/posts/`)
- 상품 리뷰 (`/ecommerce/reviews/`)

```javascript
// 읽기 - 인증 불필요
const posts = await axios.get('/community/posts/');

// 작성 - 인증 필요
const newPost = await axios.post('/community/posts/', postData);

// 수정 - 작성자만 가능
const updatedPost = await axios.put(`/community/posts/${postId}/`, updateData);
```

### 3. **IsOwnerOnly** 🔒
**소유자만 모든 권한**
- 장바구니 (`/ecommerce/carts/`)
- 주문 (`/ecommerce/orders/`)
- 운동 로그 (`/workouts/logs/`)
- 운동 루틴 (`/workouts/routines/`)

```javascript
// 인증 필수 - 자신의 데이터만 접근
const myCarts = await axios.get('/ecommerce/carts/');
const myLogs = await axios.get('/workouts/logs/');
```

### 4. **IsOwnerOrReadOnly** 👤
**소유자는 모든 권한, 나머지는 읽기만**
- 사용자 프로필 (`/users/profiles/`)

```javascript
// 프로필 조회 - 인증된 사용자 누구나
const profiles = await axios.get('/users/profiles/');

// 프로필 수정 - 소유자만
const updatedProfile = await axios.put(`/users/profiles/${profileId}/`, profileData);
```

### 5. **IsAuthenticated** 🔐
**인증된 사용자만**
- 온보딩 (`/onboarding/`)
- 운동 통계 (`/workouts/stats/`)

```javascript
// 인증 필수
const onboardingData = await axios.get('/onboarding/');
const workoutStats = await axios.get('/workouts/stats/basic/');
```

## 📍 **주요 API 엔드포인트**

### 🔐 **인증 관련**
```javascript
// 회원가입
POST /api/dj-rest-auth/registration/
{
  "username": "username",
  "email": "email@example.com",
  "password1": "password123",
  "password2": "password123"
}

// 로그인
POST /api/dj-rest-auth/login/
{
  "username": "username",
  "password": "password123"
}

// 로그아웃
POST /api/dj-rest-auth/logout/

// 현재 사용자 정보
GET /api/dj-rest-auth/user/

// 토큰 갱신 (자동 처리됨)
POST /api/dj-rest-auth/token/refresh/
```

### 🏋️ **운동 관련**
```javascript
// 운동 종목 목록 (공개)
GET /api/workouts/exercises/
GET /api/workouts/exercises/?muscle_group=chest&search=push

// 내 루틴 목록 (소유자만)
GET /api/workouts/routines/
POST /api/workouts/routines/

// 내 운동 로그 (소유자만)
GET /api/workouts/logs/
POST /api/workouts/logs/

// 운동 통계 (인증 필요)
GET /api/workouts/stats/basic/
```

### 🛒 **이커머스 관련**
```javascript
// 카테고리 목록 (공개)
GET /api/ecommerce/categories/

// 상품 목록 (공개)
GET /api/ecommerce/products/
GET /api/ecommerce/products/?category=1&search=protein

// 내 장바구니 (소유자만)
GET /api/ecommerce/carts/
POST /api/ecommerce/carts/

// 내 주문 (소유자만)
GET /api/ecommerce/orders/
POST /api/ecommerce/orders/

// 리뷰 (읽기 공개, 작성 인증 필요)
GET /api/ecommerce/reviews/?product=1
POST /api/ecommerce/reviews/
```

### 💬 **커뮤니티 관련**
```javascript
// 게시글 목록 (공개)
GET /api/community/posts/
GET /api/community/posts/?category=workout&search=routine

// 게시글 작성 (인증 필요)
POST /api/community/posts/

// 게시글 수정/삭제 (작성자만)
PUT /api/community/posts/{id}/
DELETE /api/community/posts/{id}/

// 좋아요 (인증 필요)
POST /api/community/posts/{id}/like/

// 댓글 (공개 읽기, 인증 필요 작성)
GET /api/community/posts/{post_id}/comments/
POST /api/community/posts/{post_id}/comments/
```

### 👤 **사용자 관련**
```javascript
// 프로필 목록 (인증 필요)
GET /api/users/profiles/

// 프로필 생성 (인증 필요)
POST /api/users/profiles/

// 프로필 수정 (소유자만)
PUT /api/users/profiles/{id}/
```

### 🍎 **식단 관련**
```javascript
// 음식 목록 (공개)
GET /api/diet/foods/
GET /api/diet/foods/?search=chicken

// 식단 계획 (인증 필요)
GET /api/diet/mealplan/
POST /api/diet/mealplan/
```

## 🛠️ **에러 처리**

### HTTP 상태 코드
- `200`: 성공
- `201`: 생성 성공
- `400`: 잘못된 요청
- `401`: 인증 필요 (토큰 없음/만료)
- `403`: 권한 없음
- `404`: 리소스 없음
- `500`: 서버 오류

### 자동 토큰 갱신
```javascript
// axiosConfig.js에서 자동 처리됨
// 401 에러 시 refresh token으로 자동 갱신 시도
// 갱신 실패 시 로그인 페이지로 리다이렉트
```

## 🔧 **개발 팁**

### 1. **필터링 & 검색**
```javascript
// 대부분의 목록 API에서 지원
const exercises = await axios.get('/workouts/exercises/?muscle_group=chest&search=push');
const products = await axios.get('/ecommerce/products/?category=1&search=protein');
const posts = await axios.get('/community/posts/?category=workout&tags=beginner');
```

### 2. **페이지네이션**
```javascript
// 기본 20개씩 페이지네이션
const page1 = await axios.get('/workouts/exercises/?page=1');
const page2 = await axios.get('/workouts/exercises/?page=2&page_size=10');
```

### 3. **권한 확인**
```javascript
// 현재 사용자가 소유자인지 확인
const isOwner = currentUser.id === item.user || currentUser.id === item.creator;

// 인증 상태 확인
const isAuthenticated = !!localStorage.getItem('access_token');
```

### 4. **API 응답 형태**
```javascript
// 목록 API 응답
{
  "count": 150,
  "next": "http://localhost:8000/api/workouts/exercises/?page=2",
  "previous": null,
  "results": [...]
}

// 단일 객체 API 응답
{
  "id": 1,
  "name": "Push-up",
  "description": "Basic push-up exercise",
  ...
}
```

## 🚨 **주의사항**

### 1. **보안**
- JWT 토큰은 localStorage에 저장됨
- 토큰은 1시간 후 자동 만료
- refresh token은 7일 후 만료
- HTTPS 사용 권장 (프로덕션)

### 2. **API 호출 제한**
- 현재 제한 없음 (개발 환경)
- 프로덕션에서는 rate limiting 적용 예정

### 3. **CORS 설정**
- 현재 localhost:3000, localhost:3001만 허용
- 프로덕션 도메인 추가 시 설정 수정 필요

## 📞 **문제 해결**

### 토큰 관련 문제
```javascript
// 토큰 수동 확인
const token = localStorage.getItem('access_token');
if (!token) {
  // 로그인 페이지로 리다이렉트
  window.location.href = '/login';
}

// 토큰 수동 삭제
localStorage.removeItem('access_token');
localStorage.removeItem('refresh_token');
```

### API 응답 확인
```javascript
// 개발자 도구에서 네트워크 탭 확인
// console.log로 응답 데이터 확인
axios.get('/api/workouts/exercises/')
  .then(response => console.log(response.data))
  .catch(error => console.error(error.response));
```

---

## ✅ **테스트 결과 요약**

2024년 기준 테스트 완료 사항:
- ✅ 공개 API 접근 (운동 종목, 카테고리) - 200 OK
- ✅ 권한 없는 접근 차단 - 401 Unauthorized
- ✅ JWT 회원가입 - 201 Created, 토큰 발급
- ✅ 인증 필요 API 접근 - 200 OK, 사용자 정보 조회
- ✅ 자동 토큰 갱신 (axiosConfig.js)

**모든 핵심 기능이 정상 작동합니다!** 🎉 