<template>
  <q-page class="pedidos-programados-page q-pa-lg">
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
        row-key="id"
        flat
        bordered
        dense
        :rows-per-page-options="[12, 25, 50, 100]"
        :rows-per-page="15"
        class="pedidos-programados-table"
      >
        <!-- Columna Imprimir -->
        <template #body-cell-accion_imprimir="props">
          <q-td :props="props" class="text-center">
            <q-btn flat dense round icon="print" color="teal-7" size="sm"
              @click="onImprimir(props.row)">
              <q-tooltip>Imprimir</q-tooltip>
            </q-btn>
          </q-td>
        </template>

        <!-- Columna Anular -->
        <template #body-cell-accion_anular="props">
          <q-td :props="props" class="text-center">
            <q-btn flat dense round icon="cancel" color="red-7" size="sm"
              @click="onAnular(props.row)">
              <q-tooltip>Anular</q-tooltip>
            </q-btn>
          </q-td>
        </template>

        <template #body-cell-estado_nombre="props">
          <q-td :props="props">
            <q-badge color="blue" :label="props.row.estado_nombre" class="estado-badge" />
          </q-td>
        </template>

        <template #body-cell-tipo_servicio_nombre="props">
          <q-td :props="props">
            <q-badge
              :color="(props.row.tipo_servicio_nombre ?? '').toUpperCase() === 'FIJO' ? 'teal' : 'blue-grey'"
              :label="props.row.tipo_servicio_nombre"
              outline
              class="tipo-badge"
            />
          </q-td>
        </template>

        <template #body-cell-valor_servicio="props">
          <q-td :props="props" class="text-right">
            {{ formatCOP(props.row.valor_servicio) }}
          </q-td>
        </template>

        <template #body-cell-bonificacion="props">
          <q-td :props="props" class="text-right">
            {{ formatCOP(props.row.bonificacion) }}
          </q-td>
        </template>

        <template #no-data>
          <div class="full-width column flex-center text-grey-5 q-pa-xl">
            <q-icon name="event" size="48px" class="q-mb-sm" />
            <span>Sin pedidos programados</span>
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

interface PedidoProgramadoRow {
  id: number
  id_pedido: number
  perfil: string
  nit: string
  nombre: string
  asesor: string
  fecha_pedido: string
  fecha_inicio: string
  fecha_final: string
  nro_personas: number | null
  sexo_nombre: string
  estado_nombre: string
  usuario_pedido: string
  observaciones: string
  riesgo_arl: number | null
  per_recomendacion: string
  valor_servicio: number | null
  bonificacion: number | null
  faltante: string | null
  tipo_servicio_nombre: string
}

const $q = useQuasar()

const rows          = ref<PedidoProgramadoRow[]>([])
const loading       = ref(false)
const search        = ref('')
const filterPerfil  = ref<string | null>(null)
const filterAsesor  = ref<string | null>(null)
const fechaDesde    = ref('')
const fechaHasta    = ref('')

const perfilOptions = computed(() =>
  [...new Set(rows.value.map(r => r.perfil).filter(Boolean))].sort()
)
const asesorOptions = computed(() =>
  [...new Set(rows.value.map(r => r.asesor).filter(Boolean))].sort()
)

const hasActiveFilters = computed(() =>
  !!search.value || !!filterPerfil.value || !!filterAsesor.value ||
  !!fechaDesde.value || !!fechaHasta.value
)

const filtered = computed(() => {
  let result = rows.value

  if (search.value) {
    const q = search.value.toLowerCase()
    result = result.filter(r =>
      `${r.id_pedido ?? ''} ${r.nit ?? ''} ${r.nombre ?? ''} ${r.asesor ?? ''}`.toLowerCase().includes(q)
    )
  }
  if (filterPerfil.value)  result = result.filter(r => r.perfil === filterPerfil.value)
  if (filterAsesor.value)  result = result.filter(r => r.asesor === filterAsesor.value)
  if (fechaDesde.value)    result = result.filter(r => r.fecha_inicio >= fechaDesde.value)
  if (fechaHasta.value)    result = result.filter(r => r.fecha_inicio <= fechaHasta.value)

  return result
})

function clearFilters() {
  search.value       = ''
  filterPerfil.value = null
  filterAsesor.value = null
  fechaDesde.value   = ''
  fechaHasta.value   = ''
}

function formatCOP(value: number | null | undefined): string {
  if (value == null) return '—'
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(value)
}

function onImprimir(row: PedidoProgramadoRow) {
  $q.notify({ type: 'info', message: `Imprimir pedido #${row.id_pedido}` })
}

function onAnular(row: PedidoProgramadoRow) {
  $q.dialog({
    title: 'Anular pedido',
    message: `¿Desea anular el pedido #${row.id_pedido} (${row.nombre})? Esta acción cambiará el estado a Anulado.`,
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    try {
      await api.put(`/pedidos/${row.id}/anular`)
      $q.notify({ type: 'positive', message: 'Pedido anulado correctamente' })
      void loadData()
    } catch {
      $q.notify({ type: 'negative', message: 'Error al anular el pedido' })
    }
  })
}

// Columnas en el orden exacto requerido
const columns = [
  { name: 'accion_imprimir',     label: 'Imprimir',               field: 'id',                    align: 'center' as const, sortable: false },
  { name: 'accion_anular',       label: 'Anular',                 field: 'id',                    align: 'center' as const, sortable: false },
  { name: 'id_pedido',           label: 'Pedido',                 field: 'id_pedido',              align: 'left' as const,   sortable: true },
  { name: 'perfil',              label: 'Perfil',                 field: 'perfil',                 align: 'left' as const,   sortable: true, style: 'white-space: normal; word-break: break-word; max-width: 500px; min-width: 300px;' },
  { name: 'nit',                 label: 'Nit',                    field: 'nit',                    align: 'left' as const,   sortable: true },
  { name: 'nombre',              label: 'Nombre',                 field: 'nombre',                 align: 'left' as const,   sortable: true, style: 'white-space: normal; word-break: break-word; max-width: 500px; min-width: 300px;' },
  { name: 'asesor',              label: 'Asesor',                 field: 'asesor',                 align: 'left' as const,   sortable: true },
  { name: 'fecha_pedido',        label: 'Fecha Pedido',           field: 'fecha_pedido',           align: 'left' as const,   sortable: true, format: (v: string | null) => formatDate(v) },
  { name: 'fecha_inicio',        label: 'Fecha Inicio',           field: 'fecha_inicio',           align: 'left' as const,   sortable: true, format: (v: string | null) => formatDate(v) },
  { name: 'fecha_final',         label: 'Fecha Final',            field: 'fecha_final',            align: 'left' as const,   sortable: true, format: (v: string | null) => formatDate(v) },
  { name: 'nro_personas',        label: 'No Personas',            field: 'nro_personas',           align: 'center' as const, sortable: true },
  { name: 'sexo_nombre',         label: 'Sexo',                   field: 'sexo_nombre',            align: 'left' as const,   sortable: true },
  { name: 'estado_nombre',       label: 'Estado',                 field: 'estado_nombre',          align: 'left' as const,   sortable: true },
  { name: 'usuario_pedido',      label: 'Usuario',                field: 'usuario_pedido',         align: 'left' as const,   sortable: true },
  { name: 'observaciones',       label: 'Observaciones',          field: 'observaciones',          align: 'left' as const,   sortable: false, style: 'white-space: normal; word-break: break-word; max-width: 500px; min-width: 300px;' },
  { name: 'riesgo_arl',          label: 'Riesgo ARL',             field: 'riesgo_arl',             align: 'center' as const, sortable: false },
  { name: 'per_recomendacion',   label: 'Personal Recomendación', field: 'per_recomendacion',      align: 'center' as const, sortable: false },
  { name: 'valor_servicio',      label: 'Valor Servicio',         field: 'valor_servicio',         align: 'right' as const,  sortable: true },
  { name: 'bonificacion',        label: 'Bonificación',           field: 'bonificacion',           align: 'right' as const,  sortable: true },
  { name: 'faltante',            label: 'Faltante',               field: 'faltante',               align: 'center' as const, sortable: false },
  { name: 'tipo_servicio_nombre', label: 'Tipo Servicio',         field: 'tipo_servicio_nombre',   align: 'left' as const,   sortable: true },
]

async function loadData() {
  loading.value = true
  try {
    const { data } = await api.get('/pedidos/personal-programados')
    rows.value = data
  } catch {
    $q.notify({ type: 'negative', message: 'Error al cargar pedidos programados' })
  } finally { loading.value = false }
}

onMounted(() => { void loadData() })
</script>

<style lang="scss" scoped>
.pedidos-programados-page { width: 100%; }

.toolbar-section { padding: 12px 16px !important; }
.search-input  { width: 260px; }
.filter-select { width: 170px; }
.filter-date   { width: 145px; }

.estado-badge { font-size: 11px; font-weight: 600; white-space: nowrap; }
.tipo-badge   { font-size: 11px; font-weight: 600; }

.pedidos-programados-table {
  :deep(thead tr th) {
    font-weight: 700; font-size: 12px; color: #616161;
    background: #fafafa; text-transform: uppercase; letter-spacing: 0.5px;
  }
  :deep(.q-tr:hover) { background: #e3f2fd; }
}
</style>
