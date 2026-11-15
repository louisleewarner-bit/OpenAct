import { defineConfig } from 'vitest/config';

// Tests read packages from source through the "@openact/source" export condition, so nothing needs building first.
export default defineConfig({
  resolve: { conditions: ['@openact/source'] },
  ssr: { resolve: { conditions: ['@openact/source'] } },
  test: {
    include: ['packages/*/src/**/*.test.ts', 'apps/*/src/**/*.test.{ts,tsx}'],
  },
});
