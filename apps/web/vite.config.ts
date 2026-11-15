import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  // Read workspace packages from source in development and in the build.
  resolve: { conditions: ['@openact/source'] },
});
