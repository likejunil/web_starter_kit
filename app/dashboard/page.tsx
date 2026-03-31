import type { Metadata } from 'next';
import { getUser } from '@/lib/dal';
import { Button } from '@/components/ui/button';
import { logout } from '@/app/actions/auth';

/**
 * 대시보드 페이지 (보호된 라우트)
 *
 * Server Component에서 getUser() 호출
 * - 미인증 시 자동으로 /login으로 리다이렉트
 * - 인증된 사용자만 이 페이지에 도달
 *
 * 주의: Layout에서 호출하면 안 됨 (Next.js 16 Partial Rendering 때문)
 */

export const metadata: Metadata = {
  title: '대시보드',
  description: '사용자 대시보드',
};

export default async function DashboardPage() {
  const user = await getUser();

  return (
    <div className="space-y-6 p-8">
      <div>
        <h1 className="text-3xl font-bold">대시보드</h1>
        <p className="text-muted-foreground mt-1">{user?.name}님, 환영합니다!</p>
      </div>

      <div className="border-border bg-card rounded-lg border p-6">
        <h2 className="mb-4 text-xl font-semibold">사용자 정보</h2>
        <div className="space-y-3 text-sm">
          <div>
            <span className="text-muted-foreground">이름:</span>{' '}
            <span className="font-medium">{user?.name}</span>
          </div>
          <div>
            <span className="text-muted-foreground">이메일:</span>{' '}
            <span className="font-medium">{user?.email}</span>
          </div>
          <div>
            <span className="text-muted-foreground">역할:</span>{' '}
            <span className="font-medium capitalize">{user?.role}</span>
          </div>
        </div>
      </div>

      {/* 로그아웃 버튼 */}
      <form action={logout}>
        <Button type="submit" variant="destructive">
          로그아웃
        </Button>
      </form>
    </div>
  );
}
