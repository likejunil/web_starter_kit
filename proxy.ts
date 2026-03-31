import { NextRequest, NextResponse } from 'next/server';
import { decrypt } from '@/lib/session';
import { cookies } from 'next/headers';

/**
 * Proxy (라우트 보호)
 *
 * Next.js 16에서 middleware.ts 대신 proxy.ts 사용
 * (이전 Next.js 버전의 middleware와 동일한 역할)
 *
 * 역할: 낙관적 라우트 보호 (DB 접근 없음, 쿠키만 검증)
 *
 * 주의: proxy.ts에서 권한 검증을 하지 말 것
 * - 목표: 성능 (빠른 응답)
 * - 실제 권한 검증은 lib/dal.ts (verifySession, getUser)에서 수행
 */

const protectedRoutes = ['/dashboard', '/profile', '/settings'];
const publicRoutes = ['/login', '/signup', '/'];

export default async function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const isProtectedRoute = protectedRoutes.some((route) => path.startsWith(route));
  const isPublicRoute = publicRoutes.includes(path);

  // 쿠키에서 세션 추출
  const cookieStore = await cookies();
  const cookie = cookieStore.get('session')?.value;
  const session = await decrypt(cookie);

  // 보호된 라우트: 인증 확인
  if (isProtectedRoute && !session?.userId) {
    return NextResponse.redirect(new URL('/login', req.nextUrl));
  }

  // 공개 라우트가 아닌 인증 페이지: 로그인 상태면 /dashboard로 리다이렉트
  // (예: 로그인한 사용자가 /login을 방문하면 /dashboard로 이동)
  if (!isPublicRoute && session?.userId) {
    if (path === '/login' || path === '/signup') {
      return NextResponse.redirect(new URL('/dashboard', req.nextUrl));
    }
  }

  return NextResponse.next();
}

export const config = {
  // api/, _next/static/, _next/image/, 이미지 파일은 제외
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
};
