<template>
  <q-page class="pedidos-a-facturar-page q-pa-lg">
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
        v-model:selected="selected"
        selection="multiple"
        flat
        bordered
        dense
        :rows-per-page-options="[12, 25, 50, 100]"
        :rows-per-page="15"
        class="pedidos-a-facturar-table"
      >
        <!-- Valor Servicio -->
        <template #body-cell-valor_servicio="props">
          <q-td :props="props" class="text-right">
            {{ formatCOP(props.row.valor_servicio) }}
          </q-td>
        </template>

        <!-- Bonificacion -->
        <template #body-cell-bonificacion="props">
          <q-td :props="props" class="text-right">
            {{ formatCOP(props.row.bonificacion) }}
          </q-td>
        </template>

        <!-- Total Servicio -->
        <template #body-cell-total_servicio="props">
          <q-td :props="props" class="text-right">
            {{ formatCOP(props.row.total_servicio) }}
          </q-td>
        </template>

        <template #no-data>
          <div class="full-width column flex-center text-grey-5 q-pa-xl">
            <q-icon name="pending_actions" size="48px" class="q-mb-sm" />
            <span>Sin pedidos pendientes de facturación</span>
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

interface PedidoAFacturarRow {
  id: number
  id_pedido: number | null
  perfil: string | null
  nit: string
  nombre: string
  tipo_servicio: string | null
  fecha_pedido: string | null
  fecha_liberacion: string | null
  fecha_inicio: string | null
  fecha_final: string | null
  nro_personas: number | null
  valor_servicio: number | null
  bonificacion: number | null
  total_servicio: number | null
  registrado: string | null
  observaciones: string | null
  usuario_anula: string | null
  hora_pedido: string | null
  asesor: string | null
  id_cliente: number | null
  area: string | null
  pedido_anterior: string | null
}

const $q = useQuasar()

const rows          = ref<PedidoAFacturarRow[]>([])
const selected      = ref<PedidoAFacturarRow[]>([])
const loading       = ref(false)
const search        = ref('')
const fechaDesde    = ref('')
const fechaHasta    = ref('')

const hasActiveFilters = computed(() =>
  !!search.value || !!fechaDesde.value || !!fechaHasta.value
)

const filtered = computed(() => {
  let result = rows.value

  if (search.value) {
    const q = search.value.toLowerCase()
    result = result.filter(r =>
      `${r.id ?? ''} ${r.id_pedido ?? ''} ${r.nit ?? ''} ${r.nombre ?? ''} ${r.perfil ?? ''}`.toLowerCase().includes(q)
    )
  }
  if (fechaDesde.value) result = result.filter(r => (r.fecha_inicio ?? '') >= fechaDesde.value)
  if (fechaHasta.value) result = result.filter(r => (r.fecha_inicio ?? '') <= fechaHasta.value)

  return result
})

function clearFilters() {
  search.value   = ''
  fechaDesde.value = ''
  fechaHasta.value = ''
}

function formatCOP(value: number | null | undefined): string {
  if (value == null) return '—'
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(value)
}

// Columnas en el orden exacto requerido (22 columnas):
// 1. Id
// 2. Pedido
// 3. Perfil
// 4. Nit
// 5. Nombre
// 6. Tipo Servicio
// 7. Fecha Pedido
// 8. Fecha Liberacion
// 9. Fecha Inicio
// 10. Fecha Final
// 11. Numero Personas
// 12. Valor Servicio
// 13. Bonificacion
// 14. Total Servicio
// 15. Registrado
// 16. Observaciones
// 17. Usuario Anula
// 18. Hora Pedido
// 19. Asesor
// 20. Id Cliente
// 21. Area
// 22. Pedido Anterior
const columns = [
  { name: 'id',              label: 'Id',              field: 'id',              align: 'left'   as const, sortable: true },
  { name: 'id_pedido',       label: 'Pedido',          field: 'id_pedido',       align: 'left'   as const, sortable: true },
  { name: 'perfil',          label: 'Perfil',          field: 'perfil',          align: 'left'   as const, sortable: true },
  { name: 'nit',             label: 'Nit',             field: 'nit',             align: 'left'   as const, sortable: true },
  { name: 'nombre',          label: 'Nombre',          field: 'nombre',          align: 'left'   as const, sortable: true, style: 'white-space: normal; word-break: break-word; max-width: 500px; min-width: 300px;' },
  { name: 'tipo_servicio',   label: 'Tipo Servicio',   field: 'tipo_servicio',   align: 'left'   as const, sortable: true },
  { name: 'fecha_pedido',    label: 'Fecha Pedido',    field: 'fecha_pedido',    align: 'left'   as const, sortable: true, format: (v: string | null) => formatDate(v) },
  { name: 'fecha_liberacion',label: 'Fecha Liberacion',field: 'fecha_liberacion',align: 'left'   as const, sortable: true, format: (v: string | null) => formatDate(v) },
  { name: 'fecha_inicio',    label: 'Fecha Inicio',    field: 'fecha_inicio',    align: 'left'   as const, sortable: true, format: (v: string | null) => formatDate(v) },
  { name: 'fecha_final',     label: 'Fecha Final',     field: 'fecha_final',     align: 'left'   as const, sortable: true, format: (v: string | null) => formatDate(v) },
  { name: 'nro_personas',    label: 'Numero Personas', field: 'nro_personas',    align: 'center' as const, sortable: true },
  { name: 'valor_servicio',  label: 'Valor Servicio',  field: 'valor_servicio',  align: 'right'  as const, sortable: true },
  { name: 'bonificacion',    label: 'Bonificacion',    field: 'bonificacion',    align: 'right'  as const, sortable: true },
  { name: 'total_servicio',  label: 'Total Servicio',  field: 'total_servicio',  align: 'right'  as const, sortable: true },
  { name: 'registrado',      label: 'Registrado',      field: 'registrado',      align: 'left'   as const, sortable: true },
  { name: 'observaciones',   label: 'Observaciones',   field: 'observaciones',   align: 'left'   as const, sortable: true, style: 'white-space: normal; word-break: break-word; max-width: 500px; min-width: 300px;' },
  { name: 'usuario_anula',   label: 'Usuario Anula',   field: 'usuario_anula',   align: 'left'   as const, sortable: true },
  { name: 'hora_pedido',     label: 'Hora Pedido',     field: 'hora_pedido',     align: 'left'   as const, sortable: true },
  { name: 'asesor',          label: 'Asesor',          field: 'asesor',          align: 'left'   as const, sortable: true },
  { name: 'id_cliente',      label: 'Id Cliente',      field: 'id_cliente',      align: 'center' as const, sortable: true },
  { name: 'area',            label: 'Area',            field: 'area',            align: 'left'   as const, sortable: true },
  { name: 'pedido_anterior', label: 'Pedido Anterior', field: 'pedido_anterior', align: 'left'   as const, sortable: true },
]

async function loadData() {
  loading.value = true
  try {
    const { data } = await api.get('/pedidos/a-facturar')
    rows.value = data
  } catch {
    $q.notify({ type: 'negative', message: 'Error al cargar pedidos a facturar' })
  } finally { loading.value = false }
}

onMounted(() => { void loadData() })
</script>

<style lang="scss" scoped>
.pedidos-a-facturar-page { width: 100%; }

.toolbar-section { padding: 12px 16px !important; }
.search-input  { width: 260px; }
.filter-date   { width: 145px; }

.pedidos-a-facturar-table {
  :deep(thead tr th) {
    font-weight: 700; font-size: 12px; color: #616161;
    background: #fafafa; text-transform: uppercase; letter-spacing: 0.5px;
  }
  :deep(.q-tr:hover) { background: #fff8f0; }
}
</style>
