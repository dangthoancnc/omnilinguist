// v9.1.44-1
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { spawn } from 'child_process';
import path from 'path';

let pythonProcess = null;

const mediaStudioPlugin = () => ({
  name: 'media-studio-plugin',
  configureServer(server) {
    server.middlewares.use((req, res, next) => {
      if (req.url === '/api/system/status-engine') {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ running: pythonProcess !== null && !pythonProcess.killed }));
        return;
      }
      
      if (req.url === '/api/system/start-engine') {
        if (!pythonProcess || pythonProcess.killed) {
          console.log('Starting Omni Media Engine...');
          const rootDir = __dirname;
          const batFile = path.join(rootDir, 'start-media-engine.bat');
          
          pythonProcess = spawn('cmd.exe', ['/c', batFile], {
            cwd: rootDir,
            env: { ...process.env }
          });
          
          pythonProcess.stdout.on('data', (data) => {
            console.log(`[MediaStudio]: ${data}`);
          });

          pythonProcess.stderr.on('data', (data) => {
            console.error(`[MediaStudio ERR]: ${data}`);
          });

          pythonProcess.on('exit', (code) => {
            console.log(`Media Studio exited with code ${code}.`);
            pythonProcess = null;
          });
          
          pythonProcess.on('error', (err) => {
            console.error('Failed to start Media Studio:', err);
            pythonProcess = null;
          });
        }
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ success: true }));
        return;
      }
      
      if (req.url === '/api/system/stop-engine') {
        if (pythonProcess && !pythonProcess.killed) {
          console.log('Stopping Omni Media Engine...');
          // Dừng tiến trình port 8000
          spawn('cmd.exe', ['/c', 'FOR /F "tokens=5" %a IN (\'netstat -aon ^| find ":8000" ^| find "LISTENING"\') DO taskkill /F /PID %a']);
          try {
            spawn('taskkill', ['/pid', pythonProcess.pid, '/f', '/t']);
          } catch(e) {}
          pythonProcess = null;
        }
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ success: true }));
        return;
      }

      if (req.url === '/api/anki-import' && req.method === 'POST') {
        const targetDeck = req.headers['x-target-deck'] || 'shadowing';
        const fs = require('fs');
        const tempDir = path.join(__dirname, 'scripts');
        if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);
        const tempApkgPath = path.join(tempDir, 'temp_upload.apkg');
        const writeStream = fs.createWriteStream(tempApkgPath);
        
        req.pipe(writeStream);
        
        req.on('end', () => {
          console.log('Anki file uploaded. Starting extraction...', targetDeck);
          try {
            const child = spawn('node', [path.join(__dirname, 'scripts', 'extractAnki.cjs'), tempApkgPath], { cwd: __dirname });
            
            child.stdout.on('data', (d) => console.log(`[Anki]: ${d}`));
            child.stderr.on('data', (d) => console.error(`[Anki ERR]: ${d}`));
            
            child.on('close', (code) => {
              if (code === 0) {
                console.log('[Anki] Pushing to GitHub CDN...');
                const git = spawn('cmd.exe', ['/c', 'git add . && git commit -m "Auto upload media from Anki" && git push'], { cwd: path.join(__dirname, 'audio-cdn') });
                git.stdout.on('data', d => console.log(`[Git]: ${d}`));
                git.on('close', gitCode => {
                  try {
                    const jsonPath = path.join(__dirname, 'src', 'data', 'anki_extracted.json');
                    const extractedData = require('fs').readFileSync(jsonPath, 'utf8');
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({ success: gitCode === 0, message: 'Extracted and pushed to CDN', data: JSON.parse(extractedData) }));
                  } catch(e) {
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({ success: true, message: 'Extracted but failed to read json' }));
                  }
                });
              } else {
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ success: false, message: 'Extraction failed' }));
              }
            });
          } catch(e) {
            res.statusCode = 400;
            res.end(JSON.stringify({ error: e.message }));
          }
        });
        return;
      }
      
      // FIX: Tránh trình duyệt tự giải nén file từ điển của Kuromoji
      if (req.url.startsWith('/dict/') && req.url.endsWith('.gz')) {
        res.setHeader('Content-Type', 'application/octet-stream');
        res.removeHeader('Content-Encoding'); // Bắt buộc xóa header này
      }
      
      next();
    });
  }
});

export default defineConfig({
  plugins: [
    react(),
    mediaStudioPlugin(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'robots.txt', 'apple-touch-icon.png'],
      manifest: {
        name: 'OmniLinguist Offline App',
        short_name: 'OmniLinguist',
        description: 'Complete Language Learning System for Professionals',
        theme_color: '#0f172a',
        background_color: '#0f172a',
        display: 'standalone',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json}'],
        maximumFileSizeToCacheInBytes: 15 * 1024 * 1024
      }
    })
  ],
  resolve: {
    alias: {
      path: 'path-browserify'
    }
  },
  define: {
    global: 'window',
  },
  server: {
    watch: {
      ignored: ['**/omni-media-engine/**']
    }
  },
  optimizeDeps: {
    entries: ['index.html', 'src/**/*.{js,jsx,ts,tsx}']
  }
});
