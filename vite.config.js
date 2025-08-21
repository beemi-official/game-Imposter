import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import fs from 'fs'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // Beemi emulator now handled by CLI
    {
      name: 'beemi-emulator-middleware',
      configureServer(server) {
        // Serve emulator preview page
        server.middlewares.use('/emulator', (req, res, next) => {
          const emulatorIndexPath = path.join(process.cwd(), 'public/emulator/index.html');
          
          if (fs.existsSync(emulatorIndexPath)) {
            const content = fs.readFileSync(emulatorIndexPath, 'utf-8');
            res.setHeader('Content-Type', 'text/html');
            res.end(content);
          } else {
            next();
          }
        });
      }
    }
  ],
  server: {
    port: 3000,
    host: true
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  },
  base: './' // Use relative paths for assets when deployed to subdirectories
}) 