<template>
  <q-page class="pedidos-especiales-areas-page q-pa-lg">
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
            v-model="filterTipoEquipo"
            :options="tipoEquipoOptions"
            dense outlined clearable
            label="Tipo equipo"
            class="filter-select"
            options-dense
          />
          <q-select
            v-model="filterTipoServicio"
            :options="tipoServicioOptions"
            dense outlined clearable
            label="Tipo servicio"
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
        class="pedidos-esp-areas-table"
      >
        <template #body-cell-valor_servicio="props">
          <q-td :props="props" class="text-right">
            {{ formatCOP(props.row.valor_servicio) }}
          </q-td>
        </template>

        <template #no-data>
          <div class="full-width column flex-center text-grey-5 q-pa-xl">
            <q-icon name="business" size="48px" class="q-mb-sm" />
            <span>Sin pedidos especiales de áreas</span>
          </div>
        </template>
        <template #loading><q-inner-loading showing color="purple" /></template>
      </q-table>
    </q-card>

  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { api } from 'src/boot/axios'
import { formatDate } from 'src/utils/date'

interface PedidoEspecialAreaRow {
  id_pedido: number
  nit: string
  nombre: string
  ciudad: string | null
  fecha_pedido: string | null
  fecha_asignacion: string | null
  fecha_inicio: string | null
  fecha_final: string | null
  personas: number | null
  dias: number | null
  n_tipo_servicio: string | null
  valor_servicio: number | null
  factura: string | null
  auxiliares: string | null
  tipo_equipo: string | null
  coordinador_operativo: string | null
  observacion: string | null
}

const $q = useQuasar()

const rows              = ref<PedidoEspecialAreaRow[]>([])
const loading           = ref(false)
const search              = ref('')
const filterTipoEquipo    = ref<string | null>(null)
const filterTipoServicio  = ref<string | null>(null)
const fechaDesde          = ref('')
const fechaHasta          = ref('')

// Opciones dinámicas
const tipoEquipoOptions = computed(() =>
  [...new Set(rows.value.map(r => r.tipo_equipo).filter((v): v is string => !!v))].sort()
)
const tipoServicioOptions = computed(() =>
  [...new Set(rows.value.map(r => r.n_tipo_servicio).filter((v): v is string => !!v))].sort()
)

const hasActiveFilters = computed(() =>
  !!search.value || !!filterTipoEquipo.value ||
  !!filterTipoServicio.value || !!fechaDesde.value || !!fechaHasta.value
)

const filtered = computed(() => {
  let result = rows.value

  if (search.value) {
    const q = search.value.toLowerCase()
    result = result.filter(r =>
      `${r.id_pedido ?? ''} ${r.nit ?? ''} ${r.nombre ?? ''} ${r.ciudad ?? ''}`.toLowerCase().includes(q)
    )
  }

  if (filterTipoEquipo.value)   result = result.filter(r => r.tipo_equipo === filterTipoEquipo.value)
  if (filterTipoServicio.value) result = result.filter(r => r.n_tipo_servicio === filterTipoServicio.value)
  if (fechaDesde.value) result = result.filter(r => (r.fecha_pedido ?? '').slice(0, 10) >= fechaDesde.value)
  if (fechaHasta.value) result = result.filter(r => (r.fecha_pedido ?? '').slice(0, 10) <= fechaHasta.value)

  return result
})

function clearFilters() {
  search.value              = ''
  filterTipoEquipo.value    = null
  filterTipoServicio.value  = null
  fechaDesde.value          = ''
  fechaHasta.value          = ''
}

const columns = [
  { name: 'id_pedido',             label: 'Id Pedido',            field: 'id_pedido',             align: 'left' as const,   sortable: true },
  { name: 'nit',                   label: 'Nit',                  field: 'nit',                   align: 'left' as const,   sortable: true },
  { name: 'nombre',                label: 'Nombre',               field: 'nombre',                align: 'left' as const,   sortable: true, style: 'white-space: normal; word-break: break-word; max-width: 500px; min-width: 300px;' },
  { name: 'ciudad',                label: 'Ciudad',               field: 'ciudad',                align: 'left' as const,   sortable: true },
  { name: 'fecha_pedido',          label: 'Fecha Pedido',         field: 'fecha_pedido',          align: 'left' as const,   sortable: true, format: (v: string | null) => formatDate(v) },
  { name: 'fecha_asignacion',      label: 'Fecha Asignacion',     field: 'fecha_asignacion',      align: 'left' as const,   sortable: true, format: (v: string | null) => formatDate(v) },
  { name: 'fecha_inicio',          label: 'Fecha Inicio',         field: 'fecha_inicio',          align: 'left' as const,   sortable: true, format: (v: string | null) => formatDate(v) },
  { name: 'fecha_final',           label: 'Fecha Final',          field: 'fecha_final',           align: 'left' as const,   sortable: true, format: (v: string | null) => formatDate(v) },
  { name: 'personas',              label: 'Personas',             field: 'personas',              align: 'center' as const, sortable: true },
  { name: 'dias',                  label: 'Dias',                 field: 'dias',                  align: 'center' as const, sortable: true },
  { name: 'n_tipo_servicio',       label: 'N Tipo Servicio',      field: 'n_tipo_servicio',       align: 'left' as const,   sortable: true, style: 'white-space: normal; word-break: break-word; max-width: 500px; min-width: 300px;' },
  { name: 'valor_servicio',        label: 'Valor Servicio',       field: 'valor_servicio',        align: 'right' as const,  sortable: true },
  { name: 'factura',               label: 'Factura',              field: 'factura',               align: 'left' as const,   sortable: true },
  { name: 'auxiliares',            label: 'Auxiliares',           field: 'auxiliares',            align: 'left' as const,   sortable: false },
  { name: 'tipo_equipo',           label: 'Tipo Equipo',          field: 'tipo_equipo',           align: 'left' as const,   sortable: true },
  { name: 'coordinador_operativo', label: 'Coordinador Operativo', field: 'coordinador_operativo', align: 'left' as const,   sortable: false },
  { name: 'observacion',           label: 'Observacion',          field: 'observacion',           align: 'left' as const,   sortable: true, style: 'white-space: normal; word-break: break-word; max-width: 500px; min-width: 300px;' },
]

function formatCOP(value: number | null | undefined): string {
  if (value == null) return '—'
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(value)
}

async function loadData() {
  loading.value = true
  try {
    const { data } = await api.get('/pedidos/especiales-areas')
    rows.value = data
  } catch {
    $q.notify({ type: 'negative', message: 'Error al cargar pedidos especiales de áreas' })
  } finally { loading.value = false }
}

onMounted(() => { void loadData() })
</script>

<style lang="scss" scoped>
.pedidos-especiales-areas-page { width: 100%; }

.toolbar-section { padding: 12px 16px !important; }

.search-input  { width: 260px; }
.filter-select { width: 170px; }
.filter-date   { width: 145px; }


.pedidos-esp-areas-table {
  :deep(thead tr th) {
    font-weight: 700; font-size: 12px; color: #fff;
    background: linear-gradient(135deg, #4A148C 0%, #7B1FA2 100%);
    text-transform: uppercase; letter-spacing: 0.5px;
  }
  :deep(.q-tr:hover) { background: #f3e5f5; }
}
</style>
