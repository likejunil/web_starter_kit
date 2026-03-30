# Phase 1 Step 2: Zod + React Hook Form 통합

## 무엇을 했나

### 작업 내용

1. 패키지 설치: `zod`, `react-hook-form`, `@hookform/resolvers`
2. shadcn Form 컴포넌트 추가 (`components/ui/form.tsx`, `components/ui/label.tsx`)
3. 데모 폼 컴포넌트 생성: `components/demo-form.tsx`
   - 사용자명, 이메일, 비밀번호 필드
   - Zod 스키마로 검증 규칙 정의
   - React Hook Form으로 폼 상태 관리
4. `app/page.tsx` 업데이트

### 생성된 파일

```
components/
├── demo-form.tsx          # Zod + RHF 데모 폼
├── ui/
│   ├── button.tsx
│   ├── input.tsx
│   ├── dialog.tsx
│   ├── form.tsx           # 새로 생성
│   └── label.tsx          # 새로 생성

study/phase1/
└── 02_zod-rhf.md
```

---

## Zod란 무엇인가 (개념 설명)

### 정의

**Zod**는 TypeScript 중심의 **스키마 검증 라이브러리**입니다.

### 핵심 개념: 스키마 (Schema)

스키마 = "데이터의 형태와 규칙을 정의한 청사진"

```typescript
// 스키마 정의
const userSchema = z.object({
  username: z
    .string()
    .min(2) // 최소 2자
    .max(50), // 최대 50자
  email: z.string().email(), // 이메일 형식
  age: z.number().min(18), // 18 이상만 가능
});

// 스키마로부터 TypeScript 타입 자동 생성
type User = z.infer<typeof userSchema>;
// User = {
//   username: string
//   email: string
//   age: number
// }
```

### 왜 Zod를 사용하는가

#### 1. 타입과 검증이 하나다

```typescript
// ❌ 기존 방식: 따로 작성 필요
interface User {
  username: string;
  email: string;
}

function validateUser(data: unknown): User {
  if (typeof data !== 'object' || !data) throw new Error('...');
  if (typeof data.username !== 'string') throw new Error('...');
  // ... 반복되는 검증 로직
}

// ✅ Zod 방식: 한 곳에서 관리
const userSchema = z.object({
  username: z.string(),
  email: z.string().email(),
});

type User = z.infer<typeof userSchema>;
const user = userSchema.parse(data); // 자동 검증
```

#### 2. 여러 곳에서 재사용

```typescript
// 클라이언트에서 검증
const client = userSchema.safeParse(formData);
if (!client.success) {
  console.log(client.error.errors); // 상세한 에러 정보
}

// 서버에서 검증
const user = userSchema.parse(requestBody); // 같은 스키마 사용
```

#### 3. 런타임 검증

```typescript
const data = JSON.parse(userInput); // 어디서 온 데이터인지 알 수 없음

// Zod가 런타임에 검증
const user = userSchema.parse(data);
// data가 스키마를 만족하면 user 반환
// 만족하지 않으면 자세한 에러 메시지와 함께 throw
```

---

## React Hook Form (RHF) 이란 무엇인가

### 정의

**React Hook Form**은 **폼 상태를 관리하고 성능을 최적화하는 라이브러리**입니다.

### 문제: 기본 React로 폼을 만들면?

```typescript
export function BadForm() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // ... 각 필드마다 state 추가

  return (
    <form>
      <input
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        // 입력할 때마다 리렌더링 발생!
      />
      {/* ... */}
    </form>
  );
}
```

**문제점:**

- 입력할 때마다 리렌더링 (사용자 입력마다 화면 깜빡임)
- state 코드가 많음
- 검증 로직 추가하면 더 복잡해짐

### 해결책: React Hook Form

```typescript
export function GoodForm() {
  const form = useForm(); // 폼 상태를 한 곳에서 관리
  const { register, handleSubmit } = form;

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input
        {...register('username')}
        // 리렌더링 최소화! (실제로 input만 업데이트)
      />
    </form>
  );
}
```

**장점:**

- 리렌더링 최소화 → 빠른 성능
- 간결한 코드
- 검증과 쉽게 통합 가능

---

## Zod + React Hook Form이 함께 동작하는 방식

### 3단계 데이터 흐름

```
사용자 입력 → RHF가 받음 → Zod가 검증 → 에러 표시
     ↓
  form.watch()로 추적

버튼 클릭 → form.handleSubmit() → Zod 검증
     ↓ (성공)
  onSubmit() 함수 실행 (데이터 서버 전송)
```

### 데모 코드 분석

```typescript
// 1단계: Zod 스키마 정의 (검증 규칙)
const formSchema = z.object({
  username: z.string().min(2).max(50),
  email: z.string().email(),
  password: z.string().min(8),
});

// 2단계: RHF 초기화 (Zod와 연결)
const form = useForm<FormValues>({
  resolver: zodResolver(formSchema), // ← 여기서 연결!
  defaultValues: {
    username: "",
    email: "",
    password: "",
  },
});

// 3단계: FormField로 필드 렌더링
<FormField
  control={form.control}
  name="username"  // ← Zod 스키마의 "username" 필드
  render={({ field }) => (
    <FormItem>
      <Input {...field} />
      <FormMessage /> {/* ← 검증 에러 자동 표시 */}
    </FormItem>
  )}
/>

// 4단계: submit 핸들러 (자동으로 Zod 검증 실행)
function onSubmit(values: FormValues) {
  // values는 이미 Zod로 검증된 데이터
  // 타입도 안전함 (TypeScript)
}
```

---

## 핵심 정리

### Zod의 역할

| 항목          | 내용                                          |
| ------------- | --------------------------------------------- |
| **정의**      | 스키마 기반 검증 라이브러리                   |
| **주요 기능** | 데이터 형태 정의 + 검증 규칙 정의 + 타입 추론 |
| **사용 시점** | 폼 제출, API 요청/응답, 데이터베이스 저장 전  |
| **장점**      | 타입과 검증이 하나 + 런타임 안전성            |

### React Hook Form의 역할

| 항목          | 내용                                  |
| ------------- | ------------------------------------- |
| **정의**      | 폼 상태 관리 라이브러리               |
| **주요 기능** | 입력값 추적 + submit 처리 + 검증 실행 |
| **사용 시점** | 폼 렌더링 + 사용자 입력 처리          |
| **장점**      | 성능 최적화 + 간결한 코드             |

### 두 라이브러리의 관계

```
Zod (검증 규칙)
    ↓
React Hook Form (폼 상태 관리)
    ↓
shadcn Form (UI 컴포넌트)
    ↓
사용자에게 보여짐
```

### 자주 쓸 Zod 메서드

```typescript
z.string()                    // 문자열
z.number()                    // 숫자
z.boolean()                   // boolean
z.object({ ... })            // 객체
z.array(z.string())          // 배열

.min(2)                       // 최소값 (문자열: 최소 길이)
.max(50)                      // 최대값
.email()                      // 이메일 형식 검증
.regex(/regex/)              // 정규표현식 검증
.optional()                  // 선택 필드

.parse(data)                 // 검증 (실패 시 throw)
.safeParse(data)             // 안전한 검증 (에러 반환)
```

### 자주 쓸 RHF 메서드

```typescript
const form = useForm({ resolver: zodResolver(schema) });

form.register('fieldName'); // 필드 등록
form.handleSubmit(onSubmit); // submit 처리
form.watch(); // 입력값 실시간 추적
form.getValues(); // 현재 폼 값 조회
form.setValue(); // 프로그래밍으로 값 설정
form.reset(); // 폼 초기화
form.control; // FormField에서 사용
```

---

## 언제 사용하나?

### Zod 사용 예시

- ✅ 사용자 입력값 검증 (폼)
- ✅ API 응답 검증
- ✅ 환경변수 검증 (t3-env와 함께)
- ✅ 데이터베이스 저장 전 검증

### React Hook Form 사용 예시

- ✅ 회원가입/로그인 폼
- ✅ 프로필 수정 폼
- ✅ 검색 필터
- ✅ 복잡한 다단계 폼 (Wizard)

---

## 다음 단계

Phase 1 Step 3: t3-env로 환경변수 타입세이프 관리

환경변수(.env)를 타입세이프하게 관리하는 방법을 배웁니다.
