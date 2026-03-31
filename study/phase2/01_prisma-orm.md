# Prisma ORM이란?

## 개념

**Prisma**는 **객체 관계 매핑(ORM, Object-Relational Mapping)** 도구입니다.

쉽게 말해서, "데이터베이스와 JavaScript 코드를 연결해주는 다리" 역할을 합니다.

### ORM이 없을 때 (SQL 직접 작성)

```javascript
// SQL 쿼리를 문자열로 작성
const result = await db.query(
  `
  SELECT * FROM users WHERE email = $1
`,
  [email]
);

// 반환된 객체가 정확히 무엇인지 모름 (타입 정보 없음)
const user = result.rows[0];
console.log(user.name); // 타입 체크 안 됨 - 런타임 오류 위험
```

### ORM 사용할 때 (Prisma)

```javascript
// Prisma Client가 SQL을 자동 생성
const user = await db.user.findUnique({
  where: { email },
});

// TypeScript가 타입을 알고 있음
console.log(user?.name); // 타입 체크 지원 - 컴파일 타임에 오류 감지
```

## Prisma의 3가지 주요 개념

### 1. Schema (스키마)

데이터베이스의 구조를 정의하는 파일 (`prisma/schema.prisma`).

```prisma
model User {
  id    String   @id @default(cuid())
  email String   @unique
  name  String?
}
```

### 2. Migration (마이그레이션)

스키마 변경을 데이터베이스에 적용하는 과정.

```bash
npx prisma migrate dev --name add_email_field
```

### 3. Client (클라이언트)

앱 코드에서 데이터베이스와 상호작용하는 도구.

```javascript
import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()
const user = await db.user.create({ data: { ... } })
```

## 이 프로젝트에서의 사용

```
schema.prisma  ← "User 테이블은 이런 구조다"
      ↓
npx prisma migrate  ← 구조를 DB에 적용
      ↓
lib/db.ts  ← 싱글톤 클라이언트 생성
      ↓
app/actions/auth.ts  ← 앱 코드에서 db.user.create() 사용
```

## 왜 Prisma를 쓰는가?

1. **타입 안전성**: TypeScript와 완벽 연동
2. **마이그레이션**: DDL 자동 생성
3. **개발 속도**: 반복문이나 매핑 코드 불필요
4. **에러 감소**: SQL 인젝션 자동 방지
