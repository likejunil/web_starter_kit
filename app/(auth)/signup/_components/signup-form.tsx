'use client';

import { useActionState } from 'react';
import { signup } from '@/app/actions/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

/**
 * 회원가입 폼 (Client Component)
 *
 * signup Server Action을 사용하여 폼 제출 처리
 * - 클라이언트 측 검증: HTML5 required, type="email" 등
 * - 서버 측 검증: Zod (app/actions/auth.ts)
 * - 에러 표시: 필드별 검증 메시지
 */

export function SignupForm() {
  const [state, action, pending] = useActionState(signup, undefined);

  return (
    <form action={action} className="space-y-4">
      {/* 일반 에러 메시지 */}
      {state?.message && (
        <div className="bg-destructive/10 text-destructive rounded-md p-3 text-sm">
          {state.message}
        </div>
      )}

      {/* 이름 */}
      <div className="space-y-2">
        <Label htmlFor="name">이름</Label>
        <Input id="name" name="name" type="text" placeholder="홍길동" disabled={pending} required />
        {state?.errors?.name && <p className="text-destructive text-sm">{state.errors.name[0]}</p>}
      </div>

      {/* 이메일 */}
      <div className="space-y-2">
        <Label htmlFor="email">이메일</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="you@example.com"
          disabled={pending}
          required
        />
        {state?.errors?.email && (
          <p className="text-destructive text-sm">{state.errors.email[0]}</p>
        )}
      </div>

      {/* 비밀번호 */}
      <div className="space-y-2">
        <Label htmlFor="password">비밀번호</Label>
        <Input
          id="password"
          name="password"
          type="password"
          placeholder="••••••••"
          disabled={pending}
          required
        />
        {state?.errors?.password && (
          <p className="text-destructive text-sm">{state.errors.password[0]}</p>
        )}
        <p className="text-muted-foreground text-xs">최소 8글자, 대문자, 숫자 포함</p>
      </div>

      {/* 비밀번호 확인 */}
      <div className="space-y-2">
        <Label htmlFor="confirmPassword">비밀번호 확인</Label>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          placeholder="••••••••"
          disabled={pending}
          required
        />
        {state?.errors?.confirmPassword && (
          <p className="text-destructive text-sm">{state.errors.confirmPassword[0]}</p>
        )}
      </div>

      {/* 제출 버튼 */}
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? '가입 중...' : '회원가입'}
      </Button>
    </form>
  );
}
