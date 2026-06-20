<template>
  <q-page class="q-pa-md">

    <!-- Header -->
    <div class="row items-center q-mb-md q-gutter-sm">
      <div class="text-h6 text-weight-bold">Pedidos Empleados</div>
      <q-space />
      <q-input v-model="search" dense outlined clearable placeholder="Buscar..."
        style="width:220px" debounce="300">
        <template #prepend><q-icon name="search" size="18px" /></template>
      </q-input>
      <q-btn flat dense round icon="refresh" :loading="loading" @click="loadData">
        <q-tooltip>Actualizar</q-tooltip>
      </q-btn>
      <span class="text-caption text-grey-6">{{ filtered.length }} registros</span>
    </div>

    <!-- Table -->
    <q-table
      :rows="filtered"
      :columns="columns"
      :loading="loading"
      row-key="id"
      flat
      bordered
      dense
      :rows-per-page-options="[15, 25, 50, 100]"
      :pagination="{ rowsPerPage: 15 }"
    >
      <template #no-data>
        <div class="full-width column flex-center text-grey-5 q-pa-xl">
          <q-icon name="people" size="48px" class="q-mb-sm" />
          <span>Sin pedidos de empleados</span>
        </div>
      </template>
      <template #loading><q-inner-loading showing color="primary" /></template>
    </q-table>

  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { api } from 'src/boot/axios'
import { formatDate } from 'src/utils/date'

interface PedidoEmpleadoRow {
  id: number
  id_pedido: number
  empleado_ident: string
  empleado_nombre: string
  fecha_inicio: string
  fecha_final: string
}

const $q     = useQuasar()
const rows   = ref<PedidoEmpleadoRow[]>([])
const loading = ref(false)
const search  = ref('')

const filtered = computed(() => {
  if (!search.value) return rows.value
  const q = search.value.toLowerCase()
  return rows.value.filter(r =>
    `${r.id_pedido ?? ''} ${r.empleado_ident ?? ''} ${r.empleado_nombre ?? ''}`.toLowerCase().includes(q)
  )
})

const columns = [
  { name: 'id_pedido',        label: 'Pedido',   field: 'id_pedido',        align: 'left' as const, sortable: true },
  { name: 'empleado_ident',   label: 'Empleado', field: 'empleado_ident',   align: 'left' as const, sortable: true },
  { name: 'empleado_nombre',  label: 'Nombre',   field: 'empleado_nombre',  align: 'left' as const, sortable: true },
  { name: 'fecha_inicio',     label: 'Desde',    field: 'fecha_inicio',     align: 'left' as const, sortable: true, format: (v: string | null) => formatDate(v) },
  { name: 'fecha_final',      label: 'Hasta',    field: 'fecha_final',      align: 'left' as const, sortable: true, format: (v: string | null) => formatDate(v) },
]

async function loadData() {
  loading.value = true
  try {
    const { data } = await api.get('/pedidos/empleados')
    rows.value = data
  } catch {
    $q.notify({ type: 'negative', message: 'Error al cargar pedidos de empleados' })
  } finally { loading.value = false }
}

onMounted(() => { void loadData() })
</script>
