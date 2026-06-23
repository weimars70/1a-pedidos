<template>
  <q-page>
    <div class="page-header q-pa-md">
      <div class="row items-center">
        <q-icon name="groups" color="white" size="28px" class="q-mr-sm" />
        <div class="text-h5 text-white">Listado Cuadrillas Especiales</div>
      </div>
    </div>

    <div class="q-pa-md">
      <!-- Toolbar -->
      <div class="row q-gutter-md q-mb-md items-center">
        <q-select
          v-model="filterNombre"
          :options="nombreOpts"
          label="Filtrar por Nombre"
          clearable outlined dense
          style="min-width: 220px"
          emit-value map-options
        />
        <q-input v-model="search" label="Búsqueda rápida..." outlined dense clearable style="min-width: 220px">
          <template #prepend><q-icon name="search" /></template>
        </q-input>
        <q-btn icon="refresh" flat round dense color="teal" @click="loadData" />
      </div>

      <!-- Create form -->
      <q-card flat bordered class="q-mb-md">
        <q-card-section>
          <div class="row q-gutter-md items-end">
            <q-select
              v-model="form.cuadrilla"
              :options="cuadrillaOpts"
              label="Cuadrilla"
              outlined dense clearable use-input input-debounce="0"
              option-value="value" option-label="label"
              emit-value map-options
              style="min-width: 240px"
              @filter="filterCuadrillas"
            />
            <q-select
              v-model="form.empleado"
              :options="empleadoFiltered"
              label="Empleado"
              outlined dense clearable use-input input-debounce="0"
              option-value="value" option-label="label"
              emit-value map-options
              style="min-width: 280px"
              @filter="filterEmpleados"
            />
            <q-btn
              label="ASOCIAR" icon="add_link" unelevated no-caps
              class="asociar-btn" :loading="saving"
              :disable="!form.cuadrilla || !form.empleado"
              @click="asociar"
            />
          </div>
        </q-card-section>
      </q-card>

      <!-- Table -->
      <q-table
        :rows="filteredRows"
        :columns="columns"
        row-key="rowKey"
        dense
        bordered
        :loading="loading"
        :pagination="{ rowsPerPage: 15 }"
      >
        <template #header="props">
          <q-tr :props="props" class="teal-header">
            <q-th v-for="col in props.cols" :key="col.name" :props="props">{{ col.label }}</q-th>
          </q-tr>
        </template>
        <template #body-cell-activo="props">
          <q-td :props="props">
            <q-badge :color="props.value === 'SI' ? 'positive' : 'negative'" :label="props.value" />
          </q-td>
        </template>
        <template #body-cell-actions="props">
          <q-td :props="props" class="text-center">
            <q-btn flat round dense icon="delete" color="negative" size="sm" @click="confirmDelete(props.row)" />
          </q-td>
        </template>
      </q-table>
    </div>

    <!-- Delete confirm -->
    <q-dialog v-model="showDelete">
      <q-card>
        <q-card-section>
          <div class="text-h6">¿Eliminar asociación?</div>
          <div class="text-body2 q-mt-sm">
            <b>{{ deletingRow?.nombre }}</b> — {{ deletingRow?.empleado }}
          </div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancelar" v-close-popup />
          <q-btn flat label="Eliminar" color="negative" :loading="deleting" @click="doDelete" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { api } from 'src/boot/axios'

const $q = useQuasar()

interface Row { codigo_cuadrilla: number; nombre: string; codigo_empleado: number; empleado: string; activo: string }
interface Opt { value: number | string; label: string }

const rows = ref<Row[]>([])
const loading = ref(false)
const saving = ref(false)
const search = ref('')
const filterNombre = ref<string | null>(null)

const cuadrillaOpts = ref<Opt[]>([])
const cuadrillaFiltered = ref<Opt[]>([])
const empleadoOpts = ref<Opt[]>([])
const empleadoFiltered = ref<Opt[]>([])

const form = ref({ cuadrilla: null as number | null, empleado: null as string | null })

const showDelete = ref(false)
const deletingRow = ref<Row | null>(null)
const deleting = ref(false)

const columns = [
  { name: 'actions', label: '', field: 'actions', align: 'center' as const, sortable: false, style: 'width:50px' },
  { name: 'nombre', label: 'Nombre', field: 'nombre', sortable: true, align: 'left' as const },
  { name: 'codigo_empleado', label: 'Ident empleado', field: 'codigo_empleado', sortable: true, align: 'left' as const },
  { name: 'empleado', label: 'Empleado', field: 'empleado', sortable: true, align: 'left' as const },
  { name: 'activo', label: 'Activo', field: 'activo', sortable: true, align: 'center' as const },
]

const nombreOpts = computed(() =>
  [...new Set(rows.value.map(r => r.nombre).filter(Boolean))].map(n => ({ value: n, label: n }))
)

const filteredRows = computed(() => {
  let data = rows.value
  if (filterNombre.value) data = data.filter(r => r.nombre === filterNombre.value)
  if (search.value) {
    const q = search.value.toLowerCase()
    data = data.filter(r =>
      r.nombre?.toLowerCase().includes(q) ||
      r.empleado?.toLowerCase().includes(q) ||
      String(r.codigo_empleado).includes(q)
    )
  }
  return data
})

function filterCuadrillas(val: string, update: (fn: () => void) => void) {
  update(() => {
    cuadrillaFiltered.value = val
      ? cuadrillaOpts.value.filter(o => o.label.toLowerCase().includes(val.toLowerCase()))
      : [...cuadrillaOpts.value]
  })
}

function filterEmpleados(val: string, update: (fn: () => void) => void) {
  update(() => {
    empleadoFiltered.value = val
      ? empleadoOpts.value.filter(o => o.label.toLowerCase().includes(val.toLowerCase()))
      : [...empleadoOpts.value]
  })
}

async function loadData() {
  loading.value = true
  try {
    const { data } = await api.get('/asociaciones/cuadrillas')
    rows.value = Array.isArray(data) ? data : (data?.rows ?? [])
  } finally {
    loading.value = false
  }
}

async function loadOptions() {
  try {
    const r1 = await api.get('/asociaciones/options/cuadrillas')
    const arr1 = Array.isArray(r1.data) ? r1.data : (r1.data?.rows ?? [])
    cuadrillaOpts.value = arr1
    cuadrillaFiltered.value = [...arr1]
  } catch { /* silent */ }
  try {
    const r2 = await api.get('/asociaciones/options/empleados')
    const arr2 = Array.isArray(r2.data) ? r2.data : (r2.data?.rows ?? [])
    empleadoOpts.value = arr2
    empleadoFiltered.value = [...arr2]
  } catch { /* silent */ }
}

async function asociar() {
  if (!form.value.cuadrilla || !form.value.empleado) return
  saving.value = true
  try {
    await api.post('/asociaciones/cuadrillas', {
      codigo_cuadrilla: form.value.cuadrilla,
      codigo_empleado: form.value.empleado,
    })
    $q.notify({ type: 'positive', message: 'Asociación creada' })
    form.value = { cuadrilla: null, empleado: null }
    await loadData()
  } catch {
    $q.notify({ type: 'negative', message: 'Error al asociar', icon: 'error' })
  } finally {
    saving.value = false
  }
}

function confirmDelete(row: Row) {
  deletingRow.value = row
  showDelete.value = true
}

async function doDelete() {
  if (!deletingRow.value) return
  deleting.value = true
  try {
    await api.delete(`/asociaciones/cuadrillas/${deletingRow.value.codigo_cuadrilla}/${deletingRow.value.codigo_empleado}`)
    $q.notify({ type: 'positive', message: 'Asociación eliminada' })
    showDelete.value = false
    rows.value = rows.value.filter(r =>
      !(r.codigo_cuadrilla === deletingRow.value!.codigo_cuadrilla && r.codigo_empleado === deletingRow.value!.codigo_empleado)
    )
  } catch {
    $q.notify({ type: 'negative', message: 'Error al eliminar', icon: 'error' })
  } finally {
    deleting.value = false
  }
}

onMounted(() => { void Promise.all([loadData(), loadOptions()]) })
</script>

<style scoped>
.asociar-btn {
  background: linear-gradient(135deg, #0F5A52 0%, #26A69A 100%);
  color: white;
}
.teal-header th {
  background: #00695C;
  color: white;
  font-weight: 700;
  text-transform: uppercase;
  font-size: 11px;
}
</style>
