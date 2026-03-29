# Phase 1 Step 1: shadcn/ui 설치 및 기본 설정

## 무엇을 했나

### 작업 내용
1. `npx shadcn@latest init -y --defaults` 명령으로 shadcn/ui 초기화
2. 기본 컴포넌트 설치:
   - Button
   - Input
   - Form
   - Dialog

### 생성된 파일
```
components/
├── ui/
│   ├── button.tsx      # 버튼 컴포넌트
│   ├── input.tsx       # 입력 필드 컴포넌트
│   ├── form.tsx        # 폼 컴포넌트
│   ├── dialog.tsx      # 모달 컴포넌트
│   └── ...
lib/
└── utils.ts            # cn() 유틸 함수

components.json         # shadcn 설정 파일 (새로 생성)
```

### 수정된 파일
- `app/globals.css` - CSS 변수 추가

---

## shadcn/ui란 무엇인가 (개념 설명)

### 정의
**shadcn/ui**는 React 컴포넌트 라이브러리입니다. 하지만 일반적인 npm 패키지와 다릅니다.

### 다른 라이브러리와의 차이점

| 구분 | npm 패키지 (예: Material-UI) | shadcn/ui |
|------|--------------------------|-----------|
| 설치 방식 | `npm install` | `npx shadcn@latest add button` |
| 코드 | node_modules에 숨겨짐 | 프로젝트 폴더에 복사됨 |
| 커스터마이징 | 제한적 | 완전 자유로움 |
| 업데이트 | 자동 | 선택적 (필요시만) |

### 핵심 개념: Copy-Paste 방식

shadcn/ui는 **코드를 복사해서 사용하는 방식**입니다:

```
패키지 설치 ❌
↓
패키지 다운로드 → 코드 복사 → 프로젝트에 붙여넣기 ✓
```

이렇게 하면:
- 코드가 여러분 것이 됨 → 마음대로 수정 가능
- 더 이상 의존성 증가 X
- 버전 충돌 걱정 X

### 내부 구조

```typescript
// button.tsx (shadcn에서 제공)
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(...)  // 버튼의 다양한 스타일 정의

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<
  HTMLButtonElement,
  ButtonProps
>(({ className, variant, size, ...props }, ref) => (
  <button
    className={cn(buttonVariants({ variant, size, className }))}
    ref={ref}
    {...props}
  />
))
```

**설명:**
- `cva` - 스타일 변형(variant) 정의 (크기, 색상 등)
- `cn()` - CSS 클래스 병합 유틸 (Tailwind 클래스 + 커스텀 클래스)
- `React.forwardRef` - ref 전달 (부모에서 자식 DOM 접근 가능)

---

## 왜 shadcn/ui를 선택하는가

### 1. 완전한 커스터마이징
```typescript
// components/ui/button.tsx (여러분 소유)
// 마음대로 수정 가능
const buttonVariants = cva("rounded-full px-4 py-2", {  // 추가 스타일
  variants: {
    variant: {
      default: "bg-blue-500 text-white",
      custom: "bg-purple-500",  // 새로운 변형 추가 가능
    }
  }
})
```

### 2. 타입세이프
```typescript
// TypeScript 타입 완성도
<Button variant="default" size="lg">Click</Button>
                ↓ (자동완성 + 타입 체크)
```

### 3. Tailwind CSS 기반
- Tailwind CSS를 이미 프로젝트에서 사용 중
- 추가 CSS 파일 없음
- 번들 크기 작음

### 4. 학습 곡선이 낮음
- 복잡한 설정 X
- 코드가 간단하고 직관적
- 필요하면 언제든 수정 가능

---

## 핵심 정리

| 항목 | 내용 |
|------|------|
| **설치 방식** | Copy-Paste (코드가 프로젝트에 복사됨) |
| **주요 특징** | 완전 커스터마이징 가능 + Tailwind CSS 기반 |
| **생성 폴더** | `components/ui/` |
| **유틸 함수** | `lib/utils.ts`의 `cn()` - CSS 클래스 병합 |
| **설정 파일** | `components.json` - shadcn 동작 설정 |

### 자주 쓸 파일

**1. `lib/utils.ts`**
```typescript
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```
- `cn()` = Tailwind CSS 클래스 충돌 해결 함수
- 예: `cn("px-2", "px-4")` → `px-4` (뒤쪽이 이김)

**2. `components.json`**
```json
{
  "style": "default",
  "rsc": true,
  "tsx": true,
  "aliasPrefix": "@"
}
```
- shadcn이 컴포넌트를 생성할 때의 설정
- style: 컴포넌트 스타일 (default/new-york)
- tsx: TypeScript 사용 여부

---

## 다음 단계

Phase 1 Step 2: Zod + React Hook Form 통합

이제 폼 검증을 추가합니다. shadcn의 Form 컴포넌트와 함께 사용합니다.
