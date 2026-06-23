<template>
  <q-page class="pedidos-esp-prog-page q-pa-lg">
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

        <!-- Fila 2: filtros de fecha -->
        <div class="row items-center q-gutter-sm">
          <q-input v-model="fechaDesde" dense outlined clearable label="Fecha inicio desde"
            class="filter-date" type="date" />
          <q-input v-model="fechaHasta" dense outlined clearable label="Fecha inicio hasta"
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
        row-key="id"
        flat
        bordered
        dense
        :rows-per-page-options="[12, 25, 50, 100]"
        :rows-per-page="25"
        class="pedidos-esp-prog-table"
      >
        <template #body-cell-valor_servicio="props">
          <q-td :props="props" class="text-right">{{ formatCOP(props.row.valor_servicio) }}</q-td>
        </template>

        <template #no-data>
          <div class="full-width column flex-center text-grey-5 q-pa-xl">
            <q-icon name="event_note" size="48px" class="q-mb-sm" />
            <span>Sin pedidos especiales programados</span>
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

interface PedidoEspecialProgramadoRow {
  id: number
  pedido: number
  nit: string
  nombre: string
  fecha_pedido: string | null
  fecha_inicio: string | null
  fecha_final: string | null
  dias: number | null
  personas: number | null
  valor_servicio: number | null
  tipo_equipo: string | null
  coordinador_operativo: string | null
  usuario: string | null
  observacion: string | null
  nro_pedido_fisico: string | null
}

const $q = useQuasar()

const rows       = ref<PedidoEspecialProgramadoRow[]>([])
const loading    = ref(false)
const search     = ref('')
const fechaDesde = ref('')
const fechaHasta = ref('')

const hasActiveFilters = computed(() =>
  !!search.value || !!fechaDesde.value || !!fechaHasta.value
)

const filtered = computed(() => {
  let result = rows.value
  if (search.value) {
    const q = search.value.toLowerCase()
    result = result.filter(r =>
      `${r.pedido ?? ''} ${r.nit ?? ''} ${r.nombre ?? ''} ${r.coordinador_operativo ?? ''} ${r.tipo_equipo ?? ''} ${r.usuario ?? ''}`.toLowerCase().includes(q)
    )
  }
  if (fechaDesde.value) result = result.filter(r => (r.fecha_inicio ?? '').slice(0, 10) >= fechaDesde.value)
  if (fechaHasta.value) result = result.filter(r => (r.fecha_inicio ?? '').slice(0, 10) <= fechaHasta.value)
  return result
})

function clearFilters() {
  search.value     = ''
  fechaDesde.value = ''
  fechaHasta.value = ''
}

const columns = [
  { name: 'pedido',                label: 'Pedido',                field: 'pedido',                align: 'left' as const,   sortable: true  },
  { name: 'nit',                   label: 'Nit',                   field: 'nit',                   align: 'left' as const,   sortable: true  },
  { name: 'nombre',                label: 'Nombre',                field: 'nombre',                align: 'left' as const,   sortable: true,  style: 'white-space: normal; word-break: break-word; max-width: 500px; min-width: 300px;' },
  { name: 'fecha_pedido',          label: 'Fecha Pedido',          field: 'fecha_pedido',          align: 'left' as const,   sortable: true, format: (v: string | null) => formatDate(v)  },
  { name: 'fecha_inicio',          label: 'Fecha Inicio',          field: 'fecha_inicio',          align: 'left' as const,   sortable: true, format: (v: string | null) => formatDate(v)  },
  { name: 'fecha_final',           label: 'Fecha Final',           field: 'fecha_final',           align: 'left' as const,   sortable: true, format: (v: string | null) => formatDate(v)  },
  { name: 'dias',                  label: 'Dias',                  field: 'dias',                  align: 'center' as const, sortable: true  },
  { name: 'personas',              label: 'Personas',              field: 'personas',              align: 'center' as const, sortable: true  },
  { name: 'valor_servicio',        label: 'Valor Servicio',        field: 'valor_servicio',        align: 'right' as const,  sortable: true  },
  { name: 'tipo_equipo',           label: 'Tipo Equipo',           field: 'tipo_equipo',           align: 'left' as const,   sortable: true  },
  { name: 'coordinador_operativo', label: 'Coordinador Operativo', field: 'coordinador_operativo', align: 'left' as const,   sortable: true  },
  { name: 'usuario',               label: 'Usuario',               field: 'usuario',               align: 'left' as const,   sortable: true  },
  { name: 'observacion',           label: 'Observación',           field: 'observacion',           align: 'left' as const,   sortable: false, style: 'white-space: normal; word-break: break-word; max-width: 500px; min-width: 300px;' },
  { name: 'nro_pedido_fisico',     label: 'Nro Pedido Fisico',     field: 'nro_pedido_fisico',     align: 'left' as const,   sortable: true  },
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
    const { data } = await api.get('/pedidos/especiales-programados')
    rows.value = data
  } catch {
    $q.notify({ type: 'negative', message: 'Error al cargar pedidos especiales programados' })
  } finally { loading.value = false }
}

onMounted(() => { void loadData() })
</script>

<style lang="scss" scoped>
.pedidos-esp-prog-page { width: 100%; }

.toolbar-section { padding: 12px 16px !important; }
.search-input  { width: 260px; }
.filter-date   { width: 165px; }

.pedidos-esp-prog-table {
  :deep(thead tr th) {
    font-weight: 700; font-size: 12px; color: #616161;
    background: #fafafa; text-transform: uppercase; letter-spacing: 0.5px;
  }
  :deep(.q-tr:hover) { background: #f3e5f5; }
}
</style>
