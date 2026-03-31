# Server Actions를 사용한 인증

## Server Actions란?

브라우저 폼을 서버에서 직접 처리하는 Next.js 기능입니다.

### 과거 (API Route)

```typescript
// app/api/auth/signup/route.ts
export async function POST(req: Request) {
  const data = await req.json()
  // ... 검증, DB 저장
  return Response.json(...)
}
```

```typescript
// Client Component
async function handleSubmit(formData) {
  const response = await fetch('/api/auth/signup', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
```

### 현재 (Server Actions)

```typescript
// app/actions/auth.ts
'use server';
export async function signup(formData: FormData) {
  // ... 검증, DB 저장
  redirect('/dashboard');
}
```

```typescript
// Client Component
'use client'
function SignupForm() {
  const [state, action] = useActionState(signup)
  return <form action={action}>...</form>
}
```

## 장점

1. **간단함**: API 엔드포인트 작성 불필요
2. **타입 안전**: 클라이언트-서버 간 타입 일치 자동 확인
3. **폼 데이터**: FormData 직접 처리 (JSON 변환 불필요)
4. **자동 에러 처리**: 서버 에러 클라이언트에 자동 전달

## 이 프로젝트의 구조

```
app/actions/auth.ts (Server)
├─ signup()
├─ login()
└─ logout()

app/(auth)/signup/_components/signup-form.tsx (Client)
└─ useActionState(signup)
   ├─ state: 서버에서 반환한 { errors, message }
   ├─ action: signup 함수
   └─ pending: 제출 중 여부
```

## useActionState 훅

```typescript
const [state, action, pending] = useActionState(signup, initialState);
```

### 반환값

1. **state**: 서버에서 반환한 상태

   ```typescript
   {
     errors?: { email: ['이미 사용 중인 이메일'],... },
     message?: '오류 메시지',
   }
   ```

2. **action**: 폼 onsubmit에 연결

   ```typescript
   <form action={action}>...</form>
   ```

3. **pending**: 제출 중 여부
   ```typescript
   <button disabled={pending}>
     {pending ? '제출 중...' : '제출'}
   </button>
   ```

## 검증 흐름

```
[폼 제출]
   ↓
Client: HTML5 검증 (required, type="email")
   ↓
Server Action: Zod 검증
   ├─ 오류 → state 반환 → Client에서 표시
   ├─ 성공 → DB 저장
   └─ redirect() → 내비게이션
```

### Zod 검증 (Server Side)

```typescript
const SignupSchema = z.object({
  email: z.string().email('올바른 이메일'),
  password: z.string().min(8, '8글자 이상'),
});

const result = SignupSchema.safeParse(rawData);
// { success: true/false, data?: {...}, error?: {...} }

if (!result.success) {
  return {
    errors: result.error.flatten().fieldErrors,
    // { email: ['올바른 이메일'], password: ['8글자 이상'] }
  };
}
```

## 비밀번호 해싱 (bcryptjs)

```typescript
import bcrypt from 'bcryptjs';

// 저장 시: 비밀번호를 해시로 변환
const hashedPassword = await bcrypt.hash(password, 10);
// "Abc123" → "$2b$10$abcdef..." (복호화 불가능)

await db.user.create({
  data: {
    email,
    password: hashedPassword, // ← 해시값 저장
  },
});

// 로그인 시: 입력된 비밀번호를 저장된 해시와 비교
const passwordsMatch = await bcrypt.compare(password, user.password);
// "Abc123" vs "$2b$10$abcdef..." → true/false
```

## 보안 주의사항

### ✅ 안전한 에러 메시지

```typescript
// 로그인 실패
return {
  message: '이메일 또는 비밀번호가 올바르지 않습니다.',
  // 사용자가 이메일 존재 여부를 알 수 없음
};
```

### ❌ 위험한 에러 메시지

```typescript
if (!user) {
  return { message: '이메일이 존재하지 않습니다.' };
  // 공격자가 유효한 이메일 목록을 수집 가능
}
```

## 폼 구조 (Client)

```typescript
'use client'
function SignupForm() {
  const [state, action, pending] = useActionState(signup)

  return (
    <form action={action}>
      {/* 일반 에러 */}
      {state?.message && <div>{state.message}</div>}

      {/* 필드별 에러 */}
      <input name="email" />
      {state?.errors?.email && <p>{state.errors.email[0]}</p>}

      {/* 제출 중 상태 */}
      <button disabled={pending}>
        {pending ? '제출 중...' : '제출'}
      </button>
    </form>
  )
}
```

## 요약

| 구분           | API Route  | Server Actions |
| -------------- | ---------- | -------------- |
| 파일 위치      | `app/api/` | `app/actions/` |
| 호출 방식      | fetch()    | form action    |
| 데이터 형식    | JSON       | FormData       |
| 에러 처리      | 수동       | 자동           |
| 보일러플레이트 | 많음       | 적음           |

이 프로젝트는 **Server Actions** 방식을 사용합니다.
