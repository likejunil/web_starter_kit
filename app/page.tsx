import Image from "next/image";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-1 w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <Image
          className="dark:invert"
          src="/next.svg"
          alt="Next.js logo"
          width={100}
          height={20}
          priority
        />
        <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
          <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
            웹 스타터 킷 구축 중
          </h1>
          <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            shadcn/ui가 설치되었습니다. 아래의 버튼은 shadcn/ui Button 컴포넌트를 사용합니다.
          </p>
        </div>
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
      </main>
    </div>
  );
}
