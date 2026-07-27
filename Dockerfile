# ─── Stage 1 : Build Vite ────────────────────────────────────────────────────
FROM node:22-alpine AS builder

WORKDIR /app

# Copier les manifests en premier pour bénéficier du cache Docker
COPY package*.json ./
RUN npm ci

# Copier le reste du code source
COPY . .

# Lancer le build de production
RUN npm run build

# ─── Stage 2 : Nginx pour servir le dist/ ─────────────────────────────────────
FROM nginx:1.27-alpine AS runner

# Copier la config Nginx personnalisée
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copier le build Vite depuis le stage précédent
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
