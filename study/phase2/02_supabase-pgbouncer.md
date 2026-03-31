# Supabase와 pgBouncer

## Supabase란?

**Supabase**는 **관리형 PostgreSQL 데이터베이스 서비스**입니다. (Firebase의 PostgreSQL 버전이라고 생각하면 됨)

- 자동 백업, 모니터링 제공
- 별도의 서버 관리 불필요
- 우리는 데이터베이스만 집중하면 됨

## PostgreSQL의 두 가지 포트

Supabase에서 제공하는 연결 정보:

```env
DATABASE_URL="...@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="...@aws-1-ap-northeast-1.pooler.supabase.com:5432/postgres"
```

### 포트 5432 (직접 연결)

```
[내 앱] ────────> [PostgreSQL 서버]
```

**특징**:

- PostgreSQL과 직접 연결
- 한 번에 하나의 커넥션만 유지 가능
- DDL 명령 가능 (CREATE TABLE, ALTER TABLE 등)
- **마이그레이션에 사용**

### 포트 6543 (pgBouncer를 통한 연결)

```
[내 앱] ───> [pgBouncer] ───> [PostgreSQL 서버]
```

\*\*pgBouncer란?:

- 데이터베이스 연결 풀을 관리해주는 중간다리
- 많은 클라이언트 요청을 효율적으로 처리

**특징**:

- 여러 앱이 동시에 연결 가능
- 동시 사용자 많을 때 성능 향상
- DDL 명령 불가능 (CREATE TABLE 등 안 됨)
- **앱 런타임에 사용**

## 왜 두 개를 나눠서 사용하는가?

```
마이그레이션 (스키마 변경)
└─ DIRECT_URL (포트 5432) 사용
   └─ DDL이 필요하므로 직접 연결 필요

앱 실행 (데이터 읽고 쓰기)
└─ DATABASE_URL (포트 6543 + pgBouncer) 사용
   └─ SELECT, INSERT만 사용하고, 동시 사용자 많음
```

## 이 프로젝트의 설정

```typescript
// prisma/schema.prisma
datasource db {
  provider = "postgresql"
  // url 제거됨 (Prisma v7부터)
}

// 마이그레이션 시: DIRECT_URL (5432) 사용
// 앱 런타임: DATABASE_URL (6543 + pgBouncer) 사용
```

## 요약

| 항목        | 포트 5432       | 포트 6543      |
| ----------- | --------------- | -------------- |
| 이름        | PostgreSQL 직접 | pgBouncer      |
| 동시 사용자 | 1개             | 많음           |
| DDL         | 가능            | 불가능         |
| 언제 사용   | 마이그레이션    | 앱 실행        |
| 변수명      | `DIRECT_URL`    | `DATABASE_URL` |
