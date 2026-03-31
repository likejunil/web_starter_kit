'use server';

import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { createSession, deleteSession } from '@/lib/session';

/**
 * Server Actions: 인증 관련 로직
 *
 * Client Component에서 useActionState()로 호출됨
 * 폼 제출 후 서버에서 실행, 결과를 클라이언트로 반환
 *
 * 반환 타입: FormState
 * - errors: Zod 검증 실패 시 필드별 에러 메시지
 * - message: 사용자 친화 에러 (중복 이메일, 잘못된 비밀번호)
 * - undefined: 성공 (redirect 발생)
 */

export type FormState =
  | {
      errors?: Record<string, string[]>;
      message?: string;
    }
  | undefined;

/**
 * 회원가입
 *
 * 1. Zod로 입력값 검증 (이메일 형식, 비밀번호 강도)
 * 2. 중복 이메일 확인
 * 3. 비밀번호 해싱 (bcryptjs)
 * 4. DB에 사용자 저장
 * 5. 세션 생성
 * 6. /dashboard로 리다이렉트
 */

const SignupSchema = z
  .object({
    name: z.string().min(2, '이름은 2글자 이상 필요'),
    email: z.string().email('올바른 이메일 주소를 입력하세요'),
    password: z
      .string()
      .min(8, '비밀번호는 8글자 이상 필요')
      .regex(/[A-Z]/, '대문자를 포함해야 합니다')
      .regex(/[0-9]/, '숫자를 포함해야 합니다'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: '비밀번호가 일치하지 않습니다',
    path: ['confirmPassword'],
  });

export async function signup(state: FormState, formData: FormData): Promise<FormState> {
  const rawData = {
    name: formData.get('name'),
    email: formData.get('email'),
    password: formData.get('password'),
    confirmPassword: formData.get('confirmPassword'),
  };

  const result = SignupSchema.safeParse(rawData);

  if (!result.success) {
    return {
      errors: result.error.flatten().fieldErrors,
    };
  }

  const { name, email, password } = result.data;

  // 중복 이메일 확인
  const existingUser = await db.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    return {
      message: '이미 사용 중인 이메일입니다.',
    };
  }

  // 비밀번호 해싱
  // bcrypt.hash(password, saltRounds)
  // saltRounds: 10~12 권장 (높을수록 느리지만 안전)
  const hashedPassword = await bcrypt.hash(password, 10);

  // 사용자 생성
  const user = await db.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
    },
  });

  // 세션 생성 (JWT 쿠키)
  await createSession(user.id);

  // 리다이렉트 (이 이후의 코드는 실행되지 않음)
  redirect('/dashboard');
}

/**
 * 로그인
 *
 * 1. Zod로 입력값 검증
 * 2. DB에서 사용자 조회
 * 3. 비밀번호 해시 비교 (bcryptjs)
 * 4. 세션 생성
 * 5. /dashboard로 리다이렉트
 */

const LoginSchema = z.object({
  email: z.string().email('올바른 이메일 주소를 입력하세요'),
  password: z.string().min(1, '비밀번호를 입력하세요'),
});

export async function login(state: FormState, formData: FormData): Promise<FormState> {
  const rawData = {
    email: formData.get('email'),
    password: formData.get('password'),
  };

  const result = LoginSchema.safeParse(rawData);

  if (!result.success) {
    return {
      errors: result.error.flatten().fieldErrors,
    };
  }

  const { email, password } = result.data;

  // 사용자 조회
  const user = await db.user.findUnique({
    where: { email },
  });

  // 사용자 없음 또는 비밀번호 필드 없음 (OAuth 사용자)
  if (!user?.password) {
    return {
      message: '이메일 또는 비밀번호가 올바르지 않습니다.',
    };
  }

  // 비밀번호 비교
  // bcrypt.compare(plaintext, hash)
  // 해시된 비밀번호와 입력된 평문을 비교
  const passwordsMatch = await bcrypt.compare(password, user.password);

  if (!passwordsMatch) {
    return {
      message: '이메일 또는 비밀번호가 올바르지 않습니다.',
    };
  }

  // 세션 생성
  await createSession(user.id);

  // 리다이렉트
  redirect('/dashboard');
}

/**
 * 로그아웃
 *
 * 세션 쿠키 삭제 → /login으로 리다이렉트
 */
export async function logout() {
  await deleteSession();
  redirect('/login');
}
