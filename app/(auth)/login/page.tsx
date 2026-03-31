import type { Metadata } from 'next';
import Link from 'next/link';
import { LoginForm } from './_components/login-form';

export const metadata: Metadata = {
  title: '로그인',
  description: '계정으로 로그인하세요.',
};

export default function LoginPage() {
  return (
    <div className="space-y-6 p-8">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold">로그인</h1>
        <p className="text-muted-foreground text-sm">계정으로 로그인하세요.</p>
      </div>

      <LoginForm />

      <div className="text-center text-sm">
        계정이 없으신가요?{' '}
        <Link href="/signup" className="text-primary font-medium hover:underline">
          회원가입
        </Link>
      </div>
    </div>
  );
}
