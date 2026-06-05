'use strict';

const request = require('supertest');
const app = require('../../app/src/index');

describe('API /api/todos — Pruebas de seguridad y funcionalidad', () => {

  // ── Pruebas funcionales básicas ─────────────────────────────────────────────
  describe('POST /api/todos', () => {
    it('crea una tarea con nombre válido', async () => {
      const res = await request(app)
        .post('/api/todos')
        .send({ name: 'Comprar leche' });
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body.name).toBe('Comprar leche');
    });

    // ── Pruebas de seguridad: validación de entrada ─────────────────────────
    it('rechaza nombre vacío (RQ-SEC-07)', async () => {
      const res = await request(app)
        .post('/api/todos')
        .send({ name: '' });
      expect(res.status).toBe(400);
    });

    it('rechaza nombre mayor a 255 caracteres (RQ-SEC-07)', async () => {
      const res = await request(app)
        .post('/api/todos')
        .send({ name: 'a'.repeat(256) });
      expect(res.status).toBe(400);
    });

    it('sanea intentos de XSS en el nombre (RQ-SEC-07)', async () => {
      const res = await request(app)
        .post('/api/todos')
        .send({ name: '<script>alert("xss")</script>' });
      // La entrada se escapa, no se ejecuta como HTML
      expect(res.status).toBe(201);
      expect(res.body.name).not.toContain('<script>');
    });

    it('rechaza body sin campo name', async () => {
      const res = await request(app)
        .post('/api/todos')
        .send({});
      expect(res.status).toBe(400);
    });
  });

  describe('DELETE /api/todos/:id', () => {
    it('rechaza ID no numérico (RQ-SEC-07)', async () => {
      const res = await request(app).delete('/api/todos/abc');
      expect(res.status).toBe(400);
    });

    it('rechaza ID negativo (RQ-SEC-07)', async () => {
      const res = await request(app).delete('/api/todos/-1');
      expect(res.status).toBe(400);
    });

    it('devuelve 404 para tarea inexistente', async () => {
      const res = await request(app).delete('/api/todos/99999');
      expect(res.status).toBe(404);
    });
  });

  // ── Prueba de cabeceras de seguridad ────────────────────────────────────────
  describe('Cabeceras HTTP (RQ-SEC-14, RQ-SEC-15)', () => {
    it('incluye cabecera X-Content-Type-Options', async () => {
      const res = await request(app).get('/health');
      expect(res.headers['x-content-type-options']).toBe('nosniff');
    });

    it('no expone X-Powered-By', async () => {
      const res = await request(app).get('/health');
      expect(res.headers['x-powered-by']).toBeUndefined();
    });
  });

  // ── Health check ────────────────────────────────────────────────────────────
  describe('GET /health', () => {
    it('devuelve 200 con status ok', async () => {
      const res = await request(app).get('/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('ok');
    });
  });
});
