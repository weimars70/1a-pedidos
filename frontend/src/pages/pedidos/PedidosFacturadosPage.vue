<template>
  <q-page class="pedidos-facturados-page q-pa-lg">

    <!-- Header -->
    <div class="page-header q-pa-md q-mb-lg">
      <div class="text-h5 text-white text-weight-bold">Pedidos Facturados</div>
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

        <!-- Fila 2: filtros -->
        <div class="row items-center q-gutter-sm">
          <q-select
            v-model="filterEstado"
            :options="estadoOptions"
            dense outlined clearable
            label="Facturado"
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
        row-key="pedido"
        flat
        bordered
        dense
        :rows-per-page-options="[15, 25, 50, 100]"
        :rows-per-page="15"
        class="pedidos-facturados-table"
      >
        <template #body-cell-valor_servicio="props">
          <q-td :props="props">
            {{ formatCOP(props.row.valor_servicio) }}
          </q-td>
        </template>

        <template #body-cell-total_servicio="props">
          <q-td :props="props">
            {{ formatCOP(props.row.total_servicio) }}
          </q-td>
        </template>

        <template #body-cell-facturado="props">
          <q-td :props="props" style="text-align: center;">
            <q-select
              v-model="props.row.facturado"
              :options="['Si', 'No']"
              dense
              outlined
              options-dense
              style="min-width: 75px;"
              @update:model-value="(val) => patchFacturado(props.row.id_pedido_personal, val)"
            />
          </q-td>
        </template>

        <template #no-data>
          <div class="full-width column flex-center text-grey-5 q-pa-xl">
            <q-icon name="receipt" size="48px" class="q-mb-sm" />
            <span>Sin pedidos facturados</span>
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

interface PedidoFacturadoRow {
  pedido: number
  id_pedido_personal: number
  perfil: string
  nit: string
  nombre: string
  tipo_servicio: string
  fecha_pedido: string
  fecha_inicio: string
  fecha_final: string
  nro_personas: number | null
  valor_servicio: number | null
  total_servicio: number | null
  observaciones: string
  facturado: string
}

const $q = useQuasar()

const rows          = ref<PedidoFacturadoRow[]>([])
const loading       = ref(false)
const search        = ref('')
const filterEstado  = ref<string | null>(null)
const fechaDesde    = ref('')
const fechaHasta    = ref('')

const estadoOptions = computed(() =>
  [...new Set(rows.value.map(r => r.facturado).filter(Boolean))].sort()
)

const hasActiveFilters = computed(() =>
  !!search.value || !!filterEstado.value || !!fechaDesde.value || !!fechaHasta.value
)

const filtered = computed(() => {
  let result = rows.value

  if (search.value) {
    const q = search.value.toLowerCase()
    result = result.filter(r =>
      `${r.pedido ?? ''} ${r.nit ?? ''} ${r.nombre ?? ''} ${r.perfil ?? ''}`.toLowerCase().includes(q)
    )
  }
  if (filterEstado.value) result = result.filter(r => r.facturado === filterEstado.value)
  if (fechaDesde.value)   result = result.filter(r => r.fecha_inicio >= fechaDesde.value)
  if (fechaHasta.value)   result = result.filter(r => r.fecha_inicio <= fechaHasta.value)

  return result
})

function clearFilters() {
  search.value       = ''
  filterEstado.value = null
  fechaDesde.value   = ''
  fechaHasta.value   = ''
}

function formatCOP(value: number | null | undefined): string {
  if (value == null) return '—'
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(value)
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

const columns = [
  { name: 'pedido',          label: 'Pedido',          field: 'pedido',          align: 'left' as const,   sortable: true },
  { name: 'perfil',          label: 'Perfil',          field: 'perfil',          align: 'left' as const,   sortable: true, style: 'white-space: normal; word-break: break-word; max-width: 500px; min-width: 300px;' },
  { name: 'nit',             label: 'Nit',             field: 'nit',             align: 'left' as const,   sortable: true },
  { name: 'nombre',          label: 'Nombre',          field: 'nombre',          align: 'left' as const,   sortable: true, style: 'white-space: normal; word-break: break-word; max-width: 500px; min-width: 300px;' },
  { name: 'tipo_servicio',   label: 'Tipo Servicio',   field: 'tipo_servicio',   align: 'left' as const,   sortable: true },
  { name: 'fecha_pedido',    label: 'Fecha Pedido',    field: 'fecha_pedido',    align: 'left' as const,   sortable: true, format: (v: string | null) => formatDate(v) },
  { name: 'fecha_inicio',    label: 'Fecha Inicio',    field: 'fecha_inicio',    align: 'left' as const,   sortable: true, format: (v: string | null) => formatDate(v) },
  { name: 'fecha_final',     label: 'Fecha Final',     field: 'fecha_final',     align: 'left' as const,   sortable: true, format: (v: string | null) => formatDate(v) },
  { name: 'nro_personas',    label: 'N° Personas',     field: 'nro_personas',    align: 'center' as const, sortable: true },
  { name: 'valor_servicio',  label: 'Valor Servicio',  field: 'valor_servicio',  align: 'right' as const,  sortable: true },
  { name: 'total_servicio',  label: 'Total Servicio',  field: 'total_servicio',  align: 'right' as const,  sortable: true },
  { name: 'observaciones',   label: 'Observaciones',   field: 'observaciones',   align: 'left' as const,   sortable: false, style: 'white-space: normal; word-break: break-word; max-width: 500px; min-width: 300px;' },
  { name: 'facturado',       label: 'Facturado',       field: 'facturado',       align: 'center' as const, sortable: true },
]

async function patchFacturado(idPedidoPersonal: number, facturado: string) {
  try {
    await api.patch(`/pedidos/${idPedidoPersonal}/facturado`, { facturado })
    $q.notify({ type: 'positive', message: `Facturado actualizado a "${facturado}"` })
  } catch {
    $q.notify({ type: 'negative', message: 'Error al actualizar facturado' })
    void loadData()
  }
}

async function loadData() {
  loading.value = true
  try {
    const { data } = await api.get('/pedidos/facturados')
    rows.value = data
  } catch {
    $q.notify({ type: 'negative', message: 'Error al cargar pedidos facturados' })
  } finally { loading.value = false }
}

onMounted(() => { void loadData() })
</script>

<style lang="scss" scoped>
.pedidos-facturados-page { max-width: 1600px; margin: 0 auto; }

.page-header {
  background: linear-gradient(135deg, #1B5E20 0%, #2E7D32 100%);
  border-radius: 12px;
}

.toolbar-section { padding: 12px 16px !important; }
.search-input  { width: 260px; }
.filter-select { width: 170px; }
.filter-date   { width: 145px; }

.estado-badge { font-size: 11px; font-weight: 600; white-space: nowrap; }

.pedidos-facturados-table {
  :deep(thead tr th) {
    font-weight: 700; font-size: 12px; color: #616161;
    background: #fafafa; text-transform: uppercase; letter-spacing: 0.5px;
  }
  :deep(.q-tr:hover) { background: #f0faf0; }
}
</style>
