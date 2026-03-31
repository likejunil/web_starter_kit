# DAL (Data Access Layer) 패턴

## DAL이란?

데이터베이스 접근 로직을 한 곳에 모아서 관리하는 패턴입니다.

```
일반적인 접근 (DAL 없음):
Server Component/Action → DB 쿼리 (각 곳에서 직접)

DAL을 사용한 접근:
Server Component/Action → DAL → DB 쿼리 (한 곳에서 관리)
```

## DAL의 목적

### 1. 중앙화 (Centralization)

모든 DB 접근을 `lib/dal.ts`에서 관리하므로:

- 수정이 한 곳에서만 필요
- 일관성 유지

### 2. 보안 (Security)

민감한 필드를 필터링:

```typescript
// DAL에서 password 필드를 제외하고 반환
return db.user.findUnique({
  where: { id },
  select: {
    id: true,
    email: true,
    // password는 포함하지 않음
  },
});
```

### 3. 캐싱 (Caching)

React `cache()` 래핑으로 중복 쿼리 방지:

```typescript
export const getUser = cache(async () => {
  // 같은 요청 내에서 여러 번 호출되어도 DB에 한 번만 쿼리
  return db.user.findUnique(...)
})
```

## 이 프로젝트의 DAL

```typescript
// lib/dal.ts

export const verifySession = cache(async () => {
  // 쿠키 → JWT 복호화 → 미인증 시 리다이렉트
});

export const getUser = cache(async () => {
  // verifySession() 호출
  // DB에서 사용자 정보 조회 (password 제외)
});
```

### 사용 예

```typescript
// app/dashboard/page.tsx (Server Component)

export default async function Dashboard() {
  const user = await getUser()
  // 미인증이면 자동으로 /login 리다이렉트
  // 인증되었으면 password 없는 사용자 객체 반환

  return <p>{user?.name}</p>
}
```

## Layout에서 DAL을 호출하면 안 되는 이유

### Next.js 16의 Partial Rendering

페이지 전환 시:

1. Layout은 **재실행되지 않음** (유지)
2. Page와 하위 컴포넌트만 재실행

```
A 페이지 (인증됨)
  ↓
Layout ─┐
Page ───┘

B 페이지 (공개)로 이동
  ↓
Layout ─┐ ← 재실행 안 됨! (이전 상태 유지)
Page* ──┘ ← 재실행됨
```

### 보안 허점 발생

```typescript
// ❌ 위험: Layout에서 auth 체크
export default async function RootLayout() {
  const user = await getUser(); // A 페이지 방문 시만 실행
  // B 페이지로 이동 → Layout 미실행 → 인증 체크 스킵!
}

// ✅ 안전: Page에서 auth 체크
export default async function Page() {
  const user = await getUser(); // 페이지마다 호출
}
```

## 올바른 아키텍처

```
[브라우저 요청]
   ↓
proxy.ts (낙관적 체크, JWT 쿠키만 검증)
   ↓
Page Component ← DAL (getUser()) 호출
   ↓
lib/dal.ts (verifySession, 비인증 시 리다이렉트)
   ↓
데이터베이스
```

## 요약

| 구분           | 역할                                    |
| -------------- | --------------------------------------- |
| proxy.ts       | 1차 보안 (성능 목표)                    |
| lib/dal.ts     | 2차 보안 (실제 권한 검증)               |
| Page Component | getUser() 호출 (DAL 의존)               |
| Layout         | auth 체크 금지 (Partial Rendering 때문) |

**기억**: 모든 보호된 페이지는 `getUser()` 또는 `verifySession()`을 호출해야 합니다.
