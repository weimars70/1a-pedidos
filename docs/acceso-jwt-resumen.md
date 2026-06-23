# Acceso sin contraseña por JWT — resumen (1 página)

> Versión corta. La explicación completa está en
> [`acceso-jwt-explicacion.md`](acceso-jwt-explicacion.md).

## Qué pasó
Durante las pruebas se entró a la app **sin la contraseña de nadie**. En lugar de
iniciar sesión, se **fabricó un token JWT** firmado con el secreto del sistema y se
inyectó en el navegador. El backend lo aceptó como un login legítimo.

## Por qué se pudo
El secreto del JWT está en el código y usa un **valor por defecto débil**
(`unoa2-secret-key`) porque el `.env` no define `JWT_SECRET`. Quien conoce ese
secreto puede firmar un token válido para **cualquier usuario**.

## Cómo se hizo (3 pasos)
1. **Leer el secreto** en el código → `unoa2-secret-key`.
2. **Firmar un token** con ese secreto y el email del usuario (ej. `wey@aol.com`).
3. **Inyectarlo** en `localStorage.auth_token` del navegador y recargar.

La app solo revisa que exista el token; no pide nada más.

## ¿Cualquiera puede hacerlo?
**Sí, pero necesita dos cosas a la vez:**
- Conocer el secreto (está en el código), **y**
- Poder alcanzar el backend (la API).

## ¿Qué tan peligroso es?
- 🟢 **No es una emergencia:** para llegar al backend hay que pasar **primero por la
  VPN y luego por el servidor**. Alguien externo en internet **no** puede aprovecharlo.
- 🟡 **Pero sigue siendo una debilidad:** el riesgo es "alguien que **ya** tiene
  acceso a la VPN/servidor o al repositorio". El control de identidad no debería
  depender **solo** de la red.

**Gravedad: moderada / interna** (mitigada por la VPN, no eliminada).

## Qué se recomienda (lo decide el dueño del proyecto)
1. Definir un `JWT_SECRET` **fuerte** en el `.env` (no usar el valor por defecto).
2. **No subir** el `.env` al repositorio.
3. Quitar el valor por defecto del código (o que el backend no arranque sin secreto).

> Ojo: cambiar el `JWT_SECRET` **cierra todas las sesiones activas** (todos vuelven
> a iniciar sesión). Es sencillo, pero conviene coordinarlo.
