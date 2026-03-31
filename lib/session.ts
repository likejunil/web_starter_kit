'use server';

import 'server-only';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

/**
 * 세션 관리 (JWT 기반)
 *
 * - JWT를 사용한 무상태 세션 구현
 * - httpOnly 쿠키에 JWT 저장 (XSS 공격 방지)
 * - 서버에서만 쿠키 조작 가능 (CSRF 방지)
 *
 * 왜 JWT인가?
 * - 서버에 세션 데이터를 저장할 필요 없음 (확장성)
 * - 마이크로서비스 환경에서 인증 공유 가능
 * - Edge Runtime 호환
 */

type SessionPayload = {
  userId: string;
  expiresAt: Date;
};

const secretKey = process.env.AUTH_SECRET!;
const encodedKey = new TextEncoder().encode(secretKey);

/**
 * JWT 토큰 생성
 */
export async function encrypt(payload: SessionPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(encodedKey);
}

/**
 * JWT 토큰 검증 및 복호화
 *
 * @param session JWT 토큰 (쿠키 값)
 * @returns 복호화된 payload, 또는 null (검증 실패/만료)
 */
export async function decrypt(session: string | undefined = '') {
  if (!session) return null;

  try {
    const { payload } = await jwtVerify(session, encodedKey, {
      algorithms: ['HS256'],
    });
    return payload as SessionPayload;
  } catch {
    return null;
  }
}

/**
 * 세션 쿠키 생성 및 저장
 *
 * @param userId 사용자 ID
 *
 * HttpOnly: JavaScript에서 접근 불가 (XSS 공격 방지)
 * Secure: HTTPS 연결에서만 전송 (프로덕션)
 * SameSite: 다른 도메인의 요청에 쿠키 전송 방지 (CSRF 공격 방지)
 */
export async function createSession(userId: string) {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const token = await encrypt({ userId, expiresAt });
  const cookieStore = await cookies();

  cookieStore.set('session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    expires: expiresAt,
    sameSite: 'lax',
    path: '/',
  });
}

/**
 * 세션 쿠키 삭제
 */
export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete('session');
}
