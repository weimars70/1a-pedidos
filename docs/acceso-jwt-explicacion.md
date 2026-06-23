# Cómo se accedió al sistema sin contraseña (firmando un JWT) — explicación

> Documento informativo. **No** se cambió ninguna configuración del proyecto.
> Su objetivo es explicar, paso a paso, cómo se entró a la aplicación durante las
> pruebas sin usar la contraseña de ningún usuario, y evaluar qué tan riesgoso es.

---

## Resumen en una frase

No se usó la contraseña de nadie. Se **fabricó (firmó) un token JWT** con el
secreto del propio sistema y se inyectó en el navegador; el backend lo aceptó
como si fuera un login legítimo.

---

## Conceptos previos (rápido)

- **JWT (JSON Web Token):** es el "carnet" que el backend le entrega al usuario
  cuando inicia sesión. El navegador lo guarda y lo manda en cada petición.
- El backend **no guarda** los tokens; solo verifica que estén **firmados con su
  secreto**. Si la firma es válida, confía en el contenido del token (por ejemplo,
  "soy wey@aol.com").
- Por eso, **quien conozca el secreto puede crear un carnet válido para cualquier
  usuario**, sin necesidad de su contraseña.

---

## Dónde está el problema en este proyecto

El secreto del JWT está **escrito en el código** y, además, tiene un **valor por
defecto débil** que se usa cuando no hay variable de entorno:

- `backend/src/auth/strategies/jwt.strategy.ts`
- `backend/src/auth/auth.module.ts`

Ambos hacen, en esencia:

```ts
secret: config.get<string>('JWT_SECRET', 'unoa2-secret-key')
```

Como el archivo `backend/.env` **no define `JWT_SECRET`**, el sistema usa el valor
por defecto: **`unoa2-secret-key`**. Ese valor es conocido por cualquiera que pueda
leer el código.

---

## Paso a paso de lo que se hizo

### Paso 1 — Obtener el secreto
Leer el código y ver que el secreto efectivo es `unoa2-secret-key` (porque no hay
`JWT_SECRET` en el `.env`).

### Paso 2 — Firmar un token con ese secreto
Con el mismo formato (`payload`) que produce el login real
(`backend/src/auth/auth.service.ts`):

```js
const jwt = require('jsonwebtoken');
const token = jwt.sign(
  { sub: 'wey@aol.com', usuario: 'wey@aol.com', empresaId: 1 },
  'unoa2-secret-key',
  { expiresIn: '2h' }
);
console.log(token);
```

El backend, al recibir ese token, verifica la firma con `unoa2-secret-key`,
ve que coincide y **lo da por válido**. El campo `usuario` (el email) es lo que el
backend usa para resolver el `usuarios.id`; por eso las acciones quedaron
registradas como "Wey Sanchez".

### Paso 3 — Inyectar el token en el navegador
La app solo revisa que exista `auth_token` en `localStorage`:

- `frontend/src/router/index.ts` (el guard de rutas) deja pasar si hay token.
- `frontend/src/boot/axios.ts` toma el token de `localStorage` y lo manda en cada
  petición.

Entonces, desde la consola del navegador:

```js
localStorage.setItem('auth_token', '<el token firmado>');
localStorage.setItem('auth_user', JSON.stringify({
  id: 'wey@aol.com', usuario: 'wey@aol.com', name: 'Wey Sanchez', empresaId: 1
}));
location.reload();
```

Tras recargar, la aplicación se comporta como si "Wey" hubiera iniciado sesión,
**sin pasar por la pantalla de login**.

---

## Respuestas a tus preguntas

### ¿Cualquiera lo puede hacer si sabe el JWT (el secreto)?
**Sí.** Cualquiera que cumpla **dos condiciones a la vez**:
1. **Conoce el secreto** (`unoa2-secret-key`, visible en el código), y
2. **Puede alcanzar el backend** (la API en el servidor).

…puede fabricar un token válido para **cualquier usuario** y entrar sin contraseña.
No necesita contraseñas ni "romper" nada: solo firmar un token con el secreto.

### ¿Es peligroso?
Es una **debilidad real**, pero su gravedad depende de **quién puede llegar al
backend**. Aquí entra tu contexto:

- Para usar el sistema **primero hay que estar en la VPN y luego en el servidor**.
  Esa es una **barrera exterior fuerte**: alguien totalmente externo (en internet)
  **no** puede aprovechar esto, porque ni siquiera puede hablar con el backend.
- Por eso la severidad **baja** de "crítica" a **moderada / interna**.

Dicho de otro modo: el riesgo **no** es "cualquier persona en internet", sino
"cualquier persona que **ya tenga acceso a la VPN/servidor o al código**". Ejemplos:

- Alguien con acceso a la red interna/VPN que no debería poder suplantar usuarios.
- Un colaborador con acceso al repositorio que conoce el secreto.
- Si el secreto por defecto se mantiene en producción, deja de haber separación
  entre "leer el código" y "poder entrar como cualquiera".

### Conclusión sobre la gravedad
- **No es una emergencia** gracias a la capa de VPN + servidor.
- **Pero sigue siendo una buena práctica pendiente**: el control de acceso real no
  debería depender solo de la red. Lo ideal es que aunque alguien llegue al backend,
  **no** pueda falsificar identidades.

---

## Recomendaciones (para cuando el dueño del proyecto pueda aplicarlas)

No requieren cambios de lógica, solo de configuración:

1. **Definir un `JWT_SECRET` fuerte** en el `.env` del backend (no usar el valor por
   defecto). Por ejemplo, generado con `openssl rand -hex 32`.
2. **No subir el `.env`** al repositorio (verificar `.gitignore`).
3. **Quitar el valor por defecto débil** del código, o que el backend **no arranque**
   si `JWT_SECRET` no está definido (falla segura).
4. (Opcional) Rotar el secreto periódicamente; al rotarlo, los tokens viejos dejan
   de ser válidos.

> Importante: cambiar el `JWT_SECRET` **invalida todas las sesiones activas**
> (todos tendrían que volver a iniciar sesión). Es un cambio sencillo pero conviene
> coordinarlo con el dueño del proyecto.

---

## Nota
Esto se hizo únicamente en el entorno de **desarrollo/pruebas** y para verificar
las funcionalidades de contratos (crear, editar, anular). No se alteró ninguna
contraseña ni configuración de seguridad del proyecto.
