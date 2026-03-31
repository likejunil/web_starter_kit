import type { ReactNode } from 'react';

/**
 * 인증 페이지 공통 레이아웃
 *
 * (auth) Route Group
 * - URL에는 영향을 주지 않음 (/login, /signup)
 * - 폴더 구조를 논리적으로 분리하기 위함
 *
 * 레이아웃: 화면 가운데에 카드 형식으로 폼 표시
 */

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="from-background to-muted flex min-h-screen items-center justify-center bg-gradient-to-br p-4">
      <div className="border-border bg-card w-full max-w-md rounded-lg border shadow-lg">
        {children}
      </div>
    </div>
  );
}
