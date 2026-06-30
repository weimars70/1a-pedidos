<template>
  <q-page class="listado-pedidos-esp-page q-pa-lg">

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
            v-model="filterTipoEquipo"
            :options="tipoEquipoOptions"
            dense outlined clearable
            label="Tipo Equipo"
            class="filter-select"
            options-dense
          />
          <q-select
            v-model="filterTipoServicio"
            :options="tipoServicioOptions"
            dense outlined clearable
            label="Tipo Servicio"
            class="filter-select"
            options-dense
          />
          <q-select
            v-model="filterCoordinador"
            :options="coordinadorOptions"
            dense outlined clearable
            label="Coordinador Operativo"
            class="filter-select-wide"
            options-dense
          />
          <q-select
            v-model="filterNGenero"
            :options="nGeneroOptions"
            dense outlined clearable
            label="N Genero"
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
        row-key="id_equipo"
        flat
        bordered
        dense
        :rows-per-page-options="[12, 25, 50, 100]"
        :rows-per-page="25"
        class="pedidos-esp-table"
      >

        <!-- Acciones -->
        <template #body-cell-acciones="props">
          <q-td :props="props" class="acciones-cell">
            <q-btn flat round dense icon="event" color="purple" size="sm" @click="accionProximamente('Programar')">
              <q-tooltip>Programar</q-tooltip>
            </q-btn>
            <q-btn flat round dense icon="edit" color="indigo" size="sm" @click="accionProximamente('Editar')">
              <q-tooltip>Editar</q-tooltip>
            </q-btn>
            <q-btn flat round dense icon="block" color="negative" size="sm" @click="accionProximamente('Anular')">
              <q-tooltip>Anular</q-tooltip>
            </q-btn>
          </q-td>
        </template>

        <!-- Monedas -->
        <template #body-cell-valor_servicio="props">
          <q-td :props="props" class="text-right">{{ formatCOP(props.row.valor_servicio) }}</q-td>
        </template>
        <template #body-cell-mano_obra="props">
          <q-td :props="props" class="text-right">{{ formatCOP(props.row.mano_obra) }}</q-td>
        </template>
        <template #body-cell-insumos="props">
          <q-td :props="props" class="text-right">{{ formatCOP(props.row.insumos) }}</q-td>
        </template>
        <template #body-cell-transporte="props">
          <q-td :props="props" class="text-right">{{ formatCOP(props.row.transporte) }}</q-td>
        </template>
        <template #body-cell-depreciacion="props">
          <q-td :props="props" class="text-right">{{ formatCOP(props.row.depreciacion) }}</q-td>
        </template>
        <template #body-cell-imprevistos="props">
          <q-td :props="props" class="text-right">{{ formatCOP(props.row.imprevistos) }}</q-td>
        </template>

        <template #no-data>
          <div class="full-width column flex-center text-grey-5 q-pa-xl">
            <q-icon name="star_outline" size="48px" class="q-mb-sm" />
            <span>Sin pedidos especiales</span>
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

interface PedidoEspecialRow {
  id: number
  id_equipo: number | null
  nit: string
  nombre: string
  fecha_pedido: string
  personas_esp: number | null
  dias_esp: number | null
  usuario: string | null
  direccion: string | null
  telefono: string | null
  valor_servicio: number | null
  mano_obra: number | null
  insumos: number | null
  transporte: number | null
  depreciacion: number | null
  imprevistos: number | null
  observacion: string | null
  n_genero: string | null
  tipo_equipo: string | null
  n_tipo_servicio: string | null
  coordinador_operativo: string | null
}

const $q = useQuasar()

const rows              = ref<PedidoEspecialRow[]>([])
const loading           = ref(false)
const search              = ref('')
const filterTipoEquipo    = ref<string | null>(null)
const filterTipoServicio  = ref<string | null>(null)
const filterCoordinador   = ref<string | null>(null)
const filterNGenero       = ref<string | null>(null)
const fechaDesde          = ref('')
const fechaHasta          = ref('')

// Dynamic filter options derived from data
const tipoEquipoOptions = computed<string[]>(() =>
  [...new Set(rows.value.map(r => r.tipo_equipo).filter((v): v is string => !!v))].sort()
)
const tipoServicioOptions = computed<string[]>(() =>
  [...new Set(rows.value.map(r => r.n_tipo_servicio).filter((v): v is string => !!v))].sort()
)
const coordinadorOptions = computed<string[]>(() =>
  [...new Set(rows.value.map(r => r.coordinador_operativo).filter((v): v is string => !!v))].sort()
)
const nGeneroOptions = computed<string[]>(() =>
  [...new Set(rows.value.map(r => r.n_genero).filter((v): v is string => !!v))].sort()
)

const hasActiveFilters = computed(() =>
  !!search.value || !!filterTipoEquipo.value || !!filterTipoServicio.value ||
  !!filterCoordinador.value || !!filterNGenero.value ||
  !!fechaDesde.value || !!fechaHasta.value
)

const filtered = computed(() => {
  let result = rows.value

  if (search.value) {
    const q = search.value.toLowerCase()
    result = result.filter(r =>
      `${r.id ?? ''} ${r.nit ?? ''} ${r.nombre ?? ''}`.toLowerCase().includes(q)
    )
  }
  if (filterTipoEquipo.value)   result = result.filter(r => r.tipo_equipo === filterTipoEquipo.value)
  if (filterTipoServicio.value) result = result.filter(r => r.n_tipo_servicio === filterTipoServicio.value)
  if (filterCoordinador.value)  result = result.filter(r => r.coordinador_operativo === filterCoordinador.value)
  if (filterNGenero.value)      result = result.filter(r => r.n_genero === filterNGenero.value)
  if (fechaDesde.value) result = result.filter(r => (r.fecha_pedido ?? '').slice(0, 10) >= fechaDesde.value)
  if (fechaHasta.value) result = result.filter(r => (r.fecha_pedido ?? '').slice(0, 10) <= fechaHasta.value)

  return result
})

function clearFilters() {
  search.value             = ''
  filterTipoEquipo.value   = null
  filterTipoServicio.value = null
  filterCoordinador.value  = null
  filterNGenero.value      = null
  fechaDesde.value         = ''
  fechaHasta.value         = ''
}

const columns = [
  { name: 'acciones',              label: '',                    field: 'acciones',              align: 'center' as const, sortable: false },
  { name: 'id',                    label: 'Pedido',              field: 'id',                    align: 'left' as const,   sortable: true  },
  { name: 'nit',                   label: 'Nit',                 field: 'nit',                   align: 'left' as const,   sortable: true  },
  { name: 'nombre',                label: 'Nombre',              field: 'nombre',                align: 'left' as const,   sortable: true,  style: 'white-space: normal; word-break: break-word; max-width: 500px; min-width: 300px;' },
  { name: 'fecha_pedido',          label: 'Fecha Pedido',        field: 'fecha_pedido',          align: 'left' as const,   sortable: true, format: (v: string | null) => formatDate(v)  },
  { name: 'personas_esp',          label: 'Personas',            field: 'personas_esp',          align: 'center' as const, sortable: true  },
  { name: 'dias_esp',              label: 'Dias',                field: 'dias_esp',              align: 'center' as const, sortable: true  },
  { name: 'valor_servicio',        label: 'Valor Servicio',      field: 'valor_servicio',        align: 'right' as const,  sortable: true  },
  { name: 'tipo_equipo',           label: 'Tipo Equipo',         field: 'tipo_equipo',           align: 'left' as const,   sortable: true  },
  { name: 'n_tipo_servicio',       label: 'N Tipo Servicio',     field: 'n_tipo_servicio',       align: 'left' as const,   sortable: true,  style: 'white-space: normal; word-break: break-word; max-width: 500px; min-width: 300px;' },
  { name: 'n_genero',              label: 'N Genero',            field: 'n_genero',              align: 'center' as const, sortable: true  },
  { name: 'coordinador_operativo', label: 'Coordinador Operativo', field: 'coordinador_operativo', align: 'left' as const, sortable: true  },
  { name: 'mano_obra',             label: 'Mano Obra',           field: 'mano_obra',             align: 'right' as const,  sortable: true  },
  { name: 'insumos',               label: 'Insumos',             field: 'insumos',               align: 'right' as const,  sortable: true  },
  { name: 'transporte',            label: 'Transporte',          field: 'transporte',            align: 'right' as const,  sortable: true  },
  { name: 'depreciacion',          label: 'Depreciacion',        field: 'depreciacion',          align: 'right' as const,  sortable: true  },
  { name: 'imprevistos',           label: 'Imprevistos',         field: 'imprevistos',           align: 'right' as const,  sortable: true  },
  { name: 'observacion',           label: 'Observacion',         field: 'observacion',           align: 'left' as const,   sortable: false, style: 'white-space: normal; word-break: break-word; max-width: 500px; min-width: 300px;' },
  { name: 'usuario',               label: 'Usuario',             field: 'usuario',               align: 'left' as const,   sortable: true  },
  { name: 'direccion',             label: 'Direccion',           field: 'direccion',             align: 'left' as const,   sortable: false },
  { name: 'telefono',              label: 'Telefono',            field: 'telefono',              align: 'left' as const,   sortable: false },
  { name: 'id_equipo',             label: 'Id',                  field: 'id_equipo',             align: 'left' as const,   sortable: true  },
]

function formatCOP(value: number | null | undefined): string {
  if (value == null) return ''
  return new Intl.NumberFormat('es-CO', {
    style: 'currency', currency: 'COP', minimumFractionDigits: 0, maximumFractionDigits: 0,
  }).format(Number(value))
}

function accionProximamente(accion: string) {
  $q.notify({ type: 'info', message: `${accion}: Próximamente` })
}

async function loadData() {
  loading.value = true
  try {
    const { data } = await api.get('/pedidos/especiales')
    rows.value = data
  } catch {
    $q.notify({ type: 'negative', message: 'Error al cargar pedidos especiales' })
  } finally { loading.value = false }
}

onMounted(() => { void loadData() })
</script>

<style lang="scss" scoped>
.listado-pedidos-esp-page { width: 100%; }

.toolbar-section { padding: 12px 16px !important; }
.search-input  { width: 260px; }
.filter-select      { width: 170px; }
.filter-select-wide { width: 210px; }
.filter-date        { width: 145px; }

.acciones-cell { white-space: nowrap; }

.pedidos-esp-table {
  :deep(thead tr th) {
    font-weight: 700; font-size: 12px; color: #fff;
    background: linear-gradient(135deg, #4A148C 0%, #7B1FA2 100%);
    text-transform: uppercase; letter-spacing: 0.5px;
  }
  :deep(.q-tr:hover) { background: #f3e5f5; }
}
</style>
