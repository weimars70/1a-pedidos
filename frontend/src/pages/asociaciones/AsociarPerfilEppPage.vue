<template>
  <AsociacionPage
    title="Asociar Perfil EPP"
    icon="shield"
    endpoint="perfiles-epp"
    :field1="{ key: 'id_perfil', label: 'Perfil', optionsEndpoint: 'perfiles', displayKey: 'perfil' }"
    :field2="{ key: 'id_epp', label: 'EPP / Artículo', optionsEndpoint: 'epp', displayKey: 'nombre_epp' }"
  />
</template>

<script setup lang="ts">
import AsociacionPage from 'src/components/AsociacionPage.vue'
</script>
