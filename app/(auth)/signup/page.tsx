import type { Metadata } from 'next';
import Link from 'next/link';
import { SignupForm } from './_components/signup-form';

export const metadata: Metadata = {
  title: '회원가입',
  description: '새로운 계정을 만드세요.',
};

export default function SignupPage() {
  return (
    <div className="space-y-6 p-8">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold">회원가입</h1>
        <p className="text-muted-foreground text-sm">새로운 계정을 만드세요.</p>
      </div>

      <SignupForm />

      <div className="text-center text-sm">
        이미 계정이 있으신가요?{' '}
        <Link href="/login" className="text-primary font-medium hover:underline">
          로그인
        </Link>
      </div>
    </div>
  );
}
