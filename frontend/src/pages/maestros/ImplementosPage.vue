<template>
  <MaestroCrud
    title="Implemento Maquinaria Equipos"
    icon="construction"
    endpoint="/maestros/implementos"
    :columns="columns"
    :default-form="defaultForm"
  >
    <template #form="{ row }">
      <div class="q-gutter-y-md">
        <q-input v-model="row.nombre" label="Nombre" outlined dense color="primary"
          :rules="[(v) => !!v || 'Requerido']" />
        <q-input v-model="row.observacion" label="Observación" outlined dense color="primary"
          type="textarea" rows="3" />
      </div>
    </template>
  </MaestroCrud>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import MaestroCrud from 'src/components/MaestroCrud.vue'

const columns = reactive([
  { name: 'id', label: 'Cód.', field: 'id', sortable: true, visible: true, align: 'left' as const },
  { name: 'nombre', label: 'Nombre', field: 'nombre', sortable: true, visible: true, align: 'left' as const },
  { name: 'observacion', label: 'Observación', field: 'observacion', sortable: false, visible: true, align: 'left' as const },
])
const defaultForm = { nombre: '', observacion: '' }
</script>
