# Requisitos de Seguridad — Todo App

**Versión:** 1.0  
**Fecha:** 2026-06-04  

---

## Requisitos de gestión de secretos

| ID | Requisito | Prioridad |
|---|---|---|
| RQ-SEC-01 | Ninguna credencial o secreto debe estar hardcodeado en el código fuente | Crítica |
| RQ-SEC-02 | Las variables sensibles deben gestionarse mediante variables de entorno | Crítica |
| RQ-SEC-03 | El archivo `.env` debe estar excluido del control de versiones | Crítica |
| RQ-SEC-04 | El `SESSION_SECRET` debe tener al menos 64 bytes aleatorios | Alta |

## Requisitos de comunicación segura

| ID | Requisito | Prioridad |
|---|---|---|
| RQ-SEC-05 | En producción, todo el tráfico debe ir sobre HTTPS (TLS 1.2+) | Crítica |
| RQ-SEC-06 | Las cookies deben tener los atributos `httpOnly`, `Secure` y `SameSite=Strict` | Alta |

## Requisitos de validación de entradas

| ID | Requisito | Prioridad |
|---|---|---|
| RQ-SEC-07 | Toda entrada del usuario debe ser validada antes de procesarse | Crítica |
| RQ-SEC-08 | Todas las consultas SQL deben usar parámetros enlazados (no concatenación) | Crítica |
| RQ-SEC-09 | El tamaño máximo del body de las peticiones HTTP debe estar limitado | Media |

## Requisitos de hardening de contenedor

| ID | Requisito | Prioridad |
|---|---|---|
| RQ-SEC-10 | El contenedor no debe ejecutarse como usuario root | Crítica |
| RQ-SEC-11 | La opción `no-new-privileges` debe estar activa | Alta |
| RQ-SEC-12 | El sistema de archivos del contenedor debe ser de solo lectura salvo el volumen de datos | Alta |
| RQ-SEC-13 | La imagen base debe ser oficial y mínima (alpine) | Media |

## Requisitos de cabeceras HTTP

| ID | Requisito | Prioridad |
|---|---|---|
| RQ-SEC-14 | La cabecera `X-Powered-By` debe estar eliminada | Media |
| RQ-SEC-15 | Se deben configurar `Content-Security-Policy`, `X-Frame-Options` y `X-Content-Type-Options` | Alta |

## Requisitos de disponibilidad

| ID | Requisito | Prioridad |
|---|---|---|
| RQ-SEC-16 | Debe existir un mecanismo de limitación de tasa de peticiones por IP | Alta |
| RQ-SEC-17 | El contenedor debe tener un HEALTHCHECK configurado | Media |

## Requisitos de pipeline de seguridad

| ID | Requisito | Prioridad |
|---|---|---|
| RQ-SEC-18 | El pipeline de CI debe incluir análisis SAST (`npm audit` + ESLint security) | Alta |
| RQ-SEC-19 | El pipeline de CI debe incluir análisis de vulnerabilidades en la imagen Docker (Trivy) | Alta |
| RQ-SEC-20 | El pipeline de CI debe incluir un escaneo DAST básico (OWASP ZAP Baseline) | Media |
