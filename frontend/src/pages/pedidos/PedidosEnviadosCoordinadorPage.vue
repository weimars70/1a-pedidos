<template>
  <q-page class="pedidos-enviados-coordinador-page q-pa-lg">

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
          <q-input v-model="fechaDesde" dense outlined clearable label="Desde"
            class="filter-date" type="date" />
          <q-input v-model="fechaHasta" dense outlined clearable label="Hasta"
            class="filter-date" type="date" />
        </div>

      </q-card-section>
    </q-card>

    <!-- Dialogo de impresión -->
    <PrintPedidoPersonal v-model="showPrint" :data="printData" />

    <!-- Table -->
    <q-card flat bordered>
      <q-table
        :rows="filtered"
        :columns="columns"
        :loading="loading"
        row-key="id"
        flat
        bordered
        dense
        :rows-per-page-options="[12, 25, 50, 100]"
        :rows-per-page="25"
        class="pedidos-enviados-table"
      >
        <!-- Col 1: Imprimir -->
        <template #body-cell-imprimir="props">
          <q-td :props="props" class="text-center">
            <q-btn flat dense round icon="print" color="teal" size="sm" @click="openPrint(props.row)">
              <q-tooltip>Imprimir</q-tooltip>
            </q-btn>
          </q-td>
        </template>

        <template #body-cell-valor_servicio="props">
          <q-td :props="props" class="text-right">{{ formatCOP(props.row.valor_servicio) }}</q-td>
        </template>

        <template #body-cell-bonificacion="props">
          <q-td :props="props" class="text-right">{{ formatCOP(props.row.bonificacion) }}</q-td>
        </template>

        <template #body-cell-total_servicio="props">
          <q-td :props="props" class="text-right">{{ formatCOP(props.row.total_servicio) }}</q-td>
        </template>

        <template #no-data>
          <div class="full-width column flex-center text-grey-5 q-pa-xl">
            <q-icon name="send" size="48px" class="q-mb-sm" />
            <span>Sin pedidos enviados al coordinador</span>
          </div>
        </template>
        <template #loading><q-inner-loading showing color="teal" /></template>
      </q-table>
    </q-card>

  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { api } from 'src/boot/axios'
import { formatDate } from 'src/utils/date'
import PrintPedidoPersonal from 'src/components/pedidos/PrintPedidoPersonal.vue'

interface PedidoEnviadoCoordinadorRow {
  id: number
  pedido: number
  perfil: string | null
  nit: string
  nombre: string
  asesor: string | null
  fecha_pedido: string | null
  fecha_inicio: string | null
  fecha_final: string | null
  no_personas: number | null
  sexo: string | null
  estado: string | null
  usuario: number | null
  observaciones: string | null
  riesgo_arl: number | null
  per_recomendacion: string | null
  valor_servicio: number | null
  bonificacion: number | null
  total_servicio: number | null
  faltante: number | null
  tipo_servicio: string | null
  contacto: string | null
  telefono: string | null
}

const $q = useQuasar()

const showPrint   = ref(false)
const printData   = ref<PedidoEnviadoCoordinadorRow | null>(null)

function openPrint(row: PedidoEnviadoCoordinadorRow) {
  printData.value = row
  showPrint.value = true
}

const rows        = ref<PedidoEnviadoCoordinadorRow[]>([])
const loading     = ref(false)
const search      = ref('')
const filterEstado = ref<string | null>(null)
const filterPerfil = ref<string | null>(null)
const fechaDesde  = ref('')
const fechaHasta  = ref('')

const estadoOptions = computed(() =>
  [...new Set(rows.value.map(r => r.estado).filter(Boolean))].sort()
)
const perfilOptions = computed(() =>
  [...new Set(rows.value.map(r => r.perfil).filter(Boolean))].sort()
)

const hasActiveFilters = computed(() =>
  !!search.value || !!filterEstado.value || !!filterPerfil.value ||
  !!fechaDesde.value || !!fechaHasta.value
)

const filtered = computed(() => {
  let result = rows.value
  if (search.value) {
    const q = search.value.toLowerCase()
    result = result.filter(r =>
      `${r.id ?? ''} ${r.pedido ?? ''} ${r.nit ?? ''} ${r.nombre ?? ''} ${r.asesor ?? ''} ${r.contacto ?? ''}`.toLowerCase().includes(q)
    )
  }
  if (filterEstado.value) result = result.filter(r => r.estado === filterEstado.value)
  if (filterPerfil.value) result = result.filter(r => r.perfil === filterPerfil.value)
  if (fechaDesde.value)   result = result.filter(r => (r.fecha_inicio ?? '') >= fechaDesde.value)
  if (fechaHasta.value)   result = result.filter(r => (r.fecha_inicio ?? '') <= fechaHasta.value)
  return result
})

function clearFilters() {
  search.value       = ''
  filterEstado.value = null
  filterPerfil.value = null
  fechaDesde.value   = ''
  fechaHasta.value   = ''
}

const columns = [
  // Col 1: Imprimir (sin campo real — solo botón visual)
  { name: 'imprimir',         label: 'Imp.',           field: 'imprimir',         align: 'center' as const, sortable: false },
  { name: 'id',               label: 'Id',             field: 'id',               align: 'left' as const,   sortable: true  },
  { name: 'pedido',           label: 'Pedido',         field: 'pedido',           align: 'left' as const,   sortable: true  },
  { name: 'perfil',           label: 'Perfil',         field: 'perfil',           align: 'left' as const,   sortable: true  },
  { name: 'nit',              label: 'Nit',            field: 'nit',              align: 'left' as const,   sortable: true  },
  { name: 'nombre',           label: 'Nombre',         field: 'nombre',           align: 'left' as const,   sortable: true,
    style: 'white-space: normal; word-break: break-word; max-width: 500px; min-width: 300px;' },
  { name: 'asesor',           label: 'Asesor',         field: 'asesor',           align: 'left' as const,   sortable: true  },
  { name: 'fecha_pedido',     label: 'F. Pedido',      field: 'fecha_pedido',     align: 'left' as const,   sortable: true,
    format: (v: string | null) => formatDate(v) },
  { name: 'fecha_inicio',     label: 'F. Inicio',      field: 'fecha_inicio',     align: 'left' as const,   sortable: true,
    format: (v: string | null) => formatDate(v) },
  { name: 'fecha_final',      label: 'F. Final',       field: 'fecha_final',      align: 'left' as const,   sortable: true,
    format: (v: string | null) => formatDate(v) },
  { name: 'no_personas',      label: 'Personas',       field: 'no_personas',      align: 'center' as const, sortable: true  },
  { name: 'sexo',             label: 'Sexo',           field: 'sexo',             align: 'left' as const,   sortable: true  },
  { name: 'estado',           label: 'Estado',         field: 'estado',           align: 'left' as const,   sortable: true  },
  { name: 'usuario',          label: 'Usuario',        field: 'usuario',          align: 'left' as const,   sortable: true  },
  { name: 'observaciones',    label: 'Observaciones',  field: 'observaciones',    align: 'left' as const,   sortable: false,
    style: 'white-space: normal; word-break: break-word; max-width: 500px; min-width: 300px;' },
  { name: 'riesgo_arl',       label: 'Riesgo ARL',     field: 'riesgo_arl',       align: 'center' as const, sortable: true  },
  { name: 'per_recomendacion', label: 'Per. Recomen.', field: 'per_recomendacion', align: 'left' as const,  sortable: false },
  { name: 'valor_servicio',   label: 'Valor Servicio', field: 'valor_servicio',   align: 'right' as const,  sortable: true  },
  { name: 'bonificacion',     label: 'Bonificacion',   field: 'bonificacion',     align: 'right' as const,  sortable: true  },
  { name: 'total_servicio',   label: 'Total Servicio', field: 'total_servicio',   align: 'right' as const,  sortable: true  },
  { name: 'faltante',         label: 'Faltante',       field: 'faltante',         align: 'center' as const, sortable: true  },
  { name: 'tipo_servicio',    label: 'Tipo Servicio',  field: 'tipo_servicio',    align: 'left' as const,   sortable: true  },
  { name: 'contacto',         label: 'Contacto',       field: 'contacto',         align: 'left' as const,   sortable: true  },
  { name: 'telefono',         label: 'Teléfono',       field: 'telefono',         align: 'left' as const,   sortable: true  },
]

function formatCOP(value: number | null | undefined): string {
  if (value == null) return ''
  return new Intl.NumberFormat('es-CO', {
    style: 'currency', currency: 'COP', minimumFractionDigits: 0, maximumFractionDigits: 0,
  }).format(Number(value))
}

async function loadData() {
  loading.value = true
  try {
    const { data } = await api.get('/pedidos/enviados-coordinador')
    rows.value = data
  } catch {
    $q.notify({ type: 'negative', message: 'Error al cargar pedidos enviados al coordinador' })
  } finally { loading.value = false }
}

onMounted(() => { void loadData() })
</script>

<style lang="scss" scoped>
.pedidos-enviados-coordinador-page { width: 100%; }

.toolbar-section { padding: 12px 16px !important; }
.search-input  { width: 260px; }
.filter-select { width: 170px; }
.filter-date   { width: 145px; }

.pedidos-enviados-table {
  :deep(thead tr th) {
    font-weight: 700; font-size: 12px; color: #616161;
    background: #fafafa; text-transform: uppercase; letter-spacing: 0.5px;
  }
  :deep(.q-tr:hover) { background: #e0f7fa; }
}
</style>
