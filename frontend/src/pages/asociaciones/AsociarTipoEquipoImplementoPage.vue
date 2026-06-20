<template>
  <AsociacionPage
    title="Asociar Tipo Equipo Implemento"
    icon="handyman"
    endpoint="mye-implementos"
    :field1="{ key: 'codigo_tipo_equipo', label: 'Tipo de Equipo', optionsEndpoint: 'tipo-equipo', displayKey: 'nombre_tipo_equipo' }"
    :field2="{ key: 'codigo_implemento', label: 'Implemento', optionsEndpoint: 'implementos', displayKey: 'nombre_implemento' }"
  />
</template>

<script setup lang="ts">
import AsociacionPage from 'src/components/AsociacionPage.vue'
</script>
