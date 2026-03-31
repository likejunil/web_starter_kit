# proxy.ts: 라우트 보호 (Next.js 16 변경사항)

## 이전 버전 (Next.js 15 이전)

```typescript
// middleware.ts
export function middleware(req: NextRequest) {
  // ...
}
```

## 현재 버전 (Next.js 16)

```typescript
// proxy.ts
export default async function proxy(req: NextRequest) {
  // ...
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
};
```

## 변경 이유

### 파일 이름: `middleware.ts` → `proxy.ts`

- `proxy.ts`: "요청을 우회시키는 역할" 더 명확하게 표현
- 역할은 동일하지만, 이름으로 의도를 더 명확히 함

### 런타임: 선택 가능

**기존**: Edge Runtime만 지원
**변경 후**:

- `proxy.ts`: **Node.js Runtime** (더 강력한 기능 사용 가능)
- Edge Runtime 필요 시 → 기존 `middleware.ts` 여전히 사용 가능

## proxy.ts의 역할

### "낙관적 보호" (Optimistic Protection)

보호는 하되, 최대한 빨리 판단:

```typescript
// ✅ 빠름: JWT 검증만 (CPU 연산)
const session = await decrypt(cookie);
if (!session) return redirect('/login');

// ❌ 느림: DB 쿼리 (I/O 대기)
// → proxy.ts에서 하지 말 것!
```

### DB 접근 금지

```typescript
// ❌ 금지: proxy.ts에서 DB 쿼리
const user = await db.user.findUnique({...})

// ✅ 권장: lib/dal.ts에서만 DB 쿼리
```

## 이 프로젝트의 proxy.ts

```typescript
export default async function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname;

  // 1. 보호할 경로 확인
  const isProtectedRoute = protectedRoutes.some((route) => path.startsWith(route));

  // 2. JWT 검증 (DB 접근 X)
  const session = await decrypt(cookie);

  // 3. 미인증 시 /login 리다이렉트
  if (isProtectedRoute && !session?.userId) {
    return NextResponse.redirect(new URL('/login', req.nextUrl));
  }

  return NextResponse.next();
}
```

## proxy.ts vs lib/dal.ts 역할 분담

```
proxy.ts (라우트 수준)
├─ 목표: 성능 (빠른 응답)
├─ 방법: JWT 쿠키 검증만
├─ 보호 대상: "/dashboard" 경로 자체
└─ 실패 시: 로그인 페이지 리다이렉트

lib/dal.ts (데이터 수준)
├─ 목표: 보안 (실제 권한 검증)
├─ 방법: DB에서 사용자 정보 확인
├─ 보호 대상: 민감한 데이터 접근
└─ 실패 시: 데이터 반환 거부 또는 리다이렉트
```

## 보안 계층 (3단계)

```
요청
  ↓
1단계: proxy.ts (낙관적 체크)
  - JWT 쿠키 존재 확인
  - 없으면 /login 리다이렉트
  ↓
2단계: lib/dal.ts (실제 권한 확인)
  - DB에서 사용자 존재 확인
  - 비인증 시 다시 /login 리다이렉트
  ↓
3단계: Server Actions / API (데이터 무결성)
  - 사용자의 데이터만 조작 허용
  - 다른 사용자 데이터 접근 거부
```

## matcher 설정

```typescript
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
};
```

**의미**: "다음을 제외한 모든 경로"

- `api/` → 제외 (API 라우트는 따로 보호)
- `_next/static/` → 제외 (정적 파일)
- `_next/image/` → 제외 (이미지 최적화)
- `*.png` → 제외 (이미지 파일)

결과: `/login`, `/dashboard`, `/profile` 등만 proxy.ts 실행

## 요약

| 구분 | 이름          | 런타임  | 속도      | 역할           |
| ---- | ------------- | ------- | --------- | -------------- |
| 기존 | middleware.ts | Edge    | 빠름      | Edge 전용 기능 |
| 신규 | proxy.ts      | Node.js | 조금 느림 | 일반적인 보호  |

이 프로젝트는 **proxy.ts**를 사용합니다.
