import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

/**
 * 환경변수 검증 및 타입 정의
 *
 * t3-env는 Zod를 사용해 앱 시작 시 환경변수를 자동으로 검증합니다.
 * 누락되거나 잘못된 형식의 환경변수가 있으면 즉시 에러를 발생시킵니다.
 */
export const env = createEnv({
  /**
   * server: 서버에서만 접근 가능한 환경변수
   * 클라이언트 번들에 포함되지 않음 (보안)
   */
  server: {
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),

    // Phase 2: 데이터베이스
    // Supabase URL이 쿼리 파라미터를 포함하므로 .url() 대신 .string() 사용
    DATABASE_URL: z.string().min(1),
    DIRECT_URL: z.string().min(1),

    // Phase 2: 인증
    AUTH_SECRET: z.string().min(32),
  },

  /**
   * client: 클라이언트에서 접근 가능한 환경변수
   * 반드시 NEXT_PUBLIC_ 접두사가 필요 (Next.js 규칙)
   * 클라이언트 번들에 포함되므로 민감한 정보는 금지!
   */
  client: {
    NEXT_PUBLIC_APP_URL: z.string().url().optional(),
  },

  /**
   * runtimeEnv: 실제 환경변수 값을 매핑
   * process.env에서 값을 가져와 위의 스키마로 검증
   */
  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    DATABASE_URL: process.env.DATABASE_URL,
    DIRECT_URL: process.env.DIRECT_URL,
    AUTH_SECRET: process.env.AUTH_SECRET,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  },

  /**
   * skipValidation: true이면 검증 스킵 (개발 속도 향상, 프로덕션에서는 false)
   * process.env.SKIP_ENV_VALIDATION가 true인 경우 (또는 빌드 시간 확보 필요 시)
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,

  /**
   * emptyStringAsUndefined: true이면 빈 문자열을 undefined로 처리
   * .optional()과 함께 사용하면 빈 문자열을 설정하지 않은 것처럼 처리
   */
  emptyStringAsUndefined: true,
});
