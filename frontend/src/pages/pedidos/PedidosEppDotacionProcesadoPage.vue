<template>
  <q-page class="pedidos-epp-dotacion-procesado-page q-pa-lg">
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
            v-model="filterPerfil"
            :options="perfilOptions"
            dense outlined clearable
            label="Perfil"
            class="filter-select"
            options-dense
          />
        </div>

      </q-card-section>
    </q-card>

    <!-- Table -->
    <q-card flat bordered>
      <q-table
        :rows="filtered"
        :columns="columns"
        :loading="loading"
        row-key="id_ped_dot_epp"
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
        <template #body-cell-bonificacion="props">
          <q-td :props="props" class="text-right bonificacion-cell">
            {{ formatCurrency(props.row.bonificacion) }}
          </q-td>
        </template>
        <template #body-cell-total="props">
          <q-td :props="props" class="text-right text-weight-bold">
            {{ formatCurrency((props.row.valor_servicio ?? 0) + (props.row.bonificacion ?? 0)) }}
          </q-td>
        </template>

        <template #no-data>
          <div class="full-width column flex-center text-grey-5 q-pa-xl">
            <q-icon name="inventory_2" size="48px" class="q-mb-sm" />
            <span>Sin pedidos EPP Dotación procesados</span>
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

interface EppDotacionProcesadoRow {
  id_ped_dot_epp: number
  id_pedido: number
  nit: string
  nombre: string
  ident_empleado: string
  nombre_empleado: string
  perfil: string
  fecha_pedido: string
  fecha_inicio: string
  fecha_final: string
  valor_servicio: number
  bonificacion: number
}

const $q = useQuasar()

const rows         = ref<EppDotacionProcesadoRow[]>([])
const loading      = ref(false)
const search       = ref('')
const filterPerfil = ref<string | null>(null)

const perfilOptions = computed(() =>
  [...new Set(rows.value.map(r => r.perfil).filter(Boolean))].sort()
    
)

const hasActiveFilters = computed(() =>
  !!search.value || !!filterPerfil.value
)

const filtered = computed(() => {
  let result = rows.value
  if (search.value) {
    const q = search.value.toLowerCase()
    result = result.filter(r =>
      `${r.id_pedido ?? ''} ${r.nit ?? ''} ${r.nombre ?? ''}`.toLowerCase().includes(q)
    )
  }
  if (filterPerfil.value) result = result.filter(r => r.perfil === filterPerfil.value)
  return result
})

function clearFilters() {
  search.value       = ''
  filterPerfil.value = null
}

const columns = [
  { name: 'id_pedido',       label: 'Id Pedido',       field: 'id_pedido',       align: 'left' as const,  sortable: true },
  { name: 'nit',             label: 'Nit',             field: 'nit',             align: 'left' as const,  sortable: true },
  { name: 'nombre',          label: 'Nombre',          field: 'nombre',          align: 'left' as const,  sortable: true, style: 'white-space: normal; word-break: break-word; max-width: 500px; min-width: 300px;' },
  { name: 'ident_empleado',  label: 'Ident Empleado',  field: 'ident_empleado',  align: 'left' as const,  sortable: true },
  { name: 'nombre_empleado', label: 'Nombre Empleado', field: 'nombre_empleado', align: 'left' as const,  sortable: true, style: 'white-space: normal; word-break: break-word; max-width: 500px; min-width: 300px;' },
  { name: 'perfil',          label: 'Perfil',          field: 'perfil',          align: 'left' as const,  sortable: true },
  { name: 'fecha_pedido',    label: 'Fecha Pedido',    field: 'fecha_pedido',    align: 'left' as const,  sortable: true, format: (v: string | null) => formatDate(v) },
  { name: 'fecha_inicio',    label: 'Fecha Inicio',    field: 'fecha_inicio',    align: 'left' as const,  sortable: true, format: (v: string | null) => formatDate(v) },
  { name: 'fecha_final',     label: 'Fecha Final',     field: 'fecha_final',     align: 'left' as const,  sortable: true, format: (v: string | null) => formatDate(v) },
  { name: 'valor_servicio',  label: 'Valor Servicio',  field: 'valor_servicio',  align: 'right' as const, sortable: true },
  { name: 'bonificacion',    label: 'Bonificacion',    field: 'bonificacion',    align: 'right' as const, sortable: true },
  { name: 'total',           label: 'Total',           field: 'total',           align: 'right' as const, sortable: false },
]

function formatCurrency(val: number | null): string {
  if (val == null) return '—'
  return new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 }).format(val)
}

async function loadData() {
  loading.value = true
  try {
    const { data } = await api.get('/pedidos/epp-dotacion-procesado')
    rows.value = data
  } catch {
    $q.notify({ type: 'negative', message: 'Error al cargar pedidos EPP Dotación Procesado' })
  } finally { loading.value = false }
}

onMounted(() => { void loadData() })
</script>

<style lang="scss" scoped>
.pedidos-epp-dotacion-procesado-page { width: 100%; }

.toolbar-section { padding: 12px 16px !important; }
.search-input  { width: 260px; }
.filter-select { width: 170px; }

.bonificacion-cell { color: #C62828; }

.pedidos-table {
  :deep(thead tr th) {
    font-weight: 700; font-size: 12px; color: #616161;
    background: #fafafa; text-transform: uppercase; letter-spacing: 0.5px;
  }
  :deep(.q-tr:hover) { background: #f0faf8; }
}
</style>
