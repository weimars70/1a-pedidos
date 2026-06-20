<template>
  <MaestroCrud
    title="Maquinaria / Equipos"
    icon="precision_manufacturing"
    endpoint="/maestros/maquinaria"
    :columns="columns"
    :default-form="defaultForm"
  >
    <template #form="{ row }">
      <div class="q-gutter-y-md">
        <q-input v-model="row.nombre" label="Nombre del equipo" outlined dense color="primary"
          :rules="[(v) => !!v || 'Requerido']" />
        <q-select
          v-model="row.grupo"
          :options="tipoEquipoOpts"
          option-value="id" option-label="nombre"
          emit-value map-options
          label="Tipo de equipo" outlined dense color="primary" clearable
        />
        <div class="row q-col-gutter-md">
          <div class="col-6">
            <q-input v-model="row.fecha_compra" label="Fecha compra" outlined dense color="primary"
              type="date" />
          </div>
          <div class="col-6">
            <q-input v-model="row.fecha_de_baja" label="Fecha de baja" outlined dense color="primary"
              type="date" />
          </div>
        </div>
        <q-toggle v-model="row.estado" label="Activo" color="primary" />
      </div>
    </template>
  </MaestroCrud>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue'
import { api } from 'src/boot/axios'
import MaestroCrud from 'src/components/MaestroCrud.vue'
import { formatDate } from 'src/utils/date'

const tipoEquipoOpts = ref<{ id: number; nombre: string }[]>([])

onMounted(async () => {
  try {
    const { data } = await api.get('/maestros/tipo-equipo')
    tipoEquipoOpts.value = data
  } catch { /* silent */ }
})

const columns = reactive([
  { name: 'id', label: 'Cód.', field: 'id', sortable: true, visible: true, align: 'left' as const },
  { name: 'nombre', label: 'Nombre', field: 'nombre', sortable: true, visible: true, align: 'left' as const },
  { name: 'grupo', label: 'Tipo Equipo', field: (row: Record<string, unknown>) => {
    const t = tipoEquipoOpts.value.find(o => o.id === row.grupo)
    return t ? t.nombre : (row.grupo ?? '')
  }, sortable: false, visible: true, align: 'left' as const },
  { name: 'estado', label: 'Estado', field: (row: Record<string, unknown>) => row.estado ? 'Activo' : 'Inactivo', sortable: false, visible: true, align: 'left' as const },
  { name: 'fecha_compra', label: 'F. Compra', field: 'fecha_compra', sortable: true, visible: true, align: 'left' as const, format: (v: string | null) => formatDate(v) },
  { name: 'fecha_de_baja', label: 'F. Baja', field: 'fecha_de_baja', sortable: false, visible: false, align: 'left' as const, format: (v: string | null) => formatDate(v) },
])
const defaultForm = { nombre: '', grupo: null, estado: true, fecha_compra: '', fecha_de_baja: '' }
</script>
