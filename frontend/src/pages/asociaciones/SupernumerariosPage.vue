<template>
  <q-page class="supernumerarios-page q-pa-lg">
    <!-- Page header -->
    <div class="page-header q-mb-lg">
      <div class="page-title-area">
        <q-icon name="people_alt" color="primary" size="28px" class="q-mr-sm" />
        <h5 class="q-ma-none text-weight-bold text-grey-9">Supernumerarios</h5>
      </div>
    </div>
    <!-- Form card -->
    <q-card flat bordered class="q-mb-md shadow-2">
      <q-card-section class="form-section">
        <div class="row q-col-gutter-md items-end">
          <!-- Auxiliar -->
          <div class="col-12 col-sm-5">
            <q-select
              v-model="form.id_auxiliar"
              label="Auxiliar"
              :options="field1FilteredOptions"
              option-value="value"
              option-label="label"
              emit-value
              map-options
              use-input
              input-debounce="0"
              outlined
              dense
              color="teal-9"
              clearable
              @filter="(val, update) => filterOptions(val, update, 'field1')"
            >
              <template #prepend>
                <q-icon name="person" color="teal-9" size="18px" />
              </template>
              <template #no-option>
                <q-item>
                  <q-item-section class="text-grey">Sin resultados</q-item-section>
                </q-item>
              </template>
            </q-select>
          </div>

          <!-- Supernumerario -->
          <div class="col-12 col-sm-5">
            <q-select
              v-model="form.id_supernumerario"
              label="Supernumerario"
              :options="field2FilteredOptions"
              option-value="value"
              option-label="label"
              emit-value
              map-options
              use-input
              input-debounce="0"
              outlined
              dense
              color="teal-9"
              clearable
              @filter="(val, update) => filterOptions(val, update, 'field2')"
            >
              <template #prepend>
                <q-icon name="link" color="teal-9" size="18px" />
              </template>
              <template #no-option>
                <q-item>
                  <q-item-section class="text-grey">Sin resultados</q-item-section>
                </q-item>
              </template>
            </q-select>
          </div>

          <!-- Submit button -->
          <div class="col-12 col-sm-2">
            <q-btn
              unelevated
              no-caps
              label="ASOCIAR"
              icon="add_link"
              class="full-width asociar-btn"
              :loading="saving"
              :disable="!form.id_auxiliar || !form.id_supernumerario"
              @click="associate"
            />
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Table card -->
    <q-card flat bordered class="shadow-2">
      <!-- Table toolbar -->
      <q-card-section class="table-toolbar">
        <div class="row items-center justify-between q-col-gutter-sm">
          <div class="col-auto">
            <span class="text-caption text-grey-6 text-weight-medium">
              {{ filteredRows.length }} registro{{ filteredRows.length !== 1 ? 's' : '' }}
            </span>
          </div>

          <!-- Filter by auxiliar -->
          <div class="col-12 col-sm-auto">
            <q-select
              v-model="filterAuxiliar"
              :options="auxiliarOptions"
              label="Filtrar por Auxiliar"
              outlined
              dense
              clearable
              emit-value
              map-options
              style="min-width: 220px"
              color="teal-9"
            >
              <template #prepend>
                <q-icon name="filter_list" color="grey-5" size="16px" />
              </template>
            </q-select>
          </div>

          <!-- Quick search -->
          <div class="col-12 col-sm-auto">
            <q-input
              v-model="tableSearch"
              dense
              outlined
              placeholder="Búsqueda rápida..."
              clearable
              style="min-width: 220px"
            >
              <template #prepend>
                <q-icon name="search" color="grey-5" size="16px" />
              </template>
            </q-input>
          </div>

          <div class="col-auto">
            <q-btn flat dense round icon="refresh" color="grey-7" :loading="loading" @click="loadData">
              <q-tooltip>Actualizar</q-tooltip>
            </q-btn>
          </div>
        </div>
      </q-card-section>

      <q-table
        :rows="filteredRows"
        :columns="tableColumns"
        :loading="loading"
        row-key="row_key"
        flat
        dense
        bordered
        :rows-per-page-options="[12, 25, 50, 100, 0]"
        :rows-per-page="50"
        class="supernumerarios-table"
      >
        <!-- Teal header -->
        <template #header="props">
          <q-tr :props="props" class="teal-header">
            <q-th
              v-for="col in props.cols"
              :key="col.name"
              :props="props"
            >
              {{ col.label }}
            </q-th>
          </q-tr>
        </template>

        <!-- Actions column -->
        <template #body-cell-actions="props">
          <q-td :props="props" class="actions-cell">
            <q-btn
              flat
              round
              dense
              icon="delete"
              color="negative"
              size="sm"
              :loading="deletingKey === props.row.row_key"
              @click="confirmDelete(props.row)"
            >
              <q-tooltip>Eliminar asociación</q-tooltip>
            </q-btn>
          </q-td>
        </template>

        <!-- Sexo chip -->
        <template #body-cell-n_sexo="props">
          <q-td :props="props">
            <q-chip
              dense
              :color="props.row.sexo === 1 ? 'blue-2' : 'pink-2'"
              :text-color="props.row.sexo === 1 ? 'blue-9' : 'pink-9'"
              size="sm"
              class="q-ma-none"
            >
              {{ props.row.n_sexo }}
            </q-chip>
          </q-td>
        </template>

        <template #no-data>
          <div class="full-width column flex-center text-grey-5 q-pa-xl">
            <q-icon name="link_off" size="48px" class="q-mb-sm" />
            <span>Sin asociaciones registradas</span>
          </div>
        </template>

        <template #loading>
          <q-inner-loading showing color="teal-9" />
        </template>
      </q-table>
    </q-card>

    <!-- Delete confirm dialog -->
    <q-dialog v-model="showDelete">
      <q-card style="min-width: 340px">
        <q-card-section class="row items-center q-pa-lg">
          <q-avatar icon="warning" color="negative" text-color="white" />
          <span class="q-ml-sm">¿Eliminar esta asociación?</span>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat no-caps label="Cancelar" v-close-popup />
          <q-btn
            unelevated
            no-caps
            label="Eliminar"
            color="negative"
            :loading="deleting"
            @click="doDelete"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive } from 'vue'
import { useQuasar } from 'quasar'
import { api } from 'src/boot/axios'

interface SelectOption {
  value: string | number
  label: string
}

interface SupernumerarioRow {
  id_auxiliar: string
  nombre_auxiliar: string
  id_supernumerario: string
  nombre_supernumerario: string
  sexo: number
  n_sexo: string
  activo: boolean
  row_key: string
}

const $q = useQuasar()

// Options for the form dropdowns
const field1Options = ref<SelectOption[]>([])
const field2Options = ref<SelectOption[]>([])
const field1FilteredOptions = ref<SelectOption[]>([])
const field2FilteredOptions = ref<SelectOption[]>([])

// Table state
const rows = ref<SupernumerarioRow[]>([])
const loading = ref(false)
const tableSearch = ref('')
const filterAuxiliar = ref<string | null>(null)

// Form state
const form = reactive({
  id_auxiliar: null as string | null,
  id_supernumerario: null as string | null,
})
const saving = ref(false)

// Delete state
const showDelete = ref(false)
const deletingRow = ref<SupernumerarioRow | null>(null)
const deletingKey = ref<string | null>(null)
const deleting = ref(false)

// Table columns — 5 data columns + actions
const tableColumns = [
  {
    name: 'actions',
    label: '',
    field: 'actions',
    align: 'center' as const,
    sortable: false,
    style: 'width: 56px',
  },
  {
    name: 'id_auxiliar',
    label: 'CC Auxiliar',
    field: 'id_auxiliar',
    sortable: true,
    align: 'left' as const,
    style: 'width: 120px',
  },
  {
    name: 'nombre_auxiliar',
    label: 'Nombre Auxiliar',
    field: 'nombre_auxiliar',
    sortable: true,
    align: 'left' as const,
  },
  {
    name: 'id_supernumerario',
    label: 'CC Supernumerario',
    field: 'id_supernumerario',
    sortable: true,
    align: 'left' as const,
    style: 'width: 140px',
  },
  {
    name: 'nombre_supernumerario',
    label: 'Nombre Supernumerario',
    field: 'nombre_supernumerario',
    sortable: true,
    align: 'left' as const,
  },
  {
    name: 'n_sexo',
    label: 'Sexo',
    field: 'n_sexo',
    sortable: true,
    align: 'center' as const,
    style: 'width: 100px',
  },
]

// Unique auxiliar options for sidebar filter
const auxiliarOptions = computed(() => {
  const seen = new Set<string>()
  const opts: SelectOption[] = []
  for (const row of rows.value) {
    if (!seen.has(row.id_auxiliar)) {
      seen.add(row.id_auxiliar)
      opts.push({ value: row.id_auxiliar, label: row.nombre_auxiliar?.trim() || row.id_auxiliar })
    }
  }
  return opts.sort((a, b) => String(a.label).localeCompare(String(b.label)))
})

const filteredRows = computed(() => {
  let data = rows.value
  if (filterAuxiliar.value) {
    data = data.filter(r => r.id_auxiliar === filterAuxiliar.value)
  }
  if (tableSearch.value) {
    const q = tableSearch.value.toLowerCase()
    data = data.filter(r =>
      r.id_auxiliar?.toLowerCase().includes(q) ||
      r.nombre_auxiliar?.toLowerCase().includes(q) ||
      r.id_supernumerario?.toLowerCase().includes(q) ||
      r.nombre_supernumerario?.toLowerCase().includes(q) ||
      r.n_sexo?.toLowerCase().includes(q)
    )
  }
  return data
})

function filterOptions(val: string, update: (fn: () => void) => void, which: 'field1' | 'field2') {
  update(() => {
    const source = which === 'field1' ? field1Options.value : field2Options.value
    const target = which === 'field1' ? field1FilteredOptions : field2FilteredOptions
    if (!val) {
      target.value = source
    } else {
      const q = val.toLowerCase()
      target.value = source.filter(o => String(o.label).toLowerCase().includes(q))
    }
  })
}

async function loadOptions() {
  try {
    const [r1, r2] = await Promise.all([
      api.get('/asociaciones/options/empleados'),
      api.get('/asociaciones/options/empleados'),
    ])
    field1Options.value = r1.data
    field1FilteredOptions.value = r1.data
    field2Options.value = r2.data
    field2FilteredOptions.value = r2.data
  } catch {
    $q.notify({ type: 'negative', message: 'Error al cargar opciones', icon: 'error' })
  }
}

async function loadData() {
  loading.value = true
  try {
    const { data } = await api.get('/asociaciones/supernumerarios')
    rows.value = (data as SupernumerarioRow[]).map(r => ({
      ...r,
      nombre_auxiliar: r.nombre_auxiliar?.trim() ?? '',
      nombre_supernumerario: r.nombre_supernumerario?.trim() ?? '',
      row_key: `${r.id_auxiliar}_${r.id_supernumerario}`,
    }))
  } catch {
    $q.notify({ type: 'negative', message: 'Error al cargar datos', icon: 'error' })
  } finally {
    loading.value = false
  }
}

async function associate() {
  if (!form.id_auxiliar || !form.id_supernumerario) return
  saving.value = true
  try {
    await api.post('/asociaciones/supernumerarios', {
      id_auxiliar: form.id_auxiliar,
      id_supernumerario: form.id_supernumerario,
    })
    $q.notify({ type: 'positive', message: 'Asociación creada', icon: 'check_circle' })
    form.id_auxiliar = null
    form.id_supernumerario = null
    await loadData()
  } catch (e: unknown) {
    const err = e as { response?: { data?: { message?: string } } }
    $q.notify({
      type: 'negative',
      message: err.response?.data?.message ?? 'Error al asociar',
      icon: 'error',
    })
  } finally {
    saving.value = false
  }
}

function confirmDelete(row: SupernumerarioRow) {
  deletingRow.value = row
  showDelete.value = true
}

async function doDelete() {
  if (!deletingRow.value) return
  deleting.value = true
  deletingKey.value = deletingRow.value.row_key
  try {
    await api.delete(
      `/asociaciones/supernumerarios/${deletingRow.value.id_auxiliar}/${deletingRow.value.id_supernumerario}`
    )
    $q.notify({ type: 'positive', message: 'Asociación eliminada' })
    showDelete.value = false
    rows.value = rows.value.filter(r => r.row_key !== deletingKey.value)
  } catch {
    $q.notify({ type: 'negative', message: 'Error al eliminar', icon: 'error' })
  } finally {
    deleting.value = false
    deletingKey.value = null
  }
}

onMounted(async () => {
  await Promise.all([loadOptions(), loadData()])
})
</script>

<style lang="scss" scoped>
.supernumerarios-page {
  width: 100%;
}

.form-section {
  padding: 20px 24px !important;
}

.asociar-btn {
  background: #0F5A52 !important;
  color: white !important;
  font-weight: 600;
  letter-spacing: 0.5px;
  height: 40px;
}

.table-toolbar {
  padding: 12px 16px !important;
  border-bottom: 1px solid #f0f0f0;
}

.supernumerarios-table {
  border-radius: 0 !important;

  :deep(.teal-header th) {
    background: #00695C !important;
    color: white !important;
    font-weight: 700;
    font-size: 12px;
    letter-spacing: 0.5px;
    text-transform: uppercase;
    padding: 10px 12px;
  }

  :deep(.q-tr:hover) {
    background: #f0faf8;
  }

  :deep(td) {
    font-size: 13px;
  }
}

.actions-cell {
  width: 56px;
  white-space: nowrap;
}
</style>
