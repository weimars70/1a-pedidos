<template>
  <q-page class="asociacion-page q-pa-lg">

    <!-- Form card -->
    <q-card flat bordered class="q-mb-md shadow-2">
      <q-card-section class="form-section">
        <div class="row q-col-gutter-md items-end">
          <!-- Field 1 -->
          <div class="col-12 col-sm-5">
            <q-select
              v-model="form.field1Value"
              :label="field1.label"
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
              @update:model-value="form.field1Filter = ''"
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

          <!-- Field 2 -->
          <div class="col-12 col-sm-5">
            <q-select
              v-model="form.field2Value"
              :label="field2.label"
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
              @update:model-value="form.field2Filter = ''"
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
              :disable="!form.field1Value || !form.field2Value"
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
          <div class="col-12 col-sm-auto">
            <q-input
              v-model="tableSearch"
              dense
              outlined
              placeholder="Filtrar tabla..."
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
        :row-key="rowKey"
        flat
        dense
        bordered
        :rows-per-page-options="[12, 25, 50, 100, 0]"
        :rows-per-page="12"
        class="asociacion-table"
      >
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
              :loading="deletingKey === getRowKey(props.row)"
              @click="confirmDelete(props.row)"
            >
              <q-tooltip>Eliminar asociación</q-tooltip>
            </q-btn>
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

interface FieldConfig {
  key: string
  label: string
  optionsEndpoint: string
  displayKey: string
}

interface SelectOption {
  value: string | number
  label: string
}

const props = defineProps<{
  title: string
  icon: string
  endpoint: string
  field1: FieldConfig
  field2: FieldConfig
}>()

const $q = useQuasar()

// Options state
const field1Options = ref<SelectOption[]>([])
const field2Options = ref<SelectOption[]>([])
const field1FilteredOptions = ref<SelectOption[]>([])
const field2FilteredOptions = ref<SelectOption[]>([])

// Table state
const rows = ref<Record<string, unknown>[]>([])
const loading = ref(false)
const tableSearch = ref('')

// Form state
const form = reactive({
  field1Value: null as string | number | null,
  field1Filter: '',
  field2Value: null as string | number | null,
  field2Filter: '',
})
const saving = ref(false)

// Delete state
const showDelete = ref(false)
const deletingRow = ref<Record<string, unknown> | null>(null)
const deletingKey = ref<string | null>(null)
const deleting = ref(false)

// Table columns
const tableColumns = computed(() => [
  {
    name: 'actions',
    label: '',
    field: 'actions',
    align: 'center' as const,
    sortable: false,
    style: 'width: 60px',
  },
  {
    name: 'field1',
    label: props.field1.label,
    field: (row: Record<string, unknown>) => row[props.field1.displayKey] ?? row[props.field1.key],
    sortable: true,
    align: 'left' as const,
  },
  {
    name: 'field2',
    label: props.field2.label,
    field: (row: Record<string, unknown>) => row[props.field2.displayKey] ?? row[props.field2.key],
    sortable: true,
    align: 'left' as const,
  },
])

function getRowKey(row: Record<string, unknown>): string {
  return `${row[props.field1.key]}_${row[props.field2.key]}`
}

const rowKey = computed(() => (row: Record<string, unknown>) => getRowKey(row))

const filteredRows = computed(() => {
  if (!tableSearch.value) return rows.value
  const q = tableSearch.value.toLowerCase()
  return rows.value.filter(row => {
    const v1 = String(row[props.field1.displayKey] ?? row[props.field1.key] ?? '').toLowerCase()
    const v2 = String(row[props.field2.displayKey] ?? row[props.field2.key] ?? '').toLowerCase()
    return v1.includes(q) || v2.includes(q)
  })
})

function filterOptions(
  val: string,
  update: (fn: () => void) => void,
  which: 'field1' | 'field2'
) {
  update(() => {
    const source = which === 'field1' ? field1Options.value : field2Options.value
    const target = which === 'field1' ? field1FilteredOptions : field2FilteredOptions
    if (!val) {
      target.value = source
    } else {
      const q = val.toLowerCase()
      target.value = source.filter(o => o.label.toLowerCase().includes(q))
    }
  })
}

async function loadOptions() {
  try {
    const r1 = await api.get(`/asociaciones/options/${props.field1.optionsEndpoint}`)
    const arr1 = Array.isArray(r1.data) ? r1.data : (r1.data?.rows ?? [])
    field1Options.value = arr1
    field1FilteredOptions.value = [...arr1]
  } catch {
    $q.notify({ type: 'negative', message: `Error al cargar opciones de ${props.field1.label}`, icon: 'error' })
  }
  try {
    const r2 = await api.get(`/asociaciones/options/${props.field2.optionsEndpoint}`)
    const arr2 = Array.isArray(r2.data) ? r2.data : (r2.data?.rows ?? [])
    field2Options.value = arr2
    field2FilteredOptions.value = [...arr2]
  } catch {
    $q.notify({ type: 'negative', message: `Error al cargar opciones de ${props.field2.label}`, icon: 'error' })
  }
}

async function loadData() {
  loading.value = true
  try {
    const { data } = await api.get(`/asociaciones/${props.endpoint}`)
    rows.value = data
  } catch {
    $q.notify({ type: 'negative', message: 'Error al cargar datos', icon: 'error' })
  } finally {
    loading.value = false
  }
}

async function associate() {
  if (!form.field1Value || !form.field2Value) return
  saving.value = true
  try {
    const body = {
      [props.field1.key]: form.field1Value,
      [props.field2.key]: form.field2Value,
    }
    await api.post(`/asociaciones/${props.endpoint}`, body)
    $q.notify({ type: 'positive', message: 'Asociación creada', icon: 'check_circle' })
    form.field1Value = null
    form.field2Value = null
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

function confirmDelete(row: Record<string, unknown>) {
  deletingRow.value = row
  showDelete.value = true
}

async function doDelete() {
  if (!deletingRow.value) return
  deleting.value = true
  deletingKey.value = getRowKey(deletingRow.value)
  try {
    const val1 = deletingRow.value[props.field1.key]
    const val2 = deletingRow.value[props.field2.key]
    await api.delete(`/asociaciones/${props.endpoint}/${val1}/${val2}`)
    $q.notify({ type: 'positive', message: 'Asociación eliminada' })
    showDelete.value = false
    rows.value = rows.value.filter(r => getRowKey(r) !== deletingKey.value)
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
.asociacion-page { width: 100%; }

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

.asociacion-table {
  border-radius: 0 !important;

  :deep(thead tr th) {
    font-weight: 700;
    font-size: 12px;
    color: #616161;
    background: #fafafa;
    letter-spacing: 0.5px;
    text-transform: uppercase;
  }

  :deep(.q-tr:hover) {
    background: #f0faf8;
  }
}

.actions-cell {
  width: 60px;
  white-space: nowrap;
}
</style>
