<template>
  <q-page class="enviar-coordinador-page q-pa-lg">

    <!-- Header -->
    <div class="page-header q-pa-md q-mb-lg">
      <div class="text-h5 text-white text-weight-bold">Enviar Pedido al Coordinador</div>
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
        :rows-per-page-options="[15, 25, 50, 100]"
        :rows-per-page="25"
        class="enviar-coordinador-table"
      >
        <template #body-cell-valor_servicio="props">
          <q-td :props="props" class="text-right">{{ formatCOP(props.row.valor_servicio) }}</q-td>
        </template>

        <template #body-cell-acciones="props">
          <q-td :props="props">
            <q-btn
              v-if="props.row.enviado_coordinador !== 'S'"
              unelevated dense no-caps
              icon="send"
              label="Enviar"
              color="deep-purple"
              size="sm"
              :loading="sendingId === props.row.id"
              @click="enviarCoordinador(props.row)"
            />
            <q-badge v-else color="teal" label="Enviado" />
          </q-td>
        </template>

        <template #no-data>
          <div class="full-width column flex-center text-grey-5 q-pa-xl">
            <q-icon name="send" size="48px" class="q-mb-sm" />
            <span>Sin pedidos pendientes de envío</span>
          </div>
        </template>
        <template #loading><q-inner-loading showing color="deep-purple" /></template>
      </q-table>
    </q-card>

  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { api } from 'src/boot/axios'
import { formatDate } from 'src/utils/date'

interface PedidoPersonalRow {
  id: number
  id_pedido: number
  nit: string
  nombre: string
  perfil: string
  fecha_inicio: string
  fecha_final: string
  estado: string
  enviado_coordinador: string
  hora_inicio: string
  hora_final: string
  valor_servicio: number | null
}

const $q = useQuasar()

const rows        = ref<PedidoPersonalRow[]>([])
const loading     = ref(false)
const sendingId   = ref<number | null>(null)
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
      `${r.id ?? ''} ${r.id_pedido ?? ''} ${r.nit ?? ''} ${r.nombre ?? ''}`.toLowerCase().includes(q)
    )
  }
  if (filterEstado.value) result = result.filter(r => r.estado === filterEstado.value)
  if (filterPerfil.value) result = result.filter(r => r.perfil === filterPerfil.value)
  if (fechaDesde.value)   result = result.filter(r => r.fecha_inicio >= fechaDesde.value)
  if (fechaHasta.value)   result = result.filter(r => r.fecha_inicio <= fechaHasta.value)
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
  { name: 'id',                  label: 'Id',               field: 'id',                  align: 'left' as const,   sortable: true  },
  { name: 'id_pedido',           label: 'Pedido',           field: 'id_pedido',           align: 'left' as const,   sortable: true  },
  { name: 'nit',                 label: 'Nit',              field: 'nit',                 align: 'left' as const,   sortable: true  },
  { name: 'nombre',              label: 'Nombre',           field: 'nombre',              align: 'left' as const,   sortable: true,  style: 'white-space: normal; word-break: break-word; max-width: 500px; min-width: 300px;' },
  { name: 'perfil',              label: 'Perfil',           field: 'perfil',              align: 'left' as const,   sortable: true,  style: 'white-space: normal; word-break: break-word; max-width: 500px; min-width: 300px;' },
  { name: 'fecha_inicio',        label: 'Fecha Inicio',     field: 'fecha_inicio',        align: 'left' as const,   sortable: true, format: (v: string | null) => formatDate(v)  },
  { name: 'fecha_final',         label: 'Fecha Final',      field: 'fecha_final',         align: 'left' as const,   sortable: true, format: (v: string | null) => formatDate(v)  },
  { name: 'estado',              label: 'Estado',           field: 'estado',              align: 'left' as const,   sortable: true  },
  { name: 'enviado_coordinador', label: 'Env. Coord.',      field: 'enviado_coordinador', align: 'center' as const, sortable: true  },
  { name: 'hora_inicio',         label: 'Hora Inicio',      field: 'hora_inicio',         align: 'center' as const, sortable: false },
  { name: 'hora_final',          label: 'Hora Final',       field: 'hora_final',          align: 'center' as const, sortable: false },
  { name: 'valor_servicio',      label: 'Valor Servicio',   field: 'valor_servicio',      align: 'right' as const,  sortable: true  },
  { name: 'acciones',            label: 'Acción',           field: 'acciones',            align: 'center' as const, sortable: false },
]

function formatCOP(value: number | null | undefined): string {
  if (value == null) return ''
  return new Intl.NumberFormat('es-CO', {
    style: 'currency', currency: 'COP', minimumFractionDigits: 0, maximumFractionDigits: 0,
  }).format(Number(value))
}

async function enviarCoordinador(row: PedidoPersonalRow) {
  sendingId.value = row.id
  try {
    await api.put(`/pedidos/${row.id}/enviar-coordinador`)
    $q.notify({ type: 'positive', message: 'Enviado al coordinador' })
    await loadData()
  } catch {
    $q.notify({ type: 'negative', message: 'Error al enviar al coordinador' })
  } finally {
    sendingId.value = null
  }
}

async function loadData() {
  loading.value = true
  try {
    const { data } = await api.get('/pedidos/personal')
    rows.value = (data as PedidoPersonalRow[]).filter(r => r.enviado_coordinador !== 'S')
  } catch {
    $q.notify({ type: 'negative', message: 'Error al cargar pedidos' })
  } finally { loading.value = false }
}

onMounted(() => { void loadData() })
</script>

<style lang="scss" scoped>
.enviar-coordinador-page { max-width: 1600px; margin: 0 auto; }

.page-header {
  background: linear-gradient(135deg, #4527A0 0%, #7B1FA2 100%);
  border-radius: 12px;
}

.toolbar-section { padding: 12px 16px !important; }
.search-input  { width: 260px; }
.filter-select { width: 170px; }
.filter-date   { width: 145px; }

.enviar-coordinador-table {
  :deep(thead tr th) {
    font-weight: 700; font-size: 12px; color: #616161;
    background: #fafafa; text-transform: uppercase; letter-spacing: 0.5px;
  }
  :deep(.q-tr:hover) { background: #ede7f6; }
}
</style>
