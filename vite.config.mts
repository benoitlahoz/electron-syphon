import { builtinModules } from 'node:module';
import path from 'node:path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    emptyOutDir: false,
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      fileName: 'electron-syphon',
      formats: ['es', 'cjs'],
    },
    minify: 'terser',
    rollupOptions: {
      external: ['electron', 'node-syphon', ...builtinModules],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  optimizeDeps: {
    exclude: ['events'],
  },
  plugins: [dts()],
});
