<template>
  <q-page class="pc-page q-pa-lg">
    <!-- Teal gradient header -->
    <div class="page-header q-mb-lg">
      <div class="row items-center q-mb-xs">
        <q-icon name="school" size="28px" class="q-mr-sm" style="color:#fff" />
        <span class="text-h5 text-white text-weight-bold">Listado Perfil Capacitación</span>
      </div>
      <q-breadcrumbs active-color="teal-1" class="text-caption" style="color:rgba(255,255,255,0.75)">
        <q-breadcrumbs-el label="Inicio" to="/app/inicio" style="color:rgba(255,255,255,0.75)" />
        <q-breadcrumbs-el label="Asociaciones" style="color:rgba(255,255,255,0.75)" />
        <q-breadcrumbs-el label="Perfiles Capacitación" style="color:#fff" />
      </q-breadcrumbs>
    </div>

    <!-- Toolbar: filter + search -->
    <q-card flat bordered class="q-mb-md">
      <q-card-section class="q-pa-md">
        <div class="row q-col-gutter-md items-end">
          <div class="col-12 col-sm-5">
            <q-select
              v-model="selectedPerfil"
              :options="perfilOpts"
              label="Filtrar por Perfil"
              clearable outlined dense color="teal-9"
            >
              <template #prepend><q-icon name="filter_list" color="grey-5" size="16px" /></template>
            </q-select>
          </div>
          <div class="col-12 col-sm-5">
            <q-input
              v-model="filter"
              label="Búsqueda rápida..."
              clearable outlined dense debounce="300"
            >
              <template #prepend><q-icon name="search" color="grey-5" size="16px" /></template>
            </q-input>
          </div>
          <div class="col-12 col-sm-2">
            <q-btn flat no-caps dense icon="clear" label="Limpiar" color="grey-7" class="full-width"
              @click="clearFilters" />
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Table -->
    <q-card flat bordered class="shadow-2">
      <q-card-section class="table-toolbar q-pa-sm">
        <span class="text-caption text-grey-6">{{ filteredRows.length }} registro{{ filteredRows.length !== 1 ? 's' : '' }}</span>
        <q-btn flat dense round icon="refresh" color="grey-7" :loading="loading" @click="loadData">
          <q-tooltip>Actualizar</q-tooltip>
        </q-btn>
      </q-card-section>

      <q-table
        :rows="filteredRows"
        :columns="columns"
        :loading="loading"
        row-key="row_key"
        flat dense bordered
        :rows-per-page-options="[0]"
        hide-bottom
      >
        <template #no-data>
          <div class="full-width column flex-center text-grey-5 q-pa-xl">
            <q-icon name="school" size="48px" class="q-mb-sm" />
            <span>Sin registros</span>
          </div>
        </template>
        <template #loading><q-inner-loading showing color="teal-9" /></template>
      </q-table>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { api } from 'src/boot/axios'

interface Row {
  codigo_perfil: number
  perfil: string
  codigo_capacitacion: number
  capacitacion: string
  row_key: string
}

const $q = useQuasar()

const rows = ref<Row[]>([])
const loading = ref(false)
const selectedPerfil = ref<string | null>(null)
const filter = ref('')

const columns = [
  { name: 'codigo_perfil',      label: 'Codigo Perfil',       field: 'codigo_perfil',      sortable: true,  align: 'center' as const, style: 'width:120px' },
  { name: 'perfil',             label: 'Perfil',              field: 'perfil',             sortable: true,  align: 'left'   as const },
  { name: 'codigo_capacitacion',label: 'Codigo Capacitación', field: 'codigo_capacitacion',sortable: true,  align: 'center' as const, style: 'width:160px' },
  { name: 'capacitacion',       label: 'Capacitación',        field: 'capacitacion',       sortable: true,  align: 'left'   as const },
]

// Unique perfil options derived from loaded data
const perfilOpts = computed(() => {
  const seen = new Set<string>()
  return rows.value
    .map(r => r.perfil)
    .filter(p => { if (seen.has(p)) return false; seen.add(p); return true })
    .sort()
})

// Filtered rows based on selected perfil + free-text search
const filteredRows = computed(() => {
  const q = filter.value.trim().toLowerCase()
  return rows.value.filter(r => {
    const matchPerfil = !selectedPerfil.value || r.perfil === selectedPerfil.value
    const matchSearch = !q || [
      r.perfil,
      r.capacitacion,
      String(r.codigo_perfil),
      String(r.codigo_capacitacion),
    ].some(v => v.toLowerCase().includes(q))
    return matchPerfil && matchSearch
  })
})

async function loadData() {
  loading.value = true
  try {
    const { data } = await api.get('/asociaciones/perfiles-capacitacion')
    rows.value = (data as Row[]).map(r => ({
      ...r,
      row_key: `${r.codigo_perfil}-${r.codigo_capacitacion}`,
    }))
  } catch {
    $q.notify({ type: 'negative', message: 'Error al cargar datos' })
  } finally {
    loading.value = false
  }
}

function clearFilters() {
  selectedPerfil.value = null
  filter.value = ''
}

onMounted(() => { void loadData() })
</script>

<style lang="scss" scoped>
.pc-page { max-width: 1200px; margin: 0 auto; }

.page-header {
  background: linear-gradient(135deg, #00695c 0%, #00897b 100%);
  border-radius: 12px;
  padding: 20px 24px;
  box-shadow: 0 2px 8px rgba(0, 105, 92, 0.35);
}

.table-toolbar {
  display: flex; align-items: center; justify-content: space-between;
  border-bottom: 1px solid #f0f0f0;
}

:deep(thead tr th) {
  font-weight: 700; font-size: 12px; color: #616161;
  background: #fafafa; text-transform: uppercase; letter-spacing: 0.5px;
}
:deep(.q-tr:hover) { background: #f0faf8; }
</style>
