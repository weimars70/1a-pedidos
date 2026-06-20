<template>
  <AsociacionPage
    title="Crear Plantillas Cuadrillas Especiales"
    icon="group_work"
    endpoint="cuadrillas"
    :field1="{ key: 'codigo_cuadrilla', label: 'Cuadrilla', optionsEndpoint: 'cuadrillas', displayKey: 'nombre' }"
    :field2="{ key: 'codigo_empleado', label: 'Empleado', optionsEndpoint: 'empleados', displayKey: 'empleado' }"
  />
</template>

<script setup lang="ts">
import AsociacionPage from 'src/components/AsociacionPage.vue'
</script>
