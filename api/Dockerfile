FROM node:22-alpine

WORKDIR /app

# Copier uniquement les fichiers nécessaires à l'API
COPY package*.json ./

# Installer uniquement les dépendances de production
RUN npm ci --omit=dev

# Copier le code de l'API
COPY api/ ./api/

EXPOSE 3001

# Healthcheck Docker natif
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:3001/health || exit 1

CMD ["node", "api/server.js"]
