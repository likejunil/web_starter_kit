# JWT 세션 관리

## 세션이란?

사용자가 "누구인지" 기억하기 위한 정보입니다.

### 전통적인 방식 (DB에 저장)

```
사용자 로그인
   ↓
서버가 세션 ID 생성 → DB에 저장
   ↓
브라우저 쿠키에 세션 ID만 저장
   ↓
다음 요청 시: 세션 ID 조회 → DB에서 사용자 정보 찾기
```

**단점**: 매 요청마다 DB 조회 필요 → 느림

### JWT 방식 (토큰 기반)

```
사용자 로그인
   ↓
서버가 JWT 토큰 생성 (사용자 정보 암호화)
   ↓
브라우저 쿠키에 JWT 저장
   ↓
다음 요청 시: JWT 검증만 함 (DB 조회 불필요)
```

**장점**: DB 조회 불필요 → 빠름

## JWT의 구조

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.
eyJ1c2VySWQiOiIxMjM0NTY3ODkwIiwiZXhwIjoxNjc4OTAxMjM0fQ.
TJVA95U7M7QBmZo9z
```

3개의 파트 (점으로 구분):

1. **Header** (헤더)
   - 암호화 알고리즘 정보: `{ "alg": "HS256", "typ": "JWT" }`

2. **Payload** (내용)
   - 실제 데이터: `{ "userId": "...", "exp": 1678901234 }`
   - 누구나 읽을 수 있음 (암호화 아님, 인코딩일 뿐)
   - **민감한 정보 금지** (비밀번호, 신용카드 번호 등)

3. **Signature** (서명)
   - 서버의 비밀 키로 서명한 해시값
   - 위변조 감지용

## jose 라이브러리

Prisma가 권장하는 JWT 라이브러리입니다.

```typescript
import { SignJWT, jwtVerify } from 'jose';

// 생성
const token = await new SignJWT({ userId: '123' })
  .setProtectedHeader({ alg: 'HS256' })
  .setExpirationTime('7d')
  .sign(key);

// 검증
const { payload } = await jwtVerify(token, key);
console.log(payload.userId); // '123'
```

## 이 프로젝트의 구현

### `lib/session.ts`

```typescript
// 생성
await createSession(userId);
// → JWT 생성 → httpOnly 쿠키에 저장

// 검증
const session = await decrypt(cookieValue);
// → JWT 해석 → 만료 시간 확인
```

### httpOnly 쿠키의 중요성

```typescript
cookieStore.set('session', token, {
  httpOnly: true, // ← JavaScript에서 접근 불가
  secure: true, // ← HTTPS에서만 전송
  sameSite: 'lax', // ← 다른 도메인의 요청에 쿠키 미전송
});
```

**httpOnly가 없으면**:

```javascript
// XSS 공격으로 토큰 탈취 가능
console.log(document.cookie); // "session=eyJ..."
```

**httpOnly가 있으면**:

```javascript
console.log(document.cookie); // 쿠키가 보이지 않음 (안전)
```

## 요약

| 방식           | 장점           | 단점         |
| -------------- | -------------- | ------------ |
| DB 세션        | 토큰 취소 가능 | DB 조회 느림 |
| JWT            | 빠름, 무상태   | 취소 어려움  |
| JWT + httpOnly | 빠르고 안전    | 가장 권장    |

이 프로젝트는 **JWT + httpOnly 쿠키** 방식을 사용합니다.
