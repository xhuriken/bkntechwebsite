import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import fs from 'fs'
import path from 'path'

// Charger manuellement les variables .env dans process.env pour le serveur de dev local
try {
  const envPath = path.resolve(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf8');
    envConfig.split(/\r?\n/).forEach(line => {
      const parts = line.split('=');
      if (parts.length >= 2) {
        const key = parts[0].trim();
        const value = parts.slice(1).join('=').trim().replace(/^['"]|['"]$/g, '');
        if (key && !key.startsWith('#')) {
          process.env[key] = value;
        }
      }
    });
  }
} catch (e) {
  console.error("Impossible de charger le fichier .env dans vite.config.js :", e);
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    {
      name: 'api-contact-middleware',
      configureServer(server) {
        server.middlewares.use(async (req, res, next) => {
          const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
          const pathname = parsedUrl.pathname;

          // 1. Contact Form API Interception
          if (pathname === '/api/contact' && req.method === 'POST') {
            try {
              let body = '';
              req.on('data', chunk => {
                body += chunk;
              });
              req.on('end', async () => {
                try {
                  const parsedBody = JSON.parse(body);
                  
                  // Mock req & res for local Vercel handler
                  const mockReq = {
                    method: 'POST',
                    body: parsedBody
                  };
                  
                  const mockRes = {
                    status(code) {
                      res.statusCode = code;
                      return this;
                    },
                    json(data) {
                      res.setHeader('Content-Type', 'application/json');
                      res.end(JSON.stringify(data));
                      return this;
                    }
                  };

                  const { default: handler } = await import('./api/contact.js');
                  await handler(mockReq, mockRes);
                } catch (err) {
                  console.error("Erreur d'exécution de l'API locale contact :", err);
                  res.statusCode = 500;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ error: err.message }));
                }
              });
            } catch (err) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: err.message }));
            }
          } 
          // 2. Portfolio Blog API Interception (GET, POST, DELETE)
          else if (pathname.startsWith('/api/posts')) {
            try {
              let body = '';
              req.on('data', chunk => {
                body += chunk;
              });
              req.on('end', async () => {
                try {
                  const parsedBody = body ? JSON.parse(body) : {};
                  
                  // Mock req & res for local Vercel handler
                  const mockReq = {
                    method: req.method,
                    url: req.url,
                    headers: req.headers,
                    query: Object.fromEntries(parsedUrl.searchParams),
                    body: parsedBody
                  };
                  
                  const mockRes = {
                    status(code) {
                      res.statusCode = code;
                      return this;
                    },
                    json(data) {
                      res.setHeader('Content-Type', 'application/json');
                      res.end(JSON.stringify(data));
                      return this;
                    },
                    setHeader(name, value) {
                      res.setHeader(name, value);
                      return this;
                    },
                    send(data) {
                      res.end(data);
                      return this;
                    },
                    end(data) {
                      res.end(data);
                      return this;
                    }
                  };

                  // Dynamically import posts.js API route handler
                  const { default: handler } = await import('./api/posts.js');
                  await handler(mockReq, mockRes);
                } catch (err) {
                  console.error("Erreur d'exécution de l'API locale posts :", err);
                  res.statusCode = 500;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ error: err.message }));
                }
              });
            } catch (err) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: err.message }));
            }
          } 
          // 3. Static files & assets pass-through
          else {
            next();
          }
        });
      }
    }
  ],
})
