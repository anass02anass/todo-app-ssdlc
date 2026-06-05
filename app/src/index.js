'use strict';

const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const { initDb } = require('./db/database');
const todosRouter = require('./routes/todos');

const app = express();
const PORT = process.env.PORT || 3000;

// ── Seguridad: Cabeceras HTTP con Helmet ──────────────────────────────────────
app.use(helmet());

// ── Seguridad: Limitación de tasa de peticiones ───────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100,                  // máximo 100 peticiones por ventana por IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiadas peticiones. Inténtalo de nuevo más tarde.' },
});
app.use(limiter);

// ── Parsers ───────────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10kb' })); // Limitar tamaño del body
app.use(express.urlencoded({ extended: false }));

// ── Archivos estáticos ────────────────────────────────────────────────────────
app.use(express.static(path.join(__dirname, '..', 'public')));

// ── Rutas de la aplicación ────────────────────────────────────────────────────
app.use('/api/todos', todosRouter);

// ── Health check (para Docker HEALTHCHECK) ───────────────────────────────────
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

// ── Manejo de errores global (no exponer stack traces en producción) ──────────
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  const isProd = process.env.NODE_ENV === 'production';
  if (!isProd) console.error(err.stack);
  res.status(err.status || 500).json({
    error: isProd ? 'Error interno del servidor' : err.message,
  });
});

// ── Inicializar base de datos y arrancar servidor ─────────────────────────────
initDb(() => {
  app.listen(PORT, () => {
    console.log(`Servidor iniciado en http://localhost:${PORT}`);
  });
});

module.exports = app; // Exportar para tests
