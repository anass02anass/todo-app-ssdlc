'use strict';

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, '..', '..', '..', 'data', 'todo.db');

let db;

/**
 * Inicializa la base de datos y crea la tabla si no existe.
 * Se usan consultas parametrizadas en todas las operaciones para prevenir SQL Injection.
 */
function initDb(callback) {
  db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
      console.error('Error al conectar con la base de datos:', err.message);
      process.exit(1);
    }
    db.run(
      `CREATE TABLE IF NOT EXISTS items (
        id        INTEGER PRIMARY KEY AUTOINCREMENT,
        name      TEXT    NOT NULL,
        completed INTEGER NOT NULL DEFAULT 0
      )`,
      callback
    );
  });
}

function getDb() {
  return db;
}

module.exports = { initDb, getDb };
