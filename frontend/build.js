import { build } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

async function buildApp() {
  console.log('🚀 Starting build...');
  
  try {
    await build({
      plugins: [react()],
      root: process.cwd(),
      build: {
        outDir: 'dist',
        sourcemap: false,
        rollupOptions: {
          input: {
            main: resolve(process.cwd(), 'index.html'),
          },
        },
      },
      resolve: {
        extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
      },
    });
    console.log('✅ Build complete!');
  } catch (err) {
    console.error('❌ Build failed:', err);
    process.exit(1);
  }
}

buildApp();