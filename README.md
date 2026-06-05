# Todo App — S-SDLC

Aplicación de lista de tareas contenerizada con Docker, desarrollada siguiendo el Ciclo de Vida de Desarrollo de Software Seguro (S-SDLC).

---

## 1. Definición y ejecución

**Todo App** es una aplicación web CRUD para gestionar tareas, basada en el tutorial oficial de Docker. Usa Node.js + Express, SQLite y un frontend HTML vanilla, todo dentro de un contenedor Docker.

### Cómo ejecutarla

```bash
git clone https://github.com/<usuario>/todo-app-ssdlc.git
cd todo-app-ssdlc
copy .env.example .env
docker compose up --build
```

Abrir en el navegador: `http://localhost:3000`

Para detenerla: `docker compose down`

---

## 2. Consideraciones de seguridad en el diseño

- **Contenedor:** usuario no root (`node`), sistema de archivos de solo lectura, `no-new-privileges`
- **Imagen Docker:** multi-stage build — la imagen final no contiene herramientas de desarrollo
- **Secretos:** variables de entorno via `.env` (excluido de git); ningún secreto en el código
- **HTTP:** cabeceras de seguridad con `helmet.js` (CSP, X-Frame-Options, HSTS…)
- **Entradas:** validación y saneamiento con `express-validator`; consultas SQL parametrizadas
- **Disponibilidad:** rate limiting: 100 peticiones / 15 min por IP
- **Dependencias:** `npm audit` en el pipeline de CI para detectar CVEs
- **Amenazas:** modelado STRIDE documentado en `security/threat-model.md`

---

## 3. Paso a paso — S-SDLC

### Fase 1 — Planificación
Identificar activos a proteger (datos de tareas, configuración), definir tolerancia al riesgo y establecer requisitos de seguridad antes de escribir código. Ver `security/security-requirements.md`.

### Fase 2 — Requisitos
Traducir objetivos de seguridad en requisitos verificables: gestión de secretos, cifrado en tránsito, logging, política de dependencias. Ejemplo: *RQ-SEC-01: ninguna credencial hardcodeada en el código o en la imagen Docker.*

### Fase 3 — Diseño
Modelado de amenazas con STRIDE (ver `security/threat-model.md`). Decisiones de arquitectura: multi-stage build, usuario sin privilegios, volumen dedicado para la base de datos.

### Fase 4 — Implementación
Código con consultas parametrizadas, validación de entradas y cabeceras HTTP seguras. Revisión de cada PR con el checklist de `security/security-checklist.md`. SAST con ESLint + `eslint-plugin-security`.

### Fase 5 — Pruebas
Pruebas unitarias con casos de seguridad (XSS, SQL Injection, IDs inválidos) en `tests/unit/todos.test.js`. SAST con `npm audit`. Análisis de imagen con Trivy. DAST con OWASP ZAP Baseline Scan.

### Fase 6 — Despliegue y mantenimiento
Secretos inyectados en tiempo de ejecución (no en la imagen). `NODE_ENV=production` activo. `npm audit` semanal automatizado. Repetir el modelado de amenazas ante cambios significativos.
