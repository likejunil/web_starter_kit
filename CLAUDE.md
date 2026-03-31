# 프로젝트 개요

Next.js 16 + React 19 + TypeScript 5 기반의 모던 웹 애플리케이션 스타터 킷.  
Prisma ORM, JWT 기반 인증 시스템, DAL 패턴을 구현하고 있습니다.

## 핵심 기술 스택

| 항목             | 스택                                    |
| ---------------- | --------------------------------------- |
| **프레임워크**   | Next.js 16.2.1 (App Router)             |
| **언어**         | TypeScript 5, React 19.2.4              |
| **데이터베이스** | PostgreSQL + Prisma 7.6.0 ORM           |
| **인증**         | bcryptjs + Jose(JWT)                    |
| **폼/검증**      | React Hook Form + Zod                   |
| **UI**           | Shadcn + Radix UI + Tailwind CSS 4      |
| **환경변수**     | @t3-oss/env-nextjs (타입세이프)         |
| **개발 도구**    | ESLint 9, Prettier, Husky + lint-staged |

## 주의사항

**Next.js 16은 breaking changes가 있습니다.**

- API, 컨벤션, 파일 구조가 훈련 데이터와 다를 수 있음
- 코드 작성 전 `node_modules/next/dist/docs/`의 가이드 참고 필수
- 사용 중단(deprecated) 공지 반드시 확인

## 아키텍처 패턴

### 디렉토리 구조

```
app/              - Next.js App Router (페이지, API 라우트)
components/       - 재사용 가능한 React 컴포넌트
lib/              - 유틸리티, 헬퍼 함수, 공통 로직
  └─ auth/        - 인증 관련 (JWT, 세션 관리)
  └─ dal/         - Data Access Layer (DB 계층 추상화)
prisma/           - 스키마 정의, 마이그레이션
public/           - 정적 자산
study/            - 학습 자료, 실험 코드
```

### 인증 시스템

- **사용자 모델**: Prisma User (email, password hash, OAuth 지원 구조)
- **비밀번호**: bcryptjs로 해싱
- **토큰**: Jose를 이용한 JWT 기반 인증
- **패턴**: DAL을 통한 데이터 접근

## 개발 워크플로우

### 스크립트

```bash
npm run dev          # 개발 서버 (localhost:3000)
npm run build        # 프로덕션 빌드
npm run start        # 빌드된 앱 실행
npm run lint         # ESLint 실행
npm run format       # Prettier 포맷팅
npm run format:check # 포맷팅 검사
```

### Pre-commit 훅

Husky + lint-staged가 자동 실행:

- `*.{ts,tsx,mjs}`: ESLint 자동 수정 + Prettier 포맷팅
- `*.{json,md,css}`: Prettier 포맷팅

## 세부 규칙 위치

추가 규칙은 `rules/` 디렉토리에서 관리합니다:

- 컴포넌트 작성 규칙
- API 라우트 패턴
- 데이터 페칭 방식
- 에러 처리 가이드
- 등등...
