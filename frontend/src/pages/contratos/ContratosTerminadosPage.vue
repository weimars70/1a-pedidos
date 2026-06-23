<template>
  <q-page class="contratos-terminados-page q-pa-lg">
    <!-- Toolbar -->
    <q-card flat bordered class="q-mb-md">
      <q-card-section>
        <div class="row q-gutter-sm items-center q-mb-sm">
          <q-input v-model="search" dense outlined clearable placeholder="Buscar en todos los campos..."
            style="min-width:260px" debounce="300">
            <template #prepend><q-icon name="search" color="grey-5" size="18px" /></template>
          </q-input>
          <q-select v-model="filterTipo" :options="tipoFilterOpts" option-value="value" option-label="label"
            emit-value map-options label="Tipo" outlined dense clearable style="min-width:160px" />
          <q-select v-model="filterPerfil" :options="perfilOpts" option-value="value" option-label="label"
            emit-value map-options label="Perfil" outlined dense clearable style="min-width:180px" />
          <q-input v-model="filterFechaDesde" type="date" label="Fecha desde" outlined dense stack-label style="min-width:155px" />
          <q-input v-model="filterFechaHasta" type="date" label="Fecha hasta" outlined dense stack-label style="min-width:155px" />
          <q-btn flat dense round icon="refresh" :loading="loading" @click="loadData"><q-tooltip>Actualizar</q-tooltip></q-btn>
        </div>
        <div v-if="filterTipo || filterPerfil || filterFechaDesde || filterFechaHasta" class="row q-gutter-xs items-center">
          <span class="text-caption text-grey-6">Filtros activos:</span>
          <q-chip v-if="filterTipo" dense removable color="orange-2" text-color="orange-9" @remove="filterTipo = null">{{ filterTipo }}</q-chip>
          <q-chip v-if="filterPerfil" dense removable color="teal-1" text-color="teal-9" @remove="filterPerfil = null">{{ filterPerfil }}</q-chip>
          <q-chip v-if="filterFechaDesde" dense removable color="blue-1" text-color="blue-9" @remove="filterFechaDesde = ''">Desde {{ filterFechaDesde }}</q-chip>
          <q-chip v-if="filterFechaHasta" dense removable color="blue-1" text-color="blue-9" @remove="filterFechaHasta = ''">Hasta {{ filterFechaHasta }}</q-chip>
        </div>
      </q-card-section>
    </q-card>

    <!-- Table -->
    <q-card flat bordered>
      <q-table :rows="filtered" :columns="columns" :loading="loading" row-key="id"
        flat :rows-per-page-options="[12, 25, 50, 100]" class="contratos-terminados-table">
        <template #body-cell-tipo="props">
          <q-td :props="props">
            <q-badge
              :color="tipoBadgeColor(props.row.tipo)"
              :label="props.row.tipo"
              class="tipo-badge"
            />
          </q-td>
        </template>
        <template #no-data>
          <div class="full-width column flex-center text-grey-5 q-pa-xl">
            <q-icon name="assignment_turned_in" size="48px" class="q-mb-sm" />
            <span>Sin contratos terminados</span>
          </div>
        </template>
        <template #loading><q-inner-loading showing color="primary" /></template>
      </q-table>
    </q-card>

  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { api } from 'src/boot/axios'
import { formatDate } from 'src/utils/date'

interface ContratoRow {
  id: number
  tipo: string
  n_perfil: string | null
  fecha: string
  fecha_inicio: string | null
  fecha_terminacion: string | null
  nit: string | null
  nombre_cliente: string | null
  personas: number | null
  nombre_supervisor: string | null
  causal: string | null
  observacion: string | null
}

const $q = useQuasar()

// ── Table ──
const rows    = ref<ContratoRow[]>([])
const loading = ref(false)
const search  = ref('')
const filterTipo   = ref<string | null>(null)
const filterPerfil = ref<string | null>(null)
const filterFechaDesde = ref('')
const filterFechaHasta = ref('')

const tipoFilterOpts = [
  { label: 'Terminacion', value: 'Terminacion' },
  { label: 'Disminución', value: 'Disminución' },
]
const perfilOpts = computed(() =>
  [...new Set(rows.value.map(r => r.n_perfil).filter(Boolean))]
    .map(p => ({ label: p as string, value: p as string }))
)

const filtered = computed(() => {
  let data = rows.value
  if (filterTipo.value)   data = data.filter(r => r.tipo === filterTipo.value)
  if (filterPerfil.value) data = data.filter(r => r.n_perfil === filterPerfil.value)
  if (filterFechaDesde.value) data = data.filter(r => r.fecha >= filterFechaDesde.value)
  if (filterFechaHasta.value) data = data.filter(r => r.fecha <= filterFechaHasta.value)
  if (search.value) {
    const q = search.value.toLowerCase()
    data = data.filter(r =>
      [r.nombre_cliente, r.nit, r.tipo, r.n_perfil, r.nombre_supervisor, r.causal, r.observacion]
        .some(v => (v ?? '').toLowerCase().includes(q))
    )
  }
  return data
})

function tipoBadgeColor(tipo: string): string {
  if (tipo === 'Terminacion') return 'red'
  if (tipo === 'Disminución') return 'orange'
  return 'grey'
}

const columns = [
  { name: 'id',                label: 'Id',                 field: 'id',                align: 'left' as const,   sortable: true },
  { name: 'tipo',              label: 'Tipo',               field: 'tipo',              align: 'left' as const,   sortable: true },
  { name: 'n_perfil',          label: 'N Perfil',           field: 'n_perfil',          align: 'left' as const,   sortable: true },
  { name: 'fecha',             label: 'Fecha',              field: 'fecha',             align: 'left' as const,   sortable: true, format: (v: string | null) => formatDate(v) },
  { name: 'fecha_inicio',      label: 'Fecha Inicio',       field: 'fecha_inicio',      align: 'left' as const,   sortable: true, format: (v: string | null) => formatDate(v) },
  { name: 'fecha_terminacion', label: 'Fecha Terminación',  field: 'fecha_terminacion', align: 'left' as const,   sortable: true, format: (v: string | null) => formatDate(v) },
  { name: 'nit',               label: 'Nit',                field: 'nit',               align: 'left' as const,   sortable: true },
  { name: 'nombre_cliente',    label: 'Nombre Cliente',     field: 'nombre_cliente',    align: 'left' as const,   sortable: true },
  { name: 'personas',          label: 'Personas',           field: 'personas',          align: 'left' as const,   sortable: true },
  { name: 'nombre_supervisor', label: 'Coordinador',        field: 'nombre_supervisor', align: 'left' as const,   sortable: true },
  { name: 'causal',           label: 'Causa',              field: 'causal',            align: 'left' as const,   sortable: true },
  { name: 'observacion',      label: 'Observación',        field: 'observacion',       align: 'left' as const,   sortable: true },
]

async function loadData() {
  loading.value = true
  try {
    const { data } = await api.get('/contratos/terminados')
    rows.value = data
  } catch {
    $q.notify({ type: 'negative', message: 'Error al cargar contratos terminados' })
  } finally { loading.value = false }
}

onMounted(() => { void loadData() })
</script>

<style lang="scss" scoped>
.contratos-terminados-page { width: 100%; }

.toolbar-row {
  display: flex; align-items: center; justify-content: space-between;
  gap: 12px; padding: 12px 16px !important;
}
.search-input { width: 280px; }

.tipo-badge { font-size: 11px; font-weight: 600; }

.contratos-terminados-table {
  :deep(thead tr th) {
    font-weight: 700; font-size: 12px; color: #616161;
    background: #fafafa; text-transform: uppercase; letter-spacing: 0.5px;
  }
  :deep(.q-tr:hover) { background: #f0faf8; }
}
</style>
