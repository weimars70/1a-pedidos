<template>
  <q-page class="pedidos-areas-page q-pa-lg">
    </div>

    <!-- Toolbar -->
    <q-card flat bordered class="q-mb-md">
      <q-card-section class="toolbar-section">

        <!-- Fila 1: búsqueda + refresh -->
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
            v-model="filterArea"
            :options="areaOptions"
            dense outlined clearable
            label="Área responsable"
            class="filter-select-wide"

            options-dense
          />
          <q-select
            v-model="filterUsuario"
            :options="usuarioOptions"
            dense outlined clearable
            label="Usuario"
            class="filter-select"

            options-dense
          />
          <q-input v-model="fechaDesde" dense outlined clearable label="Fecha desde"
            class="filter-date" type="date" />
          <q-input v-model="fechaHasta" dense outlined clearable label="Fecha hasta"
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
        dense
        :rows-per-page-options="[12, 25, 50, 100]"
        :rows-per-page="15"
        class="pedidos-table"
      >
        <template #body-cell-valor_servicio="props">
          <q-td :props="props" class="text-right">
            {{ formatCurrency(props.row.valor_servicio) }}
          </q-td>
        </template>

        <template #body-cell-estado="props">
          <q-td :props="props">
            <q-badge
              :color="estadoColor(props.row.estado)"
              :label="props.row.estado"
              class="estado-badge"
            />
          </q-td>
        </template>

        <template #body-cell-area_responsable="props">
          <q-td :props="props">
            <span :class="['area-tag', areaClass(props.row.area_responsable)]">
              {{ props.row.area_responsable }}
            </span>
          </q-td>
        </template>

        <template #no-data>
          <div class="full-width column flex-center text-grey-5 q-pa-xl">
            <q-icon name="business" size="48px" class="q-mb-sm" />
            <span>Sin pedidos de áreas</span>
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

interface PedidoAreaRow {
  id_pedido: number
  nit: string
  nombre: string
  fecha_pedido: string
  fecha_inicio: string
  fecha_final: string
  nro_personas: number
  valor_servicio: number
  auxiliares: string
  usuario: string
  estado: string
  area_responsable: string
}

const $q = useQuasar()

const rows        = ref<PedidoAreaRow[]>([])
const loading     = ref(false)
const search      = ref('')
const filterEstado  = ref<string | null>(null)
const filterArea    = ref<string | null>(null)
const filterUsuario = ref<string | null>(null)
const fechaDesde    = ref('')
const fechaHasta    = ref('')

// Opciones dinámicas derivadas de los datos cargados
const estadoOptions = computed(() =>
  [...new Set(rows.value.map(r => r.estado).filter(Boolean))].sort()
)

const areaOptions = computed(() =>
  [...new Set(rows.value.map(r => r.area_responsable).filter(Boolean))].sort()
)
const usuarioOptions = computed(() =>
  [...new Set(rows.value.map(r => r.usuario).filter(Boolean))].sort()
)

const hasActiveFilters = computed(() =>
  !!search.value || !!filterEstado.value || !!filterArea.value || !!filterUsuario.value ||
  !!fechaDesde.value || !!fechaHasta.value
)

const filtered = computed(() => {
  let result = rows.value

  if (search.value) {
    const q = search.value.toLowerCase()
    result = result.filter(r =>
      `${r.id_pedido ?? ''} ${r.nit ?? ''} ${r.nombre ?? ''}`.toLowerCase().includes(q)
    )
  }

  if (filterEstado.value)
    result = result.filter(r => r.estado === filterEstado.value)

  if (filterArea.value)
    result = result.filter(r => r.area_responsable === filterArea.value)

  if (filterUsuario.value)
    result = result.filter(r => r.usuario === filterUsuario.value)

  if (fechaDesde.value)
    result = result.filter(r => r.fecha_pedido >= fechaDesde.value)

  if (fechaHasta.value)
    result = result.filter(r => r.fecha_pedido <= fechaHasta.value)

  return result
})

function clearFilters() {
  search.value        = ''
  filterEstado.value  = null
  filterArea.value    = null
  filterUsuario.value = null
  fechaDesde.value    = ''
  fechaHasta.value    = ''
}

const columns = [
  { name: 'id_pedido',       label: 'Pedido',          field: 'id_pedido',       align: 'left' as const,   sortable: true },
  { name: 'nit',             label: 'Nit',             field: 'nit',             align: 'left' as const,   sortable: true },
  { name: 'nombre',          label: 'Nombre',          field: 'nombre',          align: 'left' as const,   sortable: true,  style: 'white-space: normal; word-break: break-word; max-width: 500px; min-width: 300px;' },
  { name: 'fecha_pedido',    label: 'Fecha pedido',    field: 'fecha_pedido',    align: 'left' as const,   sortable: true, format: (v: string | null) => formatDate(v) },
  { name: 'fecha_inicio',    label: 'Fecha inicio',    field: 'fecha_inicio',    align: 'left' as const,   sortable: true, format: (v: string | null) => formatDate(v) },
  { name: 'fecha_final',     label: 'Fecha final',     field: 'fecha_final',     align: 'left' as const,   sortable: true, format: (v: string | null) => formatDate(v) },
  { name: 'nro_personas',    label: 'Nro de personas', field: 'nro_personas',    align: 'center' as const, sortable: true },
  { name: 'valor_servicio',  label: 'Valor servicio',  field: 'valor_servicio',  align: 'right' as const,  sortable: true },
  { name: 'auxiliares',      label: 'Auxiliares',      field: 'auxiliares',      align: 'left' as const,   sortable: false },
  { name: 'usuario',         label: 'Usuario',         field: 'usuario',         align: 'left' as const,   sortable: true },
  { name: 'estado',          label: 'Estado',          field: 'estado',          align: 'left' as const,   sortable: true },
  { name: 'area_responsable',label: 'Area Responsable',field: 'area_responsable',align: 'left' as const,   sortable: true },
]

function formatCurrency(val: number | null): string {
  if (val == null) return '—'
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(val)
}

function estadoColor(estado: string): string {
  const e = (estado ?? '').toUpperCase()
  if (e.includes('PROGRAMADO'))                          return 'blue'
  if (e.includes('PENDIENTE'))                           return 'orange'
  if (e.includes('FACTURADO'))                           return 'green'
  if (e.includes('ENVIADO'))                             return 'purple'
  if (e.includes('TERMINO') || e.includes('TÉRMINO'))   return 'grey'
  if (e.includes('ANULADO') || e.includes('CANCELADO')) return 'red'
  return 'grey'
}

function areaClass(area: string): string {
  const a = (area ?? '').toUpperCase()
  if (a.includes('PRESTACI'))                            return 'area-prestacion'
  if (a.includes('HUMANA'))                              return 'area-humana'
  if (a.includes('FACTURA'))                             return 'area-facturacion'
  if (a.includes('TERMINO') || a.includes('TÉRMINO'))   return 'area-termino'
  if (a.includes('RECHAZADO') || a.includes('CANCELADO')) return 'area-rechazado'
  return 'area-default'
}

async function loadData() {
  loading.value = true
  try {
    const { data } = await api.get('/pedidos/areas')
    rows.value = data
  } catch {
    $q.notify({ type: 'negative', message: 'Error al cargar pedidos de áreas' })
  } finally { loading.value = false }
}

onMounted(() => { void loadData() })
</script>

<style lang="scss" scoped>
.pedidos-areas-page { width: 100%; }

.toolbar-section { padding: 12px 16px !important; }

.search-input   { width: 260px; }
.filter-select  { width: 180px; }
.filter-select-wide { width: 220px; }
.filter-date    { width: 150px; }

.estado-badge { font-size: 11px; font-weight: 600; white-space: nowrap; }

.area-tag {
  font-size: 11px; font-weight: 600; white-space: nowrap;
  padding: 2px 6px; border-radius: 4px;
}
.area-prestacion  { color: #00897B; background: #E0F2F1; }
.area-humana      { color: #1565C0; background: #E3F2FD; }
.area-facturacion { color: #2E7D32; background: #E8F5E9; }
.area-termino     { color: #616161; background: #F5F5F5; }
.area-rechazado   { color: #C62828; background: #FFEBEE; }
.area-default     { color: #424242; background: #EEEEEE; }

.pedidos-table {
  :deep(thead tr th) {
    font-weight: 700; font-size: 12px; color: #616161;
    background: #fafafa; text-transform: uppercase; letter-spacing: 0.5px;
  }
  :deep(.q-tr:hover) { background: #f0faf8; }
}
</style>
