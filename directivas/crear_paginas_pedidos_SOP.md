# SOP: Completado de Páginas de Pedidos Faltantes

Este SOP documenta el procedimiento para completar las páginas de listado de pedidos que faltan en el sistema, asegurando la réplica exacta de los diseños del frontend y del backend.

## Objetivo
Agregar todas las páginas del menú de "Pedidos" que no están presentes en el frontend y habilitar sus respectivos endpoints en el backend.

## Procedimiento

### Paso 1: Investigación e Inspección de la Base de Datos
1. Ejecutar un script para conectarse a la base de datos PostgreSQL y obtener la estructura y registros de las tablas/vistas asociadas a pedidos, áreas, especiales, etc.
2. Identificar qué tablas y vistas se relacionan con Pedidos Especiales y cómo se diferencian de los Pedidos de Personal estándar en términos de áreas y estados.

### Paso 2: Creación de Endpoints en Backend (NestJS)
1. En `pedidos.controller.ts`, registrar el método `@Get('especiales-areas')`.
2. En `pedidos.service.ts`, crear el método `findEspecialesAreas()`.
3. El query SQL debe retornar la lista de pedidos especiales asociados a áreas/estados con columnas como `id_pedido`, `nit`, `nombre`, `fecha_pedido`, `personas_esp`, `dias_esp`, `usuario`, `valor_servicio` (acumulado o por ítem), `estado` y `area_responsable`.

### Paso 3: Creación de Vistas en Frontend (Quasar)
1. Crear el componente Vue para `PedidosEspecialesAreasPage.vue`.
2. Asegurar que replique exactamente los estilos premium de las páginas existentes (gradiente de encabezado verde oscuro `#1B5E20` a `#388E3C`, botones con bordes redondeados, filtros rápidos de búsqueda, estado de carga, y tablas compactas).
3. Añadir la ruta correspondiente en `routes.ts`.
4. Incluir el elemento en el array `pedidosMenu` en `MainLayout.vue`.

### Restricciones y Advertencias conocidas
- **Consultas con LIMIT**: Mantener el límite de `LIMIT 1000` o `LIMIT 2000` en las consultas de backend para evitar degradación de rendimiento.
- **Filtros del Frontend**: Todos los listados deben tener filtros rápidos de texto y filtros específicos por columnas clave.
- **Estética premium**: No usar estilos crudos o layouts simples; reutilizar las clases Scss del proyecto como `.page-header` y `.pedidos-personal-table`.
