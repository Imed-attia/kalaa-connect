# ==============================================================
# Kalaa Connect — Dockerfile multi-étapes pour le Frontend Web (React 19 / PWA)
# Étape 1 : Construction Vite
# Étape 2 : Nginx Alpine haute performance pour SPA & PWA
# ==============================================================

FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY tsconfig.base.json ./
COPY packages/shared/package*.json ./packages/shared/
COPY packages/shared/tsconfig.json ./packages/shared/
COPY packages/shared/src ./packages/shared/src

COPY apps/web/package*.json ./apps/web/
COPY apps/web/tsconfig*.json ./apps/web/
COPY apps/web/vite.config.ts ./apps/web/
COPY apps/web/tailwind.config.js ./apps/web/
COPY apps/web/postcss.config.js ./apps/web/
COPY apps/web/index.html ./apps/web/
COPY apps/web/src ./apps/web/src
COPY apps/web/public ./apps/web/public

RUN npm ci --workspace=packages/shared --workspace=apps/web
RUN npm run build --workspace=packages/shared
RUN npm run build --workspace=apps/web

# Étape 2 : Serveur Nginx Alpine
FROM nginx:alpine AS runner

COPY --from=builder /app/apps/web/dist /usr/share/nginx/html

# Configuration Nginx pour le routage SPA (fallback index.html)
RUN echo 'server { \
    listen 80; \
    server_name localhost; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html index.htm; \
        try_files $uri $uri/ /index.html; \
    } \
    location /api/ { \
        proxy_pass http://api:3000/api/; \
        proxy_set_header Host $host; \
        proxy_set_header X-Real-IP $remote_addr; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
