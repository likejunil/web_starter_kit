'use server';

import 'server-only';
import { cache } from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { decrypt } from '@/lib/session';
import { db } from '@/lib/db';

/**
 * DAL (Data Access Layer)
 *
 * 인증 및 사용자 데이터 접근의 중앙화된 계층
 *
 * cache() 사용 이유:
 * - 같은 요청 내에서 동일한 함수 호출 시 DB에 한 번만 접근
 * - Layout → Page → Child Component 트리에서 중복 쿼리 방지
 *
 * Layout에서 호출하면 안 되는 이유:
 * - Next.js 16의 Partial Rendering: 페이지 전환 시 Layout은 재실행되지 않음
 * - A 페이지 (인증) → B 페이지 (공개) 이동 시 인증 체크가 스킵될 수 있음
 * - 반드시 Page 컴포넌트에서 호출할 것
 */

/**
 * 세션 검증
 *
 * 쿠키 → JWT 복호화 → 미인증 시 /login으로 리다이렉트
 *
 * @returns { isAuth: true, userId }
 * @throws redirect /login (미인증 시)
 */
export const verifySession = cache(async () => {
  const cookieStore = await cookies();
  const cookie = cookieStore.get('session')?.value;
  const session = await decrypt(cookie);

  if (!session?.userId) {
    redirect('/login');
  }

  return { isAuth: true, userId: session.userId };
});

/**
 * 현재 사용자 정보 조회
 *
 * verifySession() 호출 → DB에서 사용자 정보 조회 (password 필드 제외)
 *
 * 사용법 (Page 컴포넌트):
 *   const user = await getUser()  // 미인증 시 자동으로 /login 리다이렉트
 *   return <p>{user?.name}</p>
 *
 * @returns 사용자 정보 (password, 민감한 필드 제외)
 * @throws redirect /login (미인증 시)
 */
export const getUser = cache(async () => {
  const session = await verifySession();

  if (!session) return null;

  return db.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      image: true,
    },
  });
});
