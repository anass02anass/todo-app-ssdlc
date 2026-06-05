'use strict';

const express = require('express');
const { body, param, validationResult } = require('express-validator');
const { getDb } = require('../db/database');

const router = express.Router();

// ── Middleware: manejar errores de validación ─────────────────────────────────
function handleValidationErrors(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
}

// ── GET /api/todos — Listar todas las tareas ──────────────────────────────────
router.get('/', (req, res, next) => {
  getDb().all('SELECT * FROM items ORDER BY id DESC', [], (err, rows) => {
    if (err) return next(err);
    res.json(rows);
  });
});

// ── POST /api/todos — Crear una tarea ─────────────────────────────────────────
router.post(
  '/',
  [
    // Validar y sanear la entrada — previene XSS y datos inválidos
    body('name')
      .trim()
      .isLength({ min: 1, max: 255 })
      .withMessage('El nombre debe tener entre 1 y 255 caracteres')
      .escape(),
  ],
  handleValidationErrors,
  (req, res, next) => {
    const { name } = req.body;
    // Consulta parametrizada — previene SQL Injection
    getDb().run('INSERT INTO items (name) VALUES (?)', [name], function (err) {
      if (err) return next(err);
      res.status(201).json({ id: this.lastID, name, completed: 0 });
    });
  }
);

// ── PUT /api/todos/:id — Actualizar una tarea ─────────────────────────────────
router.put(
  '/:id',
  [
    param('id').isInt({ min: 1 }).withMessage('ID inválido'),
    body('completed').isBoolean().withMessage('completed debe ser booleano'),
  ],
  handleValidationErrors,
  (req, res, next) => {
    const { id } = req.params;
    const { completed } = req.body;
    getDb().run(
      'UPDATE items SET completed = ? WHERE id = ?',
      [completed ? 1 : 0, id],
      function (err) {
        if (err) return next(err);
        if (this.changes === 0) return res.status(404).json({ error: 'Tarea no encontrada' });
        res.json({ id: Number(id), completed });
      }
    );
  }
);

// ── DELETE /api/todos/:id — Eliminar una tarea ────────────────────────────────
router.delete(
  '/:id',
  [param('id').isInt({ min: 1 }).withMessage('ID inválido')],
  handleValidationErrors,
  (req, res, next) => {
    const { id } = req.params;
    getDb().run('DELETE FROM items WHERE id = ?', [id], function (err) {
      if (err) return next(err);
      if (this.changes === 0) return res.status(404).json({ error: 'Tarea no encontrada' });
      res.status(204).send();
    });
  }
);

module.exports = router;
