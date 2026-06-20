<template>
  <MaestroCrud
    title="Aplicaciones del Sistema"
    icon="apps"
    endpoint="/seguridad/aplicaciones"
    :columns="columns"
    :default-form="defaultForm"
    section="Seguridad"
  >
    <template #form="{ row }">
      <div class="q-gutter-y-md">
        <q-input v-model="row.nombre" label="Nombre" outlined dense color="primary" :rules="[v => !!v || 'Requerido']" />
        <q-input v-model="row.descripcion" label="Descripción" outlined dense color="primary" type="textarea" rows="2" />
        <q-input v-model="row.url" label="URL / Ruta" outlined dense color="primary" />
        <q-input v-model="row.icono" label="Icono (Material Icons)" outlined dense color="primary" />
        <q-select v-model="row.activo" label="Activo" outlined dense color="primary"
          :options="[{ label: 'Sí', value: true }, { label: 'No', value: false }]"
          emit-value map-options />
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
  { name: 'url', label: 'URL', field: 'url', sortable: false, visible: true, align: 'left' as const },
  { name: 'icono', label: 'Icono', field: 'icono', sortable: false, visible: true, align: 'center' as const },
  { name: 'activo', label: 'Activo', field: 'activo', sortable: true, visible: true, align: 'center' as const },
])
const defaultForm = { nombre: '', descripcion: '', url: '', icono: 'apps', activo: true }
</script>
