'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

// Zod 스키마 정의: 폼에 입력되는 데이터의 형태와 검증 규칙을 정의
const formSchema = z.object({
  username: z
    .string()
    .min(2, { message: '사용자명은 최소 2자 이상이어야 합니다.' })
    .max(50, { message: '사용자명은 최대 50자 이하여야 합니다.' }),
  email: z.string().email({ message: '유효한 이메일 주소를 입력하세요.' }),
  password: z
    .string()
    .min(8, { message: '비밀번호는 최소 8자 이상이어야 합니다.' })
    .regex(/[A-Z]/, {
      message: '비밀번호는 최소 1개의 대문자를 포함해야 합니다.',
    })
    .regex(/[0-9]/, {
      message: '비밀번호는 최소 1개의 숫자를 포함해야 합니다.',
    }),
});

// TypeScript 타입 자동 생성 (Zod 스키마로부터)
type FormValues = z.infer<typeof formSchema>;

export function DemoForm() {
  // React Hook Form 초기화
  // resolver: Zod 스키마를 이용해 자동으로 검증
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
    },
  });

  // 폼 제출 핸들러
  function onSubmit(values: FormValues) {
    console.log('제출된 값:', values);
    // 여기서 서버에 데이터 전송 (API 호출)
    alert(`환영합니다, ${values.username}님!`);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* 사용자명 필드 */}
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>사용자명</FormLabel>
              <FormControl>
                <Input placeholder="john_doe" {...field} />
              </FormControl>
              <FormDescription>2자 이상 50자 이하의 사용자명을 입력하세요.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 이메일 필드 */}
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>이메일</FormLabel>
              <FormControl>
                <Input type="email" placeholder="john@example.com" {...field} />
              </FormControl>
              <FormDescription>유효한 이메일 주소를 입력하세요.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 비밀번호 필드 */}
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>비밀번호</FormLabel>
              <FormControl>
                <Input type="password" placeholder="••••••••" {...field} />
              </FormControl>
              <FormDescription>8자 이상, 대문자 1개, 숫자 1개 포함</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full">
          회원가입
        </Button>
      </form>
    </Form>
  );
}
