import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import {defineConfig} from 'vite';

function copyMediaPlugin() {
  return {
    name: 'copy-media-plugin',
    closeBundle() {
      const srcDir = path.resolve(__dirname, 'media');
      const destDir = path.resolve(__dirname, 'dist/media');
      if (fs.existsSync(srcDir)) {
        if (!fs.existsSync(destDir)) {
          fs.mkdirSync(destDir, { recursive: true });
        }
        try {
          fs.cpSync(srcDir, destDir, { recursive: true });
        } catch (e) {
          console.warn('Media copy warning:', e);
        }
      }
    }
  };
}

export default defineConfig(() => {
  return {
    base: process.env.VITE_BASE_PATH || './',
    plugins: [react(), tailwindcss(), copyMediaPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
