<template>
  <q-page class="listado-pedidos-page q-pa-lg">

    <!-- Header -->
    <div class="page-header q-pa-md q-mb-lg">
      <div class="text-h5 text-white text-weight-bold">Listado de Pedidos</div>
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
            option-value="value"
            option-label="label"
            emit-value
            map-options
            dense outlined clearable
            label="Estado"
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
        class="listado-pedidos-table"
      >
        <template #body-cell-valor_servicio="props">
          <q-td :props="props">
            {{ formatCOP(props.row.valor_servicio) }}
          </q-td>
        </template>

        <template #body-cell-estado="props">
          <q-td :props="props">
            <q-badge
              :color="estadoColor(props.row.estado)"
              :label="estadoOptions.find(o => o.value === props.row.estado)?.label ?? props.row.estado ?? '—'"
              class="estado-badge"
            />
          </q-td>
        </template>

        <template #no-data>
          <div class="full-width column flex-center text-grey-5 q-pa-xl">
            <q-icon name="shopping_cart" size="48px" class="q-mb-sm" />
            <span>Sin pedidos registrados</span>
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

interface PedidoRow {
  pedido: number
  perfil: string | null
  nit: string
  nombre: string
  fecha_pedido: string
  fecha_inicio: string | null
  fecha_final: string | null
  hora_inicio: string | null
  hora_final: string | null
  nro_personas: number | null
  faltante: number | null
  sexo: string | null
  tipo_servicio: string | null
  valor_servicio: number | null
  asesor: string | null
  auxiliares: string | null
  riesgo_arl: number | null
  per_recomendacion: string | null
  bonificacion: number | null
  observaciones: string | null
  usuario: string | null
  estado: number | null
  id_sexo: number | null
}

const $q = useQuasar()

const rows             = ref<PedidoRow[]>([])
const loading          = ref(false)
const search           = ref('')
const filterEstado     = ref<number | null>(null)
const fechaDesde       = ref('')
const fechaHasta       = ref('')

const estadoOptions = [
  { label: 'Pendiente',          value: 1 },
  { label: 'Programado',         value: 2 },
  { label: 'Cancelado/Anulado',  value: 3 },
  { label: 'Facturado',          value: 5 },
  { label: 'Enviado Coordinador',value: 6 },
]

const hasActiveFilters = computed(() =>
  !!search.value || filterEstado.value != null ||
  !!fechaDesde.value || !!fechaHasta.value
)

const filtered = computed(() => {
  let result = rows.value

  if (search.value) {
    const q = search.value.toLowerCase()
    result = result.filter(r =>
      `${r.pedido ?? ''} ${r.nit ?? ''} ${r.nombre ?? ''}`.toLowerCase().includes(q)
    )
  }
  if (filterEstado.value != null) result = result.filter(r => r.estado === filterEstado.value)
  if (fechaDesde.value)           result = result.filter(r => (r.fecha_inicio ?? '') >= fechaDesde.value)
  if (fechaHasta.value)           result = result.filter(r => (r.fecha_inicio ?? '') <= fechaHasta.value)

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

function estadoColor(estado: number | string | null | undefined): string {
  const map: Record<number, string> = {
    1: 'orange', 2: 'blue', 3: 'red', 5: 'green', 6: 'purple'
  }
  if (typeof estado === 'number') return map[estado] ?? 'grey'
  const s = String(estado ?? '').toUpperCase()
  if (s.includes('CANCEL') || s.includes('ANUL')) return 'red'
  if (s.includes('FACTUR')) return 'green'
  if (s.includes('PEND')) return 'orange'
  if (s.includes('COORD')) return 'purple'
  return 'grey'
}

const columns = [
  { name: 'pedido',            label: 'Pedido',                  field: 'pedido',            align: 'left' as const,   sortable: true },
  { name: 'perfil',            label: 'Perfil',                  field: 'perfil',            align: 'left' as const,   sortable: true },
  { name: 'nit',               label: 'Nit',                     field: 'nit',               align: 'left' as const,   sortable: true },
  { name: 'nombre',            label: 'Nombre',                  field: 'nombre',            align: 'left' as const,   sortable: true, style: 'white-space: normal; word-break: break-word; max-width: 400px; min-width: 200px;' },
  { name: 'fecha_pedido',      label: 'Fecha Pedido',            field: 'fecha_pedido',      align: 'left' as const,   sortable: true, format: (v: string | null) => formatDate(v) },
  { name: 'fecha_inicio',      label: 'Fecha Inicio',            field: 'fecha_inicio',      align: 'left' as const,   sortable: true, format: (v: string | null) => formatDate(v) },
  { name: 'fecha_final',       label: 'Fecha Final',             field: 'fecha_final',       align: 'left' as const,   sortable: true, format: (v: string | null) => formatDate(v) },
  { name: 'hora_inicio',       label: 'Hora Inicio',             field: 'hora_inicio',       align: 'left' as const,   sortable: true },
  { name: 'hora_final',        label: 'Hora Final',              field: 'hora_final',        align: 'left' as const,   sortable: true },
  { name: 'nro_personas',      label: 'Nro de Personas',         field: 'nro_personas',      align: 'center' as const, sortable: true },
  { name: 'faltante',          label: 'Faltante',                field: 'faltante',          align: 'center' as const, sortable: true },
  { name: 'sexo',              label: 'Sexo',                    field: 'sexo',              align: 'left' as const,   sortable: true },
  { name: 'tipo_servicio',     label: 'Tipo Servicio',           field: 'tipo_servicio',     align: 'left' as const,   sortable: true },
  { name: 'valor_servicio',    label: 'Valor Servicio',          field: 'valor_servicio',    align: 'right' as const,  sortable: true },
  { name: 'asesor',            label: 'Asesor',                  field: 'asesor',            align: 'left' as const,   sortable: true },
  { name: 'auxiliares',        label: 'Auxiliares',              field: 'auxiliares',        align: 'left' as const,   sortable: false },
  { name: 'riesgo_arl',        label: 'Riesgo ARL',              field: 'riesgo_arl',        align: 'center' as const, sortable: true },
  { name: 'per_recomendacion', label: 'Personas con Recomendación', field: 'per_recomendacion', align: 'left' as const, sortable: false },
  { name: 'bonificacion',      label: 'Bonificación',            field: 'bonificacion',      align: 'right' as const,  sortable: true },
  { name: 'observaciones',     label: 'Observaciones',           field: 'observaciones',     align: 'left' as const,   sortable: false, style: 'white-space: normal; word-break: break-word; max-width: 300px;' },
  { name: 'usuario',           label: 'Usuario',                 field: 'usuario',           align: 'left' as const,   sortable: true },
  { name: 'estado',            label: 'Estado',                  field: 'estado',            align: 'left' as const,   sortable: true },
  { name: 'id_sexo',           label: 'Id Sexo',                 field: 'id_sexo',           align: 'center' as const, sortable: true },
]

async function loadData() {
  loading.value = true
  try {
    const { data } = await api.get('/pedidos')
    rows.value = data
  } catch {
    $q.notify({ type: 'negative', message: 'Error al cargar pedidos' })
  } finally { loading.value = false }
}

onMounted(() => { void loadData() })
</script>

<style lang="scss" scoped>
.listado-pedidos-page { max-width: 1600px; margin: 0 auto; }

.page-header {
  background: linear-gradient(135deg, #263238 0%, #455A64 100%);
  border-radius: 12px;
}

.toolbar-section { padding: 12px 16px !important; }
.search-input  { width: 260px; }
.filter-select { width: 170px; }
.filter-date   { width: 145px; }

.estado-badge { font-size: 11px; font-weight: 600; white-space: nowrap; }

.listado-pedidos-table {
  :deep(thead tr th) {
    font-weight: 700; font-size: 12px; color: #616161;
    background: #fafafa; text-transform: uppercase; letter-spacing: 0.5px;
  }
  :deep(.q-tr:hover) { background: #f5f7f8; }
}
</style>
