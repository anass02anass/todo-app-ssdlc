# Modelo de Amenazas — Todo App (STRIDE)

**Versión:** 1.0  
**Fecha:** 2026-06-04  
**Autor:** Equipo de desarrollo  

---

## 1. Descripción del sistema

La aplicación es una API REST + frontend estático para gestionar listas de tareas. Corre en un único contenedor Docker con una base de datos SQLite local.

### Diagrama de flujo de datos (simplificado)

```
[Navegador] ──HTTP──> [Express App :3000] ──SQL──> [SQLite DB]
                            |
                     [Sistema de archivos]
                     [Variables de entorno]
```

### Activos a proteger

| Activo | Descripción | Clasificación |
|---|---|---|
| Lista de tareas | Datos CRUD del usuario | Confidencial |
| SESSION_SECRET | Clave de firma de cookies | Crítico |
| Base de datos SQLite | Archivo con todos los datos | Confidencial |
| Imagen Docker | Código fuente compilado | Interno |

---

## 2. Análisis STRIDE

### S — Spoofing (Suplantación de identidad)

| ID | Amenaza | Componente | Probabilidad | Impacto | Control |
|---|---|---|---|---|---|
| S-01 | Robo de cookie de sesión | Express | Media | Alto | `httpOnly`, `Secure`, `SameSite=Strict` |
| S-02 | Fuerza bruta de sesiones | Express | Baja | Alto | `SESSION_SECRET` aleatorio de 64 bytes |

### T — Tampering (Manipulación de datos)

| ID | Amenaza | Componente | Probabilidad | Impacto | Control |
|---|---|---|---|---|---|
| T-01 | Modificación de datos en tránsito | Red | Media | Alto | TLS obligatorio en producción |
| T-02 | Inyección SQL | SQLite | Alta | Crítico | Consultas parametrizadas en todas las operaciones |
| T-03 | Manipulación de IDs | API REST | Media | Medio | Validación de parámetros con `express-validator` |

### R — Repudiation (Repudio)

| ID | Amenaza | Componente | Probabilidad | Impacto | Control |
|---|---|---|---|---|---|
| R-01 | Usuario niega haber modificado una tarea | App | Baja | Bajo | Logging estructurado de operaciones con timestamp |

### I — Information Disclosure (Divulgación de información)

| ID | Amenaza | Componente | Probabilidad | Impacto | Control |
|---|---|---|---|---|---|
| I-01 | Stack trace expuesto en respuesta de error | Express | Alta (en dev) | Medio | `NODE_ENV=production` oculta detalles de error |
| I-02 | Variables de entorno en imagen Docker | Docker | Media | Crítico | `.env` excluido; variables inyectadas en tiempo de ejecución |
| I-03 | Cabeceras HTTP revelan tecnologías | Express | Alta | Bajo | `helmet()` elimina cabecera `X-Powered-By` y añade otras |

### D — Denial of Service (Denegación de servicio)

| ID | Amenaza | Componente | Probabilidad | Impacto | Control |
|---|---|---|---|---|---|
| D-01 | Flood de peticiones HTTP | Express | Media | Alto | Rate limiting: 100 req/15min por IP |
| D-02 | Body payload grande | Express | Baja | Medio | `express.json({ limit: '10kb' })` |

### E — Elevation of Privilege (Elevación de privilegios)

| ID | Amenaza | Componente | Probabilidad | Impacto | Control |
|---|---|---|---|---|---|
| E-01 | Proceso corriendo como root en contenedor | Docker | Alta (sin control) | Crítico | Usuario `node` (UID 1000) en Dockerfile |
| E-02 | Escalada de privilegios en contenedor | Docker | Baja | Crítico | `--no-new-privileges:true` en docker-compose |
| E-03 | Escritura en sistema de archivos del contenedor | Docker | Media | Medio | `read_only: true` + `tmpfs` para `/tmp` |

---

## 3. Riesgos residuales

| ID | Descripción | Justificación de aceptación |
|---|---|---|
| R-RES-01 | Sin autenticación de usuarios | Aplicación de demo/aprendizaje; fuera de scope v1 |
| R-RES-02 | Base de datos no cifrada en reposo | SQLite local; datos no sensibles en esta versión |

---

## 4. Próximos pasos recomendados

- Añadir autenticación (JWT o sesiones) en la siguiente iteración.
- Cifrar el volumen Docker que contiene la base de datos.
- Configurar un proxy inverso (nginx) con terminación TLS frente a la app.
