# Etapa de build: instala todas las dependencias (incluidas las de build) y
# genera los assets de produccion (CSS/JS minificados).
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Etapa final: solo dependencias de produccion + artefactos ya construidos.
FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=builder /app/server ./server
COPY --from=builder /app/scripts ./scripts
COPY --from=builder /app/public ./public

EXPOSE 3000

# Aplica migraciones (idempotente) y luego arranca el servidor.
CMD ["sh", "-c", "node scripts/migrate.js up && node server/server.js"]
