# Checklist de Seguridad — Revisión de Pull Request

Marcar cada ítem antes de aprobar un PR que afecte a código de la aplicación.

## Código

- [ ] No hay credenciales, tokens ni claves hardcodeadas
- [ ] Todas las entradas del usuario son validadas y saneadas
- [ ] Todas las consultas SQL usan parámetros enlazados
- [ ] No se registran datos sensibles en logs
- [ ] Los mensajes de error no exponen información interna del sistema
- [ ] No se usa `eval()` ni funciones equivalentes con datos del usuario

## Dependencias

- [ ] `npm audit --audit-level=high` no reporta vulnerabilidades de nivel alto o crítico
- [ ] Las nuevas dependencias están justificadas y son de fuentes confiables
- [ ] No se añaden dependencias de producción innecesarias

## Docker

- [ ] La imagen base es oficial y está actualizada
- [ ] El proceso corre como usuario no privilegiado (no `root`)
- [ ] El Dockerfile usa multi-stage build
- [ ] No hay secretos en el `Dockerfile` ni en `docker-compose.yml`
- [ ] El `HEALTHCHECK` está configurado

## Configuración

- [ ] Las variables de entorno sensibles están documentadas en `.env.example`
- [ ] El archivo `.gitignore` excluye `.env` y archivos de datos

## Pruebas

- [ ] Existen pruebas para los casos de entrada inválida o maliciosa
- [ ] El pipeline de CI pasa sin errores de seguridad
