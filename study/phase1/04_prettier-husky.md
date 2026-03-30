# Phase 1 Step 4: Prettier + Husky + lint-staged

## 무엇을 했나

### 작업 내용

1. 패키지 설치: `prettier`, `prettier-plugin-tailwindcss`, `eslint-config-prettier`, `husky`, `lint-staged`
2. `.prettierrc` 파일 생성 (Prettier 설정)
3. `.prettierignore` 파일 생성 (포맷팅 제외 대상)
4. `eslint.config.mjs` 수정 (Prettier와 ESLint 통합)
5. Husky 초기화 및 `.husky/pre-commit` 설정
6. `package.json`에 lint-staged 설정 추가
7. 초기 포맷팅 실행

### 생성된 파일

```
.prettierrc                     # Prettier 설정
.prettierignore                 # Prettier 제외 목록
.husky/
└── pre-commit                  # git commit 전 lint-staged 실행

study/phase1/
└── 04_prettier-husky.md        # 학습 가이드
```

### 수정된 파일

- `eslint.config.mjs` - prettier 설정 추가
- `package.json` - format/format:check scripts + lint-staged 설정

---

## 개발자 경험 (DX) 이란?

### 정의

**개발자 경험 (Developer Experience, DX)**는 개발자가 코드를 작성할 때 얼마나 편한지를 나타냅니다.

### 나쁜 DX의 예

```bash
# 코드 작성
git add .
git commit -m "feature: login form"

# 일부러 지저분한 코드를 커밋하면?
# → 코드 리뷰 시 스타일 지적 (쓸데없는 논의)
# → 다른 개발자 코드가 섞여서 git blame 읽기 어려움
# → 프로젝트 전체 코드 스타일이 일관되지 않음
```

### 좋은 DX의 예

```bash
# 코드 작성 (조금 지저분해도 괜찮음)
git add .
git commit -m "feature: login form"

# 자동으로 Prettier가 포맷팅 실행
# 자동으로 ESLint 검사 실행
# → 버튼 클릭 없이 모두 자동화!
# → 코드 스타일만 일관되고, 개발자는 로직에만 집중
```

---

## Prettier란 무엇인가

### 정의

**Prettier**는 **코드 포맷터** - 코드를 읽기 좋게 자동으로 정리해주는 도구입니다.

### 포맷팅 vs 린팅의 차이

| 항목          | ESLint (린팅)                   | Prettier (포맷팅)                 |
| ------------- | ------------------------------- | --------------------------------- |
| **목적**      | 버그 찾기 (논리 오류, 보안)     | 코드 스타일 정리 (들여쓰기, 공백) |
| **예**        | undefined 사용, 사용 안 함 변수 | 들여쓰기 2칸 vs 4칸               |
| **자동 수정** | 일부만 가능                     | 모두 가능                         |

### Prettier 설정 (.prettierrc)

```json
{
  "tabWidth": 2, // 들여쓰기: 2칸
  "useTabs": false, // 스페이스 사용 (탭 X)
  "semi": true, // 세미콜론 필수 (;)
  "singleQuote": true, // 큰따옴표 대신 작은따옴표
  "trailingComma": "es5", // 마지막 쉼표 (배열, 객체)
  "bracketSpacing": true, // { } 사이 공백
  "arrowParens": "always", // 화살표 함수 인자 괄호 항상 포함
  "printWidth": 100, // 한 줄 최대 길이: 100자
  "plugins": ["prettier-plugin-tailwindcss"] // Tailwind CSS 클래스 정렬
}
```

### prettier-plugin-tailwindcss의 역할

Tailwind CSS 클래스를 자동으로 정렬합니다.

```typescript
// Before (무질서)
<div className="text-center gap-4 flex items-center text-lg font-bold">

// After (Prettier 실행)
<div className="flex items-center gap-4 text-center text-lg font-bold">
```

---

## Husky란 무엇인가

### 정의

**Husky**는 **Git hook 관리자** - Git 이벤트(commit, push 등)에 자동으로 스크립트를 실행합니다.

### Git hook이란?

Git의 특정 이벤트(예: commit)가 발생할 때 자동으로 실행되는 스크립트입니다.

```
git commit
    ↓
.git/hooks/pre-commit (이 스크립트가 실행됨!)
    ↓
    ├─ ✅ 성공하면 → commit 진행
    └─ ❌ 실패하면 → commit 취소
```

### Husky로 관리되는 hook

**`.husky/pre-commit`**

```bash
npx lint-staged
```

- commit 전에 실행
- 변경된 파일만 lint + format
- 오류가 있으면 commit 취소

---

## lint-staged란 무엇인가

### 정의

**lint-staged**는 **stage된 파일에만 lint/format 실행** - 전체 프로젝트가 아니라 이번 commit에 포함될 파일만 검사합니다.

### 왜 필요한가?

#### ❌ 전체 프로젝트에서 lint 실행

```bash
npm run lint              # 전체 파일 검사
# 시간이 오래 걸림 (수십 초)
# 다른 개발자의 파일도 검사됨 (불필요)
```

#### ✅ lint-staged로 변경된 파일만 실행

```bash
npx lint-staged           # 이번 commit 파일만 검사
# 빠름 (1-2초)
# 자신의 파일만 검사됨 (정확함)
```

### lint-staged 설정 (package.json)

```json
"lint-staged": {
  "*.{ts,tsx,mjs}": [
    "eslint --fix",      // ESLint 자동 수정
    "prettier --write"   // Prettier 포맷팅
  ],
  "*.{json,md,css}": [
    "prettier --write"   // JSON/마크다운/CSS만 포맷팅
  ]
}
```

**의미:**

- TypeScript/JavaScript 파일: ESLint 검사 + Prettier 포맷팅
- JSON/마크다운/CSS: Prettier 포맷팅만

---

## 전체 자동화 흐름

```
1. 코드 작성 (조금 지저분해도 괜찮음)
    ↓
2. git add .
    ↓
3. git commit -m "message"
    ↓
4. 🪝 Husky의 pre-commit 훅 실행!
    ↓
5. npx lint-staged 실행
    ↓
6. ✅ ESLint 자동 수정 (lint-staged가 변경된 파일만)
    ↓
7. ✅ Prettier 포맷팅 (들여쓰기, 공백 정리)
    ↓
8. ✅ 모두 성공 → commit 진행
   ❌ 실패 → commit 취소 (개발자가 수정해야 함)
```

---

## 사용 방법

### 포맷팅 수동 실행

```bash
npm run format          # 전체 프로젝트 포맷팅
npm run format:check    # 포맷팅 필요 파일 확인 (실제 수정 X)
```

### 자동 포맷팅 검증

```bash
# 코드를 일부러 지저분하게 작성
git add .
git commit -m "test"   # 자동으로 포맷팅됨!
```

---

## Prettier와 ESLint 충돌 해결

### 문제

Prettier와 ESLint가 서로 다른 규칙을 강제하면 충돌합니다.

```typescript
// ESLint: "세미콜론 필수!"
// Prettier: "세미콜론 제거!"
const name = 'john';
```

### 해결책: eslint-config-prettier

```javascript
// eslint.config.mjs
import prettier from 'eslint-config-prettier';

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  prettier, // ← 추가: ESLint의 포맷팅 규칙 비활성화
  // 이제 Prettier가 모든 포맷팅 담당
]);
```

---

## 핵심 정리

| 도구            | 역할                         | 실행 시점                    |
| --------------- | ---------------------------- | ---------------------------- |
| **Prettier**    | 코드 포맷팅 (들여쓰기, 공백) | pre-commit 훅                |
| **ESLint**      | 코드 품질 검사 (버그, 보안)  | pre-commit 훅                |
| **Husky**       | Git hook 관리                | commit, push 등              |
| **lint-staged** | 변경된 파일만 검사           | pre-commit 훅 (Husky가 호출) |

### 포맷팅 설정 요약

- **들여쓰기**: 2칸 (탭 X)
- **따옴표**: 작은따옴표 (`'` )
- **세미콜론**: 필수 (`;`)
- **한 줄 길이**: 최대 100자
- **Tailwind CSS**: 클래스 자동 정렬

---

## 다음 단계

**✅ Phase 1 완료!**

지금까지 다음을 구축했습니다:

- ✅ Step 1: shadcn/ui (UI 컴포넌트)
- ✅ Step 2: Zod + React Hook Form (폼 검증)
- ✅ Step 3: t3-env (환경변수 관리)
- ✅ Step 4: Prettier + Husky + lint-staged (DX)

### Phase 1의 가치

이제 **모든 앱의 기반이 준비되었습니다**. 어떤 프로젝트를 시작하든:

- 폼 작성? → Zod + React Hook Form 사용
- UI 만들기? → shadcn/ui 컴포넌트 사용
- 환경변수? → lib/env.ts에 추가
- 코드 품질? → 자동으로 포맷팅 + 검사

---

## Phase 2 예정

**인증 + 데이터베이스**

- Auth.js (또는 Clerk) - 회원가입/로그인
- Prisma ORM - 타입세이프 데이터베이스
- PostgreSQL - 실제 데이터 저장

Phase 1을 완료한 개발자는 이제 **실제 앱을 만들 준비가 완료**되었습니다! 🚀
