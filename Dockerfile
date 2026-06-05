# =============================================================
# Multi-stage build — Seguridad: la imagen final no contiene
# herramientas de desarrollo ni archivos innecesarios
# =============================================================

# ---- Etapa 1: Construcción ----
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar solo los manifiestos primero (mejor uso de caché)
COPY app/package*.json ./

# Instalar TODAS las dependencias (incluidas las de dev para tests/lint)
RUN npm install

# Copiar el resto del código fuente
COPY app/ .

# ---- Etapa 2: Producción ----
FROM node:20-alpine AS production

# Crear usuario no privilegiado (mínimo privilegio)
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

# Copiar solo dependencias de producción desde la etapa anterior
COPY --from=builder /app/package*.json ./
RUN npm install --omit=dev && npm cache clean --force
# Copiar el código fuente
COPY --from=builder /app/src ./src
COPY --from=builder /app/public ./public

# Crear directorio de datos y asignar permisos al usuario no privilegiado
RUN mkdir -p /app/data && chown -R appuser:appgroup /app/data

# Cambiar al usuario no privilegiado
USER appuser

# Exponer solo el puerto necesario
EXPOSE 3000

# Verificación de salud del contenedor
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:3000/health || exit 1

CMD ["node", "src/index.js"]
