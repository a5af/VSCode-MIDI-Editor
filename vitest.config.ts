import { defineConfig } from 'vitest/config';
import solidPlugin from 'vite-plugin-solid';

export default defineConfig({
  plugins: [solidPlugin()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/webview/test/setup.ts'],
    include: ['src/webview/**/*.test.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/webview/**/*.{ts,tsx}'],
      exclude: ['src/webview/**/*.test.{ts,tsx}', 'src/webview/test/**']
    }
  },
  resolve: {
    conditions: ['development', 'browser']
  }
});
