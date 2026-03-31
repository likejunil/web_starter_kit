'use client';

import { useActionState } from 'react';
import { login } from '@/app/actions/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

/**
 * 로그인 폼 (Client Component)
 *
 * useActionState() 훅 사용
 * - Server Action (login)을 폼 제출에 연결
 * - 서버에서 검증 결과 (errors, message)를 받아 화면에 표시
 * - 성공 시 Server Action 내에서 redirect 실행
 *
 * 상태:
 * - state: 서버에서 반환한 에러 정보
 * - action: 폼 제출 시 실행할 Server Action
 * - pending: 제출 중 여부 (버튼 disabled)
 */

export function LoginForm() {
  const [state, action, pending] = useActionState(login, undefined);

  return (
    <form action={action} className="space-y-4">
      {/* 일반 에러 메시지 */}
      {state?.message && (
        <div className="bg-destructive/10 text-destructive rounded-md p-3 text-sm">
          {state.message}
        </div>
      )}

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
      </div>

      {/* 제출 버튼 */}
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? '로그인 중...' : '로그인'}
      </Button>
    </form>
  );
}
