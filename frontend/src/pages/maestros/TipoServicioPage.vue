<template>
  <MaestroCrud
    title="Tipo Servicio"
    icon="design_services"
    endpoint="/maestros/tipo-servicio"
    :columns="columns"
    :default-form="defaultForm"
  >
    <template #form="{ row }">
      <div class="q-gutter-y-md">
        <q-input v-model="row.nombre" label="Nombre" outlined dense color="primary"
          :rules="[(v) => !!v || 'Requerido']" />
      </div>
    </template>
  </MaestroCrud>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import MaestroCrud from 'src/components/MaestroCrud.vue'

const columns = reactive([
  { name: 'id', label: 'ID', field: 'id', sortable: true, visible: true, align: 'left' as const },
  { name: 'nombre', label: 'Nombre', field: 'nombre', sortable: true, visible: true, align: 'left' as const },
])
const defaultForm = { nombre: '' }
</script>
