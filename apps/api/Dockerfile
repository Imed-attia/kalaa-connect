# ==============================================================
# Kalaa Connect — Dockerfile multi-étapes pour l'API NestJS
# Image ultra-légère (Alpine), sécurisée avec utilisateur non-root
# Optimisée pour Google Cloud Run (Palier Gratuit)
# ==============================================================

# Étape 1 : Dépendances et compilation
FROM node:20-alpine AS builder

WORKDIR /app

# Copie des fichiers de configuration du monorepo
COPY package*.json ./
COPY tsconfig.base.json ./
COPY packages/shared/package*.json ./packages/shared/
COPY packages/shared/tsconfig.json ./packages/shared/
COPY packages/shared/src ./packages/shared/src

COPY apps/api/package*.json ./apps/api/
COPY apps/api/tsconfig*.json ./apps/api/
COPY apps/api/src ./apps/api/src

# Installation des dépendances et compilation
RUN npm ci --workspace=packages/shared --workspace=apps/api
RUN npm run build --workspace=packages/shared
RUN npm run build --workspace=apps/api

# Étape 2 : Image d'exécution de production
FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=8080

# Création d'un utilisateur non-root pour des raisons de sécurité
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

# Copie des modules de production et des binaires compilés
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/shared ./packages/shared
COPY --from=builder /app/apps/api/package*.json ./apps/api/
COPY --from=builder /app/apps/api/dist ./apps/api/dist

# Attribution des droits à l'utilisateur non-root
RUN chown -R nestjs:nodejs /app
USER nestjs

EXPOSE 8080

# Commande de démarrage Cloud Run
CMD ["node", "apps/api/dist/apps/api/src/main.js"]
