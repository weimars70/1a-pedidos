<template>
  <q-page class="ep-page q-pa-lg">
    <!-- Header -->
    <div class="page-header q-mb-lg">
      <div class="page-title-area">
        <q-icon name="badge" color="primary" size="28px" class="q-mr-sm" />
        <h5 class="q-ma-none text-weight-bold text-grey-9">Empleados por Perfil</h5>
      </div>
      <q-breadcrumbs class="text-caption q-mt-xs" active-color="primary">
        <q-breadcrumbs-el label="Inicio" to="/app/inicio" />
        <q-breadcrumbs-el label="Asociaciones" />
        <q-breadcrumbs-el label="Empleados por Perfil" />
      </q-breadcrumbs>
    </div>

    <!-- Asociar form -->
    <q-card flat bordered class="q-mb-md shadow-2">
      <q-card-section>
        <div class="row q-col-gutter-md items-end">
          <div class="col-12 col-sm-5">
            <q-select
              v-model="form.ident"
              :options="empleadoOptions"
              option-value="value"
              option-label="label"
              emit-value map-options use-input input-debounce="0"
              label="Empleado" outlined dense color="teal-9" clearable
              @filter="filterEmpleados"
            >
              <template #prepend><q-icon name="person" color="teal-9" size="18px" /></template>
              <template #no-option><q-item><q-item-section class="text-grey">Sin resultados</q-item-section></q-item></template>
            </q-select>
          </div>
          <div class="col-12 col-sm-5">
            <q-select
              v-model="form.id_perfil"
              :options="perfilOptions"
              option-value="value"
              option-label="label"
              emit-value map-options use-input input-debounce="0"
              label="Perfil" outlined dense color="teal-9" clearable
              @filter="filterPerfiles"
            >
              <template #prepend><q-icon name="link" color="teal-9" size="18px" /></template>
              <template #no-option><q-item><q-item-section class="text-grey">Sin resultados</q-item-section></q-item></template>
            </q-select>
          </div>
          <div class="col-12 col-sm-2">
            <q-btn unelevated no-caps label="ASOCIAR" icon="add_link" class="full-width asociar-btn"
              :loading="saving" :disable="!form.ident || !form.id_perfil" @click="asociar" />
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Filters -->
    <q-card flat bordered class="q-mb-md">
      <q-card-section class="q-pa-md">
        <div class="row q-col-gutter-md items-end">
          <div class="col-12 col-sm-5">
            <q-input v-model="filters.search" dense outlined clearable debounce="400"
              placeholder="Buscar por nombre o cédula..." @update:model-value="onFilter">
              <template #prepend><q-icon name="search" color="grey-5" size="16px" /></template>
            </q-input>
          </div>
          <div class="col-12 col-sm-5">
            <q-select v-model="filters.perfil" :options="perfilOptionsAll" option-value="value"
              option-label="label" emit-value map-options clearable dense outlined
              label="Filtrar por perfil" @update:model-value="onFilter">
              <template #prepend><q-icon name="filter_list" color="grey-5" size="16px" /></template>
            </q-select>
          </div>
          <div class="col-12 col-sm-2">
            <q-btn flat no-caps dense icon="clear" label="Limpiar" color="grey-7" class="full-width" @click="clearFilters" />
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Table -->
    <q-card flat bordered class="shadow-2">
      <q-card-section class="table-toolbar q-pa-sm">
        <span class="text-caption text-grey-6">{{ total }} registro{{ total !== 1 ? 's' : '' }}</span>
        <q-btn flat dense round icon="refresh" color="grey-7" :loading="loading" @click="loadData">
          <q-tooltip>Actualizar</q-tooltip>
        </q-btn>
      </q-card-section>

      <q-table :rows="rows" :columns="columns" :loading="loading" row-key="codigo"
        flat dense bordered :rows-per-page-options="[]" hide-bottom>
        <template #body-cell-actions="props">
          <q-td :props="props">
            <q-btn flat round dense icon="link_off" color="negative" size="sm"
              :loading="removingIdent === props.row.ident"
              @click="quitarPerfil(props.row)">
              <q-tooltip>Quitar perfil</q-tooltip>
            </q-btn>
          </q-td>
        </template>
        <template #no-data>
          <div class="full-width column flex-center text-grey-5 q-pa-xl">
            <q-icon name="link_off" size="48px" class="q-mb-sm" />
            <span>Sin registros</span>
          </div>
        </template>
        <template #loading><q-inner-loading showing color="teal-9" /></template>
      </q-table>

      <!-- Pagination -->
      <div class="pagination-bar">
        <span class="text-caption text-grey-6">
          Página {{ page }} de {{ totalPages }} · {{ total }} empleados
        </span>
        <q-pagination v-model="page" :max="totalPages" :max-pages="7"
          boundary-links color="teal-9" @update:model-value="loadData" />
        <q-select v-model="limit" :options="[25,50,100,200]" dense outlined
          label="Por página" style="width:100px" @update:model-value="onLimitChange" />
      </div>
    </q-card>

    <!-- Confirm quitar -->
    <q-dialog v-model="showConfirm">
      <q-card style="min-width:340px">
        <q-card-section class="row items-center q-pa-lg">
          <q-avatar icon="link_off" color="negative" text-color="white" />
          <span class="q-ml-sm">¿Quitar el perfil de <strong>{{ confirmRow?.nombre }}</strong>?</span>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat no-caps label="Cancelar" v-close-popup />
          <q-btn unelevated no-caps label="Quitar" color="negative" :loading="removing" @click="doQuitar" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive } from 'vue'
import { useQuasar } from 'quasar'
import { api } from 'src/boot/axios'

interface Row { codigo: number; ident: string; nombre: string; id_perfil: number | null; perfil: string | null }
interface Option { value: number | string; label: string }

const $q = useQuasar()

// Table state
const rows = ref<Row[]>([])
const loading = ref(false)
const total = ref(0)
const page = ref(1)
const limit = ref(50)
const totalPages = computed(() => Math.max(1, Math.ceil(total.value / limit.value)))

const columns = [
  { name: 'actions', label: '', field: 'actions', align: 'center' as const, sortable: false, style: 'width:60px' },
  { name: 'ident', label: 'Cédula', field: 'ident', sortable: true, align: 'left' as const },
  { name: 'nombre', label: 'Nombre', field: 'nombre', sortable: true, align: 'left' as const },
  { name: 'perfil', label: 'Perfil', field: 'perfil', sortable: true, align: 'left' as const },
]

// Filters
const filters = reactive({ search: '', perfil: null as number | null })

function onFilter() { page.value = 1; void loadData() }
function onLimitChange() { page.value = 1; void loadData() }
function clearFilters() { filters.search = ''; filters.perfil = null; onFilter() }

async function loadData() {
  loading.value = true
  try {
    const params: Record<string, string> = {
      page: String(page.value),
      limit: String(limit.value),
    }
    if (filters.search) params.search = filters.search
    if (filters.perfil) params.perfil = String(filters.perfil)
    const { data } = await api.get('/asociaciones/empleados-perfil', { params })
    rows.value = data.data
    total.value = data.total
  } catch {
    $q.notify({ type: 'negative', message: 'Error al cargar datos' })
  } finally {
    loading.value = false
  }
}

// Options for form selects
const empleadosAll = ref<Option[]>([])
const perfilesAll = ref<Option[]>([])
const perfilOptionsAll = ref<Option[]>([])
const empleadoOptions = ref<Option[]>([])
const perfilOptions = ref<Option[]>([])

function filterEmpleados(val: string, update: (fn: () => void) => void) {
  update(() => {
    empleadoOptions.value = val
      ? empleadosAll.value.filter(o => o.label.toLowerCase().includes(val.toLowerCase()))
      : empleadosAll.value
  })
}
function filterPerfiles(val: string, update: (fn: () => void) => void) {
  update(() => {
    perfilOptions.value = val
      ? perfilesAll.value.filter(o => o.label.toLowerCase().includes(val.toLowerCase()))
      : perfilesAll.value
  })
}

async function loadOptions() {
  const [emp, per] = await Promise.all([
    api.get('/asociaciones/options/empleados'),
    api.get('/asociaciones/options/perfiles'),
  ])
  empleadosAll.value = emp.data
  empleadoOptions.value = emp.data
  perfilesAll.value = per.data
  perfilOptions.value = per.data
  perfilOptionsAll.value = per.data
}

// Asociar
const form = reactive({ ident: null as string | null, id_perfil: null as number | null })
const saving = ref(false)

async function asociar() {
  if (!form.ident || !form.id_perfil) return
  saving.value = true
  try {
    await api.post('/asociaciones/empleados-perfil', { empleado: form.ident, perfil: form.id_perfil })
    $q.notify({ type: 'positive', message: 'Perfil asignado correctamente', icon: 'check_circle' })
    form.ident = null; form.id_perfil = null
    await loadData()
  } catch (e: unknown) {
    const err = e as { response?: { data?: { message?: string } } }
    $q.notify({ type: 'negative', message: err.response?.data?.message ?? 'Error al asociar' })
  } finally {
    saving.value = false
  }
}

// Quitar perfil
const showConfirm = ref(false)
const confirmRow = ref<Row | null>(null)
const removing = ref(false)
const removingIdent = ref<string | null>(null)

function quitarPerfil(row: Row) {
  confirmRow.value = row
  showConfirm.value = true
}

async function doQuitar() {
  if (!confirmRow.value) return
  removing.value = true
  removingIdent.value = confirmRow.value.ident
  try {
    await api.delete('/asociaciones/empleados-perfil', {
      data: { empleado: confirmRow.value.ident, perfil: confirmRow.value.id_perfil }
    })
    $q.notify({ type: 'positive', message: 'Perfil quitado' })
    showConfirm.value = false
    rows.value = rows.value.filter(r => r.ident !== confirmRow.value!.ident)
    total.value--
  } catch {
    $q.notify({ type: 'negative', message: 'Error al quitar perfil' })
  } finally {
    removing.value = false
    removingIdent.value = null
  }
}

onMounted(async () => {
  await Promise.all([loadOptions(), loadData()])
})
</script>

<style lang="scss" scoped>
.ep-page { max-width: 1200px; margin: 0 auto; }

.page-header {
  background: white; border-radius: 12px;
  padding: 20px 24px; box-shadow: 0 1px 4px rgba(0,0,0,0.06);
}
.page-title-area { display: flex; align-items: center; margin-bottom: 4px; }

.asociar-btn {
  background: #0F5A52 !important; color: white !important;
  font-weight: 600; letter-spacing: 0.5px; height: 40px;
}

.table-toolbar {
  display: flex; align-items: center; justify-content: space-between;
  border-bottom: 1px solid #f0f0f0;
}

.pagination-bar {
  display: flex; align-items: center; justify-content: space-between;
  padding: 8px 16px; border-top: 1px solid #f0f0f0; gap: 12px;
}

:deep(thead tr th) {
  font-weight: 700; font-size: 12px; color: #616161;
  background: #fafafa; text-transform: uppercase; letter-spacing: 0.5px;
}
:deep(.q-tr:hover) { background: #f0faf8; }
</style>
