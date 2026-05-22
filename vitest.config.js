import { defineConfig } from 'vitest/config';
import path from 'path';  // ← добавьте импорт path

export default defineConfig({
  test: {
    include: ['src/**/*.{test,spec}.{js,ts,jsx,tsx}'],
    exclude: ['**/*.stories.{js,jsx,ts,tsx}', '**/*.mdx'],
    environment: 'jsdom',
  },
  resolve: {  // ← добавьте блок resolve
    alias: {
      '@utils': path.resolve(__dirname, './src/utils'),
      // Если у вас есть другие алиасы, добавьте их сюда
       '@components': path.resolve(__dirname, './src/components'),
       '@services': path.resolve(__dirname, './src/services'),
    },
  },
});