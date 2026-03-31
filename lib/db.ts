import { PrismaClient } from '@prisma/client';

/**
 * 싱글톤 Prisma 클라이언트
 *
 * Next.js 개발 서버의 Hot Module Replacement(HMR)가 모듈을 재로드할 때마다
 * 새 DB 커넥션이 생기는 것을 방지하기 위해 globalThis에 저장합니다.
 * 프로덕션에서는 모듈이 한 번만 로드되므로 최적화되지 않습니다.
 *
 * 사용법:
 *   import { db } from '@/lib/db'
 *   const user = await db.user.findUnique({ where: { email } })
 */

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = db;
}
