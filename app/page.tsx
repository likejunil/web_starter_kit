import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { DemoForm } from '@/components/demo-form';

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex w-full max-w-3xl flex-1 flex-col gap-12 bg-white px-16 py-32 sm:items-start dark:bg-black">
        <Image
          className="dark:invert"
          src="/next.svg"
          alt="Next.js logo"
          width={100}
          height={20}
          priority
        />
        <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
          <h1 className="max-w-xs text-3xl leading-10 font-semibold tracking-tight text-black dark:text-zinc-50">
            웹 스타터 킷 구축 중
          </h1>
          <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            Phase 1: 기본 UI 컴포넌트 + 폼 검증 설정
          </p>
        </div>

        {/* Button 데모 섹션 */}
        <section className="w-full border-t pt-8">
          <h2 className="mb-6 text-2xl font-semibold text-black dark:text-zinc-50">
            Step 1: shadcn/ui Button 컴포넌트
          </h2>
          <div className="flex flex-col gap-4 text-base font-medium sm:flex-row">
            <Button variant="default" size="lg">
              기본 버튼 (default)
            </Button>
            <Button variant="secondary" size="lg">
              보조 버튼 (secondary)
            </Button>
            <Button variant="outline" size="lg">
              테두리 버튼 (outline)
            </Button>
          </div>
        </section>

        {/* Form 데모 섹션 */}
        <section className="w-full border-t pt-8">
          <h2 className="mb-6 text-2xl font-semibold text-black dark:text-zinc-50">
            Step 2: Zod + React Hook Form 폼 검증
          </h2>
          <p className="mb-6 text-zinc-600 dark:text-zinc-400">
            아래 폼을 작성해보세요. Zod 스키마가 자동으로 입력값을 검증합니다.
          </p>
          <div className="max-w-md">
            <DemoForm />
          </div>
        </section>
      </main>
    </div>
  );
}
