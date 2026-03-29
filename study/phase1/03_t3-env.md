# Phase 1 Step 3: t3-env로 환경변수 타입세이프 관리

## 무엇을 했나

### 작업 내용
1. `@t3-oss/env-nextjs` 패키지 설치
2. `lib/env.ts` 파일 생성 (환경변수 스키마 정의)
3. `.env.example` 파일 생성 (참고용 환경변수 목록)
4. `.env.local` 파일 생성 (실제 개발 환경변수)
5. `next.config.ts` 수정 (환경변수 자동 검증 설정)

### 생성된 파일
```
lib/
└── env.ts                    # 환경변수 스키마 정의

.env.example                  # 환경변수 참고 문서
.env.local                    # 실제 개발 환경변수 (git 제외)
```

### 수정된 파일
- `next.config.ts` - env import 추가

---

## 환경변수란 무엇인가

### 정의
**환경변수 (Environment Variables)**는 애플리케이션이 실행되는 **환경**에 따라 달라지는 설정값입니다.

### 예시
```bash
# 개발 환경
DATABASE_URL=localhost:5432

# 프로덕션 환경
DATABASE_URL=aws-database.com:5432
```

같은 코드인데 실행되는 환경(개발/프로덕션)에 따라 값이 달라집니다.

### 환경변수가 필요한 이유

#### 1. 민감한 정보 보호
```javascript
// ❌ 절대 하면 안 됨 (깃헙에 올라가면 해킹당함)
const apiKey = "sk_live_abc123def456";
const dbPassword = "superSecretPassword123";

// ✅ 환경변수로 관리
const apiKey = process.env.STRIPE_SECRET_KEY;
const dbPassword = process.env.DATABASE_PASSWORD;
```

#### 2. 환경에 따른 다른 설정
```javascript
if (process.env.NODE_ENV === "production") {
  // 프로덕션 로직
} else {
  // 개발 로직
}
```

---

## t3-env란 무엇인가

### 정의
**t3-env**는 Next.js 프로젝트에서 환경변수를 **타입세이프하게 관리**하는 라이브러리입니다.

### 문제: 기본 Node.js로 환경변수를 사용하면?

```typescript
// ❌ 기본 방식: 런타임 에러 위험
const dbUrl = process.env.DATABASE_URL;
// dbUrl은 undefined일 수도 있음
// 코드 실행 중에 에러 발생 (개발 중에는 모름)

await db.connect(dbUrl); // TypeError: Cannot read property 'url' of undefined
```

**문제점:**
1. 환경변수가 없으면 `undefined` 반환 (타입 체크 안 됨)
2. TypeScript도 무시함
3. 런타임에 에러 발생 (너무 늦음)
4. 팀원이 어떤 환경변수가 필요한지 모름

### 해결책: t3-env

```typescript
// ✅ t3-env 방식: 앱 시작 시 검증
import { env } from "@/lib/env";

const dbUrl = env.DATABASE_URL;
// 1. 필수 환경변수가 없으면 → 앱 시작 실패 (빨리 발견!)
// 2. 형식이 잘못되면 → 앱 시작 실패 (Zod가 검증)
// 3. TypeScript 타입 자동 완성 (env.DATABASE_URL는 string이라고 알고 있음)
```

---

## lib/env.ts 파일 분석

### 구조

```typescript
export const env = createEnv({
  server: { /* 서버 전용 */ },
  client: { /* 클라이언트 공개 */ },
  runtimeEnv: { /* 실제 환경변수 매핑 */ },
});
```

### server 섹션 (서버 전용)

```typescript
server: {
  NODE_ENV: z.enum(["development", "test", "production"])
    .default("development"),
  // DATABASE_URL은 나중에 추가될 예정
}
```

**의미:**
- `NODE_ENV`: 앱이 실행 중인 환경
  - development = 개발 중
  - test = 테스트 중
  - production = 실 서버에서 실행
- `.enum()`: 이 3개 값 중 하나만 가능
- `.default()`: 지정하지 않으면 "development" 사용

**왜 "server"인가?**
- 서버에서만 사용되는 정보
- 클라이언트 번들에 포함되지 않음
- 보안 (DB 비밀번호, API 키 등을 안전하게)

### client 섹션 (클라이언트 공개)

```typescript
client: {
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
}
```

**의미:**
- `NEXT_PUBLIC_APP_URL`: 앱의 공개 URL (예: http://localhost:3000)
- `.url()`: URL 형식인지 검증
- `.optional()`: 선택 사항 (없어도 됨)

**왜 "NEXT_PUBLIC_"인가?**
- Next.js 규칙: 클라이언트가 접근하려면 `NEXT_PUBLIC_` 접두사 필수
- 클라이언트 번들에 포함되므로 민감한 정보는 절대 금지!
- 누구나 네트워크 탭에서 볼 수 있음

### runtimeEnv (실제 환경변수 매핑)

```typescript
runtimeEnv: {
  NODE_ENV: process.env.NODE_ENV,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
},
```

**의미:**
- 위의 스키마에 실제 값을 매핑
- `process.env.NODE_ENV`에서 값을 가져와 스키마로 검증
- 검증 실패 시 앱 시작 안 됨

---

## 환경변수 파일 설명

### .env.example
```
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**역할:**
- GitHub에 공개되는 파일
- 팀원들이 어떤 환경변수가 필요한지 알 수 있음
- 새 개발자가 `.env.local` 작성할 때 참고

### .env.local
```
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**역할:**
- 실제 개발 환경변수 값
- `.gitignore`에 등록되어 GitHub에 올라가지 않음
- 각 개발자 로컬 머신에만 있음
- 민감한 정보 보호

---

## t3-env 동작 흐름

```
npm run dev/build
    ↓
next.config.ts 로드
    ↓
import "./lib/env" 실행
    ↓
env 객체 생성 (Zod 검증)
    ↓
필수 환경변수 확인
    ↓
형식 검증 (URL인지, enum인지 등)
    ↓
✅ 모두 통과 → 앱 시작
❌ 실패 → 앱 시작 안 됨 (에러 메시지 표시)
```

---

## 자주 쓸 Zod 검증 메서드

```typescript
// 기본 타입
z.string()                     // 문자열
z.number()                     // 숫자
z.boolean()                    // boolean
z.enum(["a", "b"])           // 열거형

// 검증
.min(2)                       // 최소값
.max(100)                     // 최대값
.email()                      // 이메일 형식
.url()                        // URL 형식
.regex(/pattern/)             // 정규표현식

// 선택 사항
.optional()                   // 선택 (없어도 됨)
.nullable()                   // null 허용
.default("value")             // 기본값

// 예시
z.string().email().optional() // 이메일 형식, 선택 사항
z.number().min(18)            // 숫자, 최소 18
z.enum(["dev", "prod"])       // 두 값 중 하나만
```

---

## 다음 Phase에서 추가될 환경변수

### Phase 2: 데이터베이스
```typescript
server: {
  DATABASE_URL: z.string().url(),
}
```

### Phase 2: 인증 (Auth.js)
```typescript
server: {
  NEXTAUTH_SECRET: z.string(),
  NEXTAUTH_URL: z.string().url(),
}
```

### Phase 4: 외부 서비스
```typescript
server: {
  STRIPE_SECRET_KEY: z.string(),
  RESEND_API_KEY: z.string(),
  SENTRY_DSN: z.string().url(),
}
```

각 Phase에서 환경변수를 추가할 때는:
1. `lib/env.ts`의 server/client에 추가
2. `.env.example`에 문서화
3. `.env.local`에 실제 값 설정

---

## 핵심 정리

| 항목 | 내용 |
|------|------|
| **정의** | Next.js에서 환경변수를 타입세이프하게 관리 |
| **역할** | 앱 시작 시 필수 환경변수를 자동으로 검증 |
| **주요 파일** | `lib/env.ts` (스키마) |
| **검증 시점** | 빌드 시 또는 앱 시작 시 (런타임이 아님) |
| **에러 방식** | 필수 환경변수 누락 → 앱 시작 실패 (빨리 발견!) |

### 세 가지 파일의 역할

| 파일 | 공개 | 용도 |
|------|------|------|
| `.env.example` | ✅ Yes | 참고용 (팀원들에게 어떤 변수가 필요한지 알려줌) |
| `.env.local` | ❌ No | 실제 개발 환경변수 (git 제외, 민감한 정보) |
| `lib/env.ts` | ✅ Yes | 스키마 정의 (코드로 git 관리) |

---

## 다음 단계

**Phase 1 Step 4: Prettier + Husky + lint-staged**

코드 포맷팅과 Git 훅으로 자동화된 품질 관리를 설정합니다.

**지금까지의 진행:**
- ✅ Step 1: shadcn/ui 기본 UI 컴포넌트
- ✅ Step 2: Zod + React Hook Form 폼 검증
- ✅ Step 3: t3-env 환경변수 타입세이프 관리
- ⬜ Step 4: Prettier + Husky + lint-staged DX 자동화

Phase 1 완료 후 Phase 2 (인증 + DB)로 진행합니다!
