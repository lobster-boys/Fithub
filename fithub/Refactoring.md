# 🔧 FitHub 프로젝트 리팩토링 가이드

## 📋 프로젝트 현황 분석

### 🏗️ 현재 아키텍처
**백엔드 (Django + DRF)**
- 메인 설정: `config/` 앱
- API 통합 관리: `api/` 앱  
- 도메인 앱들: `users/`, `workouts/`, `diet/`, `ecommerce/`, `community/`, `challenge/`, `onboarding/`, `audit/`
- 추가 기능: `challenge_checker/`, `accounts/`

**프론트엔드 (React + Vite)**
- 컴포넌트 기반 구조, Context API 상태 관리
- Tailwind CSS 스타일링, JWT 인증 시스템

### 🚨 식별된 주요 문제점

#### 백엔드 문제점
1. **중복 모델 문제**
   - Challenge 모델: `challenge/models.py` ↔ `challenge_checker/models.py`
   - PointTransaction 모델: `challenge_checker/models.py` ↔ `ecommerce/models.py`  
   - Profile 모델: `accounts/models.py` ↔ `users/models.py`
   - ChallengeParticipant 모델 중복

2. **API 구조 일관성 부족**
   - ViewSet과 APIView 혼재 사용
   - URL 구조 불일치 (router 기반 vs 직접 path)
   - 베이스 클래스 상속 불일치

3. **앱 의존성 복잡성**
   - `api` 앱이 모든 도메인 앱에 의존
   - Cross-app imports로 인한 높은 결합도

4. **보안 설정 문제**
   - SECRET_KEY 하드코딩
   - DEBUG=True 기본 설정

#### 프론트엔드 문제점
1. **API 호출 로직 중복**
2. **에러 처리 일관성 부족**
3. **타입 안전성 부족** (TypeScript 미사용)
4. **상태 관리 복잡성**

---

## 🎯 리팩토링 옵션별 가이드

### 📌 옵션 1: 통합 및 단순화 접근법 (낮은 위험도)
**예상 작업 기간**: 2-3주  
**위험도**: 낮음  
**장점**: 즉시 적용 가능, 기존 기능 유지  
**단점**: 근본적 해결 불완전

### 📌 옵션 2: 완전 리팩토링 접근법 (높은 위험도) ⭐ 권장
**예상 작업 기간**: 6-8주  
**위험도**: 높음  
**장점**: 완전한 구조 개선, 장기적 유지보수성 향상  
**단점**: 대규모 변경, 높은 리스크

### 📌 옵션 3: 점진적 개선 접근법 (중간 위험도)
**예상 작업 기간**: 4-6주  
**위험도**: 중간  
**장점**: 안정적 진행, 단계별 검증  
**단점**: 완전한 해결까지 시간 소요

---

## 🤖 에이전트 작업 규칙 및 지침

### 🔒 필수 준수 사항
1. **단일 작업 원칙**: 각 에이전트는 한 번에 하나의 작업 단계만 수행
2. **작업 완료 보고**: 작업 완료 후 반드시 결과 문서화
3. **기능 검증**: 변경 후 관련 기능 동작 확인 필수
4. **백업 생성**: 주요 변경 전 git commit 또는 branch 생성
5. **의존성 체크**: 변경이 다른 모듈에 미치는 영향 사전 분석

### 📝 작업 완료 보고 형식
```markdown
## 작업 완료 보고

**작업 단계**: [단계명]
**작업 내용**: [수행한 작업 상세]
**변경된 파일**: 
- 파일1 (변경 사유)
- 파일2 (변경 사유)

**검증 결과**: 
- [ ] 기능 동작 확인
- [ ] 테스트 통과
- [ ] 의존성 문제 없음

**다음 단계**: [다음에 수행할 작업]
**주의사항**: [후속 작업 시 고려사항]
```

---

# 🎯 옵션별 상세 작업 계획

## 📋 옵션 1: 통합 및 단순화 접근법

### Phase 1: 보안 및 설정 개선 (1주)
#### Step 1.1: 환경 설정 보안화
**담당**: Backend Configuration Agent
- [ ] `python-decouple` 설치 및 `.env` 파일 생성
- [ ] SECRET_KEY 환경변수화
- [ ] DEBUG 모드 환경별 분리
- [ ] 데이터베이스 설정 환경변수화
- [ ] `.env.example` 파일 생성

**파일 변경 예상**: `config/settings.py`, `.env`, `.env.example`, `requirements.txt`

#### Step 1.2: CORS 및 보안 헤더 강화
**담당**: Security Configuration Agent
- [ ] CORS 설정 정리
- [ ] 보안 헤더 추가
- [ ] ALLOWED_HOSTS 적절한 설정

### Phase 2: 중복 모델 통합 (1주)
#### Step 2.1: Challenge 모델 통합
**담당**: Challenge Model Integration Agent
- [ ] `challenge/models.py`의 Challenge 모델을 메인으로 결정
- [ ] `challenge_checker/models.py`의 Challenge 모델 제거
- [ ] 관련 migration 생성 및 데이터 이전
- [ ] 관련 serializer 및 view 업데이트

#### Step 2.2: PointTransaction 모델 통합  
**담당**: Point System Integration Agent
- [ ] 두 PointTransaction 모델 분석 및 통합 모델 설계
- [ ] `challenge/models.py`로 통합 모델 이동
- [ ] 기존 데이터 migration 스크립트 작성
- [ ] 관련 API 엔드포인트 업데이트

#### Step 2.3: Profile 모델 통합
**담당**: User Profile Integration Agent
- [ ] `accounts/models.py`의 Profile 제거
- [ ] `users/models.py`의 UserProfile을 메인으로 사용
- [ ] 데이터 migration 및 관련 코드 업데이트

### Phase 3: API 구조 일관성 개선 (1주)
#### Step 3.1: BaseViewSet 상속 통일
**담당**: API Consistency Agent
- [ ] 모든 API View를 BaseViewSet 상속으로 변경
- [ ] 공통 기능을 BaseViewSet에 추가
- [ ] 중복 코드 제거 및 일관성 확보

#### Step 3.2: URL 구조 정리
**담당**: URL Structure Agent  
- [ ] 모든 URL을 router 기반으로 통일
- [ ] API 엔드포인트 네이밍 일관성 확보
- [ ] API 문서 업데이트

---

## 📋 옵션 2: 완전 리팩토링 접근법 ⭐

### Phase 1: 아키텍처 재설계 (2주)
#### Step 1.1: 도메인 분석 및 재구성 계획 수립
**담당**: Architecture Planning Agent
- [ ] 도메인 경계 명확히 정의
- [ ] 각 도메인별 책임과 인터페이스 설계
- [ ] 데이터베이스 스키마 재설계
- [ ] API 구조 재설계

#### Step 1.2: Core 앱 생성 및 공통 기능 분리
**담당**: Core Infrastructure Agent
- [ ] `core/` 앱 생성
- [ ] 공통 모델 (BaseModel, TimestampMixin 등) 이동
- [ ] 공통 유틸리티 함수 분리
- [ ] 공통 permissions, serializers 분리

#### Step 1.3: 새로운 앱 구조 생성
**담당**: Domain Structure Agent
- [ ] 각 도메인별 독립적인 앱 구조 생성
- [ ] 도메인 간 인터페이스 정의
- [ ] 의존성 역전 패턴 적용

### Phase 2: 데이터베이스 재설계 (2주)  
#### Step 2.1: 새로운 모델 설계 및 구현
**담당**: Database Design Agent
- [ ] 정규화된 새 모델 설계
- [ ] 중복 제거 및 관계 재정의
- [ ] 새 모델 클래스 구현

#### Step 2.2: 데이터 마이그레이션 전략 수립
**담당**: Data Migration Agent
- [ ] 기존 데이터 분석 및 마이그레이션 계획
- [ ] 데이터 변환 스크립트 작성
- [ ] 백업 및 복구 전략 수립

#### Step 2.3: 마이그레이션 실행 및 검증
**담당**: Migration Execution Agent
- [ ] 테스트 환경에서 마이그레이션 실행
- [ ] 데이터 무결성 검증
- [ ] 성능 테스트 및 최적화

### Phase 3: API 계층 재구축 (2주)
#### Step 3.1: 새로운 API 아키텍처 구현
**담당**: API Architecture Agent
- [ ] 도메인별 독립적인 API 구현
- [ ] 일관된 API 응답 형식 정의
- [ ] 에러 처리 표준화

#### Step 3.2: 인증 및 권한 시스템 개선
**담당**: Auth System Agent
- [ ] JWT 토큰 관리 개선
- [ ] 권한 시스템 재설계
- [ ] 소셜 로그인 통합 개선

### Phase 4: 프론트엔드 개선 (2주)
#### Step 4.1: TypeScript 마이그레이션
**담당**: Frontend TypeScript Agent
- [ ] 프로젝트 TypeScript 설정
- [ ] 주요 컴포넌트 타입 정의
- [ ] API 통신 타입 안전성 확보

#### Step 4.2: 상태 관리 개선
**담당**: Frontend State Agent
- [ ] 전역 상태 관리 개선 (Zustand 또는 Redux Toolkit)
- [ ] API 캐싱 전략 구현
- [ ] 에러 상태 관리 표준화

---

## 📋 옵션 3: 점진적 개선 접근법

### Phase 1: 긴급 이슈 해결 (1주)
#### Step 1.1: 보안 설정 즉시 개선
**담당**: Security Quick Fix Agent
- [ ] SECRET_KEY 환경변수화
- [ ] DEBUG 모드 분리
- [ ] 기본 보안 헤더 설정

### Phase 2: 중복 모델 단계별 해결 (2주)
#### Step 2.1: 가장 심각한 중복부터 해결
**담당**: Priority Model Fix Agent
- [ ] PointTransaction 모델 통합 (가장 많이 사용됨)
- [ ] Challenge 모델 통합
- [ ] Profile 모델 정리

### Phase 3: API 일관성 단계별 개선 (2주)
#### Step 3.1: 핵심 API부터 표준화
**담당**: Core API Standardization Agent
- [ ] 사용자 인증 API 표준화
- [ ] 주요 CRUD API ViewSet으로 통일
- [ ] 에러 처리 표준화

### Phase 4: 프론트엔드 점진적 개선 (1주)
#### Step 4.1: API 호출 로직 통합
**담당**: Frontend API Integration Agent
- [ ] 공통 API 클라이언트 클래스 생성
- [ ] 중복 API 호출 로직 통합
- [ ] 에러 처리 일관성 확보

---

## 🔍 품질 검증 체크리스트

### 백엔드 검증 항목
- [ ] 모든 API 엔드포인트 정상 동작
- [ ] 데이터베이스 마이그레이션 오류 없음  
- [ ] 테스트 코드 통과
- [ ] 성능 저하 없음
- [ ] 보안 취약점 없음

### 프론트엔드 검증 항목
- [ ] 모든 페이지 정상 렌더링
- [ ] API 통신 정상 동작
- [ ] 사용자 인증 플로우 정상
- [ ] 반응형 디자인 유지
- [ ] 성능 지표 유지

---

## 🚨 주의사항 및 위험 요소

### 높은 위험 작업
1. **데이터베이스 마이그레이션**: 데이터 손실 위험
2. **인증 시스템 변경**: 사용자 로그인 실패 위험  
3. **API 구조 변경**: 프론트엔드 호환성 문제

### 안전 조치
1. **백업 필수**: 각 단계 전 데이터베이스 및 코드 백업
2. **테스트 환경 검증**: 프로덕션 적용 전 테스트 환경에서 완전 검증
3. **점진적 배포**: 기능별 단계적 배포 및 모니터링
4. **롤백 계획**: 문제 발생 시 즉시 롤백 가능한 계획 수립

---

## 📊 작업 우선순위 매트릭스

| 작업 | 긴급도 | 중요도 | 난이도 | 우선순위 |
|------|---------|---------|---------|----------|
| 보안 설정 개선 | 높음 | 높음 | 낮음 | 1 |
| PointTransaction 통합 | 높음 | 높음 | 중간 | 2 |
| Challenge 모델 통합 | 중간 | 높음 | 중간 | 3 |
| API 구조 표준화 | 중간 | 높음 | 높음 | 4 |
| 프론트엔드 TypeScript | 낮음 | 중간 | 높음 | 5 |

---

## 🎯 최종 권장사항

**권장 옵션**: **옵션 2 (완전 리팩토링 접근법)**

**사유**:
1. 현재 시스템의 구조적 문제가 심각한 수준
2. 장기적 유지보수성과 확장성 확보 필요
3. 팀의 개발 역량 향상 기회
4. 기술 부채 완전 해결 가능

**시작 전 준비사항**:
1. 전체 팀 동의와 일정 확보
2. 테스트 환경 구축
3. 백업 시스템 확립
4. 단계별 검증 계획 수립

---

*본 문서는 FitHub 프로젝트 리팩토링의 마스터 가이드입니다. 각 에이전트는 담당 작업 수행 전 반드시 본 문서를 숙지하고 지침을 준수해야 합니다.* 