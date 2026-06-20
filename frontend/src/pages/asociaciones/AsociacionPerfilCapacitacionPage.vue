<template>
  <AsociacionPage
    title="Asociación Perfil Capacitación"
    icon="model_training"
    endpoint="perfiles-capacitacion"
    :field1="{ key: 'codigo_perfil', label: 'Perfil', optionsEndpoint: 'perfiles', displayKey: 'perfil' }"
    :field2="{ key: 'codigo_capacitacion', label: 'Capacitación', optionsEndpoint: 'capacitaciones', displayKey: 'capacitacion' }"
  />
</template>

<script setup lang="ts">
import AsociacionPage from 'src/components/AsociacionPage.vue'
</script>
