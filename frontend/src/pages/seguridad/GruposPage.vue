<template>
  <MaestroCrud
    title="Grupos de Usuarios"
    icon="group"
    endpoint="/seguridad/grupos"
    :columns="columns"
    :default-form="defaultForm"
    section="Seguridad"
  >
    <template #form="{ row }">
      <div class="q-gutter-y-md">
        <q-input v-model="row.nombre" label="Nombre del grupo" outlined dense color="primary" :rules="[v => !!v || 'Requerido']" />
        <q-input v-model="row.descripcion" label="Descripción" outlined dense color="primary" type="textarea" rows="3" />
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
  { name: 'descripcion', label: 'Descripción', field: 'descripcion', sortable: false, visible: true, align: 'left' as const },
])
const defaultForm = { nombre: '', descripcion: '' }
</script>
