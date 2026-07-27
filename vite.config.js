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
          // Intercepter l'appel API du formulaire de contact localement
          if (req.url === '/api/contact' && req.method === 'POST') {
            try {
              let body = '';
              req.on('data', chunk => {
                body += chunk;
              });
              req.on('end', async () => {
                try {
                  const parsedBody = JSON.parse(body);
                  
                  // Mocker req et res pour le handler Vercel
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

                  // Importer dynamiquement le handler d'envoi de mail
                  const { default: handler } = await import('./api/contact.js');
                  await handler(mockReq, mockRes);
                } catch (err) {
                  console.error("Erreur d'exécution de l'API locale :", err);
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
          } else {
            next();
          }
        });
      }
    }
  ],
})
