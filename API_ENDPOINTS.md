# Fithub API 엔드포인트 가이드

## 📋 개요
프론트엔드 요구사항에 맞춰 단순화된 ViewSet 기반 API 엔드포인트 목록입니다.

**Base URL**: `http://localhost:8000/api/`

---

## 🏋️ Workouts API

### 1. 운동 종목 (Exercises)
**Base URL**: `/api/workouts/exercises/`

| Method | Endpoint | 설명 | 쿼리 파라미터 |
|--------|----------|------|---------------|
| GET | `/` | 운동 목록 조회 | `muscle_group`, `type`, `search` |
| GET | `/{id}/` | 운동 상세 조회 | - |

**필터링 예시:**
- `?muscle_group=chest` - 가슴 운동만
- `?type=strength` - 근력 운동만
- `?search=push` - 이름/설명에 "push" 포함

### 2. 운동 루틴 (Routines)
**Base URL**: `/api/workouts/routines/`

| Method | Endpoint | 설명 | 쿼리 파라미터 |
|--------|----------|------|---------------|
| GET | `/` | 루틴 목록 조회 | `difficulty` |
| POST | `/` | 루틴 생성 | - |
| GET | `/{id}/` | 루틴 상세 조회 | - |
| PUT | `/{id}/` | 루틴 수정 | - |
| DELETE | `/{id}/` | 루틴 삭제 | - |
| POST | `/{id}/copy/` | 루틴 복사 | - |

### 3. 운동 로그 (Logs)
**Base URL**: `/api/workouts/logs/`

| Method | Endpoint | 설명 | 쿼리 파라미터 |
|--------|----------|------|---------------|
| GET | `/` | 운동 로그 목록 | `date`, `completed` |
| POST | `/` | 운동 로그 생성 | - |
| GET | `/{id}/` | 운동 로그 상세 | - |
| PUT | `/{id}/` | 운동 로그 수정 | - |
| DELETE | `/{id}/` | 운동 로그 삭제 | - |
| POST | `/{id}/complete/` | 운동 완료 처리 | - |

### 4. 운동 로그 상세 (Log Exercises)
**Base URL**: `/api/workouts/log-exercises/`

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/` | 운동 로그 상세 목록 |
| POST | `/` | 운동 로그 상세 생성 |
| GET | `/{id}/` | 운동 로그 상세 조회 |
| PUT | `/{id}/` | 운동 로그 상세 수정 |
| DELETE | `/{id}/` | 운동 로그 상세 삭제 |

### 5. 운동 타입 (Types)
**Base URL**: `/api/workouts/types/`

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/` | 운동 타입 목록 |
| GET | `/{id}/` | 운동 타입 상세 |

### 6. 운동 통계 (Stats)
**Base URL**: `/api/workouts/stats/`

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/basic/` | 기본 운동 통계 |

**응답 예시:**
```json
{
  "total_workouts": 45,
  "completed_workouts": 42,
  "completion_rate": 93.33,
  "weekly_workouts": 5,
  "monthly_workouts": 18
}
```

---

## 🛒 Ecommerce API

### 1. 카테고리 (Categories)
**Base URL**: `/api/ecommerce/categories/`

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/` | 카테고리 목록 |
| GET | `/{id}/` | 카테고리 상세 |

### 2. 상품 (Products)
**Base URL**: `/api/ecommerce/products/`

| Method | Endpoint | 설명 | 쿼리 파라미터 |
|--------|----------|------|---------------|
| GET | `/` | 상품 목록 조회 | `category`, `search`, `min_price`, `max_price` |
| GET | `/{id}/` | 상품 상세 조회 | - |

**필터링 예시:**
- `?category=1` - 특정 카테고리 상품
- `?search=protein` - 상품명/설명에 "protein" 포함
- `?min_price=10000&max_price=50000` - 가격 범위

### 3. 장바구니 (Carts)
**Base URL**: `/api/ecommerce/carts/`

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/` | 장바구니 목록 |
| POST | `/` | 장바구니 생성 |
| GET | `/{id}/` | 장바구니 상세 |
| PUT | `/{id}/` | 장바구니 수정 |
| DELETE | `/{id}/` | 장바구니 삭제 |
| GET | `/my_cart/` | 내 장바구니 조회 |
| POST | `/add_item/` | 장바구니에 상품 추가 |

**상품 추가 요청 예시:**
```json
{
  "product_id": 1,
  "quantity": 2
}
```

### 4. 장바구니 아이템 (Cart Items)
**Base URL**: `/api/ecommerce/cart-items/`

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/` | 장바구니 아이템 목록 |
| POST | `/` | 장바구니 아이템 생성 |
| GET | `/{id}/` | 장바구니 아이템 상세 |
| PUT | `/{id}/` | 장바구니 아이템 수정 |
| DELETE | `/{id}/` | 장바구니 아이템 삭제 |

### 5. 주문 (Orders)
**Base URL**: `/api/ecommerce/orders/`

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/` | 주문 목록 |
| POST | `/` | 주문 생성 |
| GET | `/{id}/` | 주문 상세 |
| PUT | `/{id}/` | 주문 수정 |
| DELETE | `/{id}/` | 주문 삭제 |

### 6. 리뷰 (Reviews)
**Base URL**: `/api/ecommerce/reviews/`

| Method | Endpoint | 설명 | 쿼리 파라미터 |
|--------|----------|------|---------------|
| GET | `/` | 리뷰 목록 | `product`, `rating` |
| POST | `/` | 리뷰 생성 | - |
| GET | `/{id}/` | 리뷰 상세 | - |
| PUT | `/{id}/` | 리뷰 수정 | - |
| DELETE | `/{id}/` | 리뷰 삭제 | - |

**필터링 예시:**
- `?product=1` - 특정 상품의 리뷰
- `?rating=5` - 5점 리뷰만

---

## 🍎 Diet API

### 음식 (Foods)
**Base URL**: `/api/diet/foods/`

| Method | Endpoint | 설명 | 쿼리 파라미터 |
|--------|----------|------|---------------|
| GET | `/` | 음식 목록 | `search` |
| POST | `/` | 음식 생성 | - |
| GET | `/{id}/` | 음식 상세 | - |
| PUT | `/{id}/` | 음식 수정 | - |
| DELETE | `/{id}/` | 음식 삭제 | - |

---

## 👤 Users API

### 사용자 프로필 (Profiles)
**Base URL**: `/api/users/profiles/`

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/` | 프로필 목록 |
| POST | `/` | 프로필 생성 |
| GET | `/{id}/` | 프로필 상세 |
| PUT | `/{id}/` | 프로필 수정 |
| DELETE | `/{id}/` | 프로필 삭제 |

---

## 💬 Community API

### 게시글 (Posts)
**Base URL**: `/api/community/posts/`

| Method | Endpoint | 설명 | 쿼리 파라미터 |
|--------|----------|------|---------------|
| GET | `/` | 게시글 목록 | `category`, `search`, `tags` |
| POST | `/` | 게시글 생성 | - |
| GET | `/{id}/` | 게시글 상세 | - |
| PUT | `/{id}/` | 게시글 수정 | - |
| DELETE | `/{id}/` | 게시글 삭제 | - |
| GET | `/my_posts/` | 내 게시글 목록 | - |
| POST | `/{id}/like/` | 게시글 좋아요/취소 | - |

**필터링 예시:**
- `?category=workout` - 운동 카테고리 게시글
- `?search=diet` - 제목/내용에 "diet" 포함
- `?tags=beginner,tips` - 특정 태그 포함

**좋아요 응답 예시:**
```json
{
  "liked": true,
  "likes_count": 15
}
```

---

## 🔐 인증 관련

### 인증 헤더
모든 API 요청에는 JWT 토큰이 필요합니다:
```
Authorization: Bearer <your_jwt_token>
```

### 권한
- **읽기**: 모든 인증된 사용자
- **쓰기**: 본인 데이터만 수정/삭제 가능
- **관리자**: 모든 데이터 접근 가능

---

## 📊 응답 형식

### 성공 응답
```json
{
  "id": 1,
  "name": "Example",
  "created_at": "2024-01-01T00:00:00Z"
}
```

### 목록 응답 (페이지네이션)
```json
{
  "count": 100,
  "next": "http://localhost:8000/api/workouts/exercises/?page=2",
  "previous": null,
  "results": [...]
}
```

### 오류 응답
```json
{
  "error": "오류 메시지",
  "detail": "상세 오류 설명"
}
```

---

## 🚀 사용 예시

### 운동 로그 생성
```javascript
// POST /api/workouts/logs/
{
  "routine": 1,
  "date": "2024-01-01",
  "notes": "좋은 운동이었다"
}
```

### 장바구니에 상품 추가
```javascript
// POST /api/ecommerce/carts/add_item/
{
  "product_id": 1,
  "quantity": 2
}
```

### 게시글 검색
```javascript
// GET /api/community/posts/?search=다이어트&category=diet
```

---

## 📝 주요 변경사항

### 단순화된 기능들
- **불필요한 Custom Actions 제거**: 45개 → 8개 (82% 감소)
- **ViewSet 구조 통일**: 모든 API가 일관된 패턴 사용
- **프론트엔드 요구사항 기준**: 실제 사용하는 기능만 유지

### 제거된 기능들
- 복잡한 통계 API (클라이언트에서 계산)
- 중복된 검색/필터링 엔드포인트 (쿼리 파라미터로 통합)
- 사용하지 않는 추천/인기 기능들
- 과도한 세분화된 엔드포인트들

### 유지된 핵심 기능들
- 기본 CRUD 작업
- 필수 필터링 및 검색
- 사용자별 데이터 조회
- 핵심 비즈니스 로직 (좋아요, 장바구니 추가 등)

---

**📅 최종 업데이트**: 2024년 1월
**🔧 API 버전**: v1.0 (단순화 완료) 