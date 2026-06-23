<template>
  <q-page class="pedidos-reporte-page q-pa-lg">
    </div>

    <!-- Toolbar -->
    <q-card flat bordered class="q-mb-md">
      <q-card-section class="toolbar-section">

        <!-- Fila 1: búsqueda + refresh + contador + limpiar -->
        <div class="row items-center q-gutter-sm q-mb-sm">
          <q-input v-model="search" dense outlined clearable placeholder="Búsqueda rápida..."
            class="search-input" debounce="300">
            <template #prepend><q-icon name="search" color="grey-5" size="18px" /></template>
          </q-input>
          <q-btn flat dense round icon="refresh" :loading="loading" @click="loadData">
            <q-tooltip>Actualizar</q-tooltip>
          </q-btn>
          <q-space />
          <span class="text-caption text-grey-6">{{ filtered.length }} registros</span>
          <q-btn v-if="hasActiveFilters" flat dense no-caps color="grey-7"
            icon="filter_alt_off" label="Limpiar filtros" @click="clearFilters" />
        </div>

        <!-- Fila 2: filtros específicos -->
        <div class="row items-center q-gutter-sm">
          <q-select
            v-model="filterEstado"
            :options="estadoOptions"
            dense outlined clearable
            label="Estado"
            class="filter-select"
            options-dense
          />
          <q-select
            v-model="filterPerfil"
            :options="perfilOptions"
            dense outlined clearable
            label="Perfil"
            class="filter-select"
            options-dense
          />
          <q-select
            v-model="filterAsesor"
            :options="asesorOptions"
            dense outlined clearable
            label="Asesor"
            class="filter-select"
            options-dense
          />
          <q-input v-model="fechaDesde" dense outlined clearable label="Desde"
            class="filter-date" type="date" />
          <q-input v-model="fechaHasta" dense outlined clearable label="Hasta"
            class="filter-date" type="date" />
        </div>

      </q-card-section>
    </q-card>

    <!-- Table -->
    <q-card flat bordered>
      <q-table
        :rows="filtered"
        :columns="columns"
        :loading="loading"
        row-key="id_pedido"
        flat
        bordered
        dense
        :rows-per-page-options="[12, 25, 50, 100]"
        :rows-per-page="15"
        class="pedidos-reporte-table"
      >
        <template #body-cell-n_tipo_servicio="props">
          <q-td :props="props">
            <q-badge
              :color="(props.row.n_tipo_servicio ?? '').toUpperCase().includes('FIJO') ? 'teal' : 'blue-grey'"
              :label="props.row.n_tipo_servicio ?? '—'"
              outline
              class="tipo-badge"
            />
          </q-td>
        </template>

        <template #body-cell-asesor="props">
          <q-td :props="props">
            <span class="text-weight-bold text-blue-grey-8">{{ props.row.asesor ?? '—' }}</span>
          </q-td>
        </template>

        <template #no-data>
          <div class="full-width column flex-center text-grey-5 q-pa-xl">
            <q-icon name="supervisor_account" size="48px" class="q-mb-sm" />
            <span>Sin datos de supervisión</span>
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

interface SupervisionRow {
  id_pedido: number
  nit: string
  nombre: string
  nombre_empleado: string
  cc: string
  perfil: string
  fecha_inicio: string
  fecha_final: string
  hora_inicio: string
  hora_final: string
  estado: number | string
  asesor: string
  tipo_servicio: string
  n_tipo_servicio: string | null
  nro_personas: number | null
  coordinador: string | null
  presta_servicio: string | null
  causa_no_instalacion: string | null
}

const $q = useQuasar()

const rows          = ref<SupervisionRow[]>([])
const loading       = ref(false)
const search        = ref('')
const filterEstado  = ref<string | null>(null)
const filterPerfil  = ref<string | null>(null)
const filterAsesor  = ref<string | null>(null)
const fechaDesde    = ref('')
const fechaHasta    = ref('')

const estadoOptions = computed(() =>
  [...new Set(rows.value.map(r => r.estado).filter(Boolean))].sort()
)
const perfilOptions = computed(() =>
  [...new Set(rows.value.map(r => r.perfil).filter(Boolean))].sort()
)
const asesorOptions = computed(() =>
  [...new Set(rows.value.map(r => r.asesor).filter(Boolean))].sort()
)

const hasActiveFilters = computed(() =>
  !!search.value || !!filterEstado.value || !!filterPerfil.value ||
  !!filterAsesor.value || !!fechaDesde.value || !!fechaHasta.value
)

const filtered = computed(() => {
  let result = rows.value

  if (search.value) {
    const q = search.value.toLowerCase()
    result = result.filter(r =>
      `${r.id_pedido ?? ''} ${r.nit ?? ''} ${r.nombre ?? ''} ${r.asesor ?? ''} ${r.n_tipo_servicio ?? ''}`.toLowerCase().includes(q)
    )
  }
  if (filterEstado.value) result = result.filter(r => r.estado === filterEstado.value)
  if (filterPerfil.value) result = result.filter(r => r.perfil === filterPerfil.value)
  if (filterAsesor.value) result = result.filter(r => r.asesor === filterAsesor.value)
  if (fechaDesde.value)   result = result.filter(r => r.fecha_inicio >= fechaDesde.value)
  if (fechaHasta.value)   result = result.filter(r => r.fecha_inicio <= fechaHasta.value)

  return result
})

function clearFilters() {
  search.value       = ''
  filterEstado.value = null
  filterPerfil.value = null
  filterAsesor.value = null
  fechaDesde.value   = ''
  fechaHasta.value   = ''
}

function estadoColor(estado: number | string | null | undefined): string {
  // estado arrives as a numeric FK (1=PENDIENTE, 2=PROGRAMADO, 3=CANCELADO,
  // 5=FACTURADO, 6=ENVIADO COORDINADOR). Fall back to string matching for
  // any context where a label string is passed instead.
  const n = Number(estado)
  if (!isNaN(n)) {
    if (n === 1) return 'orange'   // PENDIENTE
    if (n === 2) return 'blue'     // PROGRAMADO
    if (n === 3) return 'red'      // CANCELADO
    if (n === 5) return 'green'    // FACTURADO
    if (n === 6) return 'purple'   // ENVIADO COORDINADOR
  }
  const e = String(estado ?? '').toUpperCase()
  if (e.includes('PROGRAMADO'))                          return 'blue'
  if (e.includes('PENDIENTE'))                           return 'orange'
  if (e.includes('FACTURADO'))                           return 'green'
  if (e.includes('ENVIADO'))                             return 'purple'
  if (e.includes('TERMINO') || e.includes('TÉRMINO'))   return 'grey'
  if (e.includes('ANULADO') || e.includes('CANCELADO')) return 'red'
  return 'grey'
}

const columns = [
  { name: 'fecha_inicio',         label: 'Fecha Inicio',          field: 'fecha_inicio',         align: 'left' as const,   sortable: true,  format: (v: string | null) => formatDate(v) },
  { name: 'fecha_final',          label: 'Fecha Final',           field: 'fecha_final',          align: 'left' as const,   sortable: true,  format: (v: string | null) => formatDate(v) },
  { name: 'n_tipo_servicio',      label: 'N Tipo Servicio',       field: 'n_tipo_servicio',      align: 'left' as const,   sortable: true,  style: 'white-space: normal; word-break: break-word; max-width: 500px; min-width: 300px;' },
  { name: 'nombre',               label: 'Nombre',                field: 'nombre',               align: 'left' as const,   sortable: true,  style: 'white-space: normal; word-break: break-word; max-width: 500px; min-width: 300px;' },
  { name: 'asesor',               label: 'Coordinador',           field: 'asesor',               align: 'left' as const,   sortable: true  },
  { name: 'nro_personas',         label: 'Nro Personas',          field: 'nro_personas',         align: 'center' as const, sortable: true  },
  { name: 'id_pedido',            label: 'Id Pedido',             field: 'id_pedido',            align: 'left' as const,   sortable: true  },
  { name: 'presta_servicio',      label: 'Presta Servicio',       field: 'presta_servicio',      align: 'left' as const,   sortable: false },
  { name: 'causa_no_instalacion', label: 'Causa No Instalacion',  field: 'causa_no_instalacion', align: 'left' as const,   sortable: true  },
]

async function loadData() {
  loading.value = true
  try {
    const { data } = await api.get('/pedidos/supervision')
    rows.value = data
  } catch {
    $q.notify({ type: 'negative', message: 'Error al cargar reporte de supervisión' })
  } finally { loading.value = false }
}

onMounted(() => { void loadData() })
</script>

<style lang="scss" scoped>
.pedidos-reporte-page { width: 100%; }

.toolbar-section { padding: 12px 16px !important; }
.search-input  { width: 260px; }
.filter-select { width: 170px; }
.filter-date   { width: 145px; }

.estado-badge { font-size: 11px; font-weight: 600; white-space: nowrap; }
.tipo-badge   { font-size: 11px; font-weight: 600; }

.pedidos-reporte-table {
  :deep(thead tr th) {
    font-weight: 700; font-size: 12px; color: #616161;
    background: #fafafa; text-transform: uppercase; letter-spacing: 0.5px;
  }
  :deep(.q-tr:hover) { background: #eceff1; }
}
</style>
