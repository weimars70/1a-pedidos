<template>
  <q-page class="maestro-page q-pa-lg">

    <!-- Toolbar -->
    <q-card flat bordered class="q-mb-md">
      <q-card-section class="toolbar-section">
        <div class="toolbar-left">
          <!-- Quick search -->
          <q-input
            v-model="quickSearch"
            dense
            outlined
            placeholder="Búsqueda rápida..."
            class="search-input"
            clearable
            @update:model-value="onQuickSearch"
          >
            <template #prepend>
              <q-icon name="search" color="grey-5" size="18px" />
            </template>
          </q-input>

          <!-- Column visibility -->
          <q-btn flat dense no-caps icon="view_column" label="Campos" class="toolbar-btn">
            <q-menu class="column-menu">
              <q-list dense>
                <q-item v-for="col in columns" :key="col.name" dense clickable>
                  <q-item-section avatar>
                    <q-checkbox
                      v-model="col.visible"
                      dense
                      color="primary"
                      @update:model-value="updateVisibleCols"
                    />
                  </q-item-section>
                  <q-item-section>{{ col.label }}</q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-btn>

          <!-- Sort -->
          <q-btn flat dense no-caps icon="sort" label="Ordenar por" class="toolbar-btn">
            <q-menu>
              <q-list dense style="min-width: 160px">
                <q-item
                  v-for="col in columns.filter(c => c.visible)"
                  :key="col.name"
                  clickable
                  v-close-popup
                  @click="sortBy(col.name)"
                >
                  <q-item-section>{{ col.label }}</q-item-section>
                  <q-item-section avatar v-if="sortColumn === col.name">
                    <q-icon :name="sortDir === 'asc' ? 'arrow_upward' : 'arrow_downward'" size="16px" />
                  </q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-btn>

          <!-- Export -->
          <q-btn flat dense no-caps icon="download" label="Exportar" class="toolbar-btn">
            <q-menu>
              <q-list dense>
                <q-item clickable v-close-popup @click="exportCsv">
                  <q-item-section avatar><q-icon name="table_chart" size="16px" /></q-item-section>
                  <q-item-section>CSV</q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-btn>
        </div>

        <div class="toolbar-right">
          <q-btn flat dense round icon="refresh" @click="loadData" :loading="loading">
            <q-tooltip>Actualizar</q-tooltip>
          </q-btn>
          <q-btn
            unelevated
            no-caps
            icon="add"
            label="Nuevo"
            color="primary"
            class="new-btn"
            @click="openForm(null)"
          />
        </div>
      </q-card-section>
    </q-card>

    <!-- Data table -->
    <q-card flat bordered>
      <q-table
        :rows="filteredRows"
        :columns="visibleColumns"
        :loading="loading"
        :row-key="pkField ?? 'id'"
        flat
        :rows-per-page-options="[12, 25, 50, 100]"
        :rows-per-page="12"
        class="maestro-table"
        :sort-method="customSort"
      >
        <!-- Actions column -->
        <template #body-cell-actions="props">
          <q-td :props="props" class="actions-cell">
            <q-btn
              flat
              round
              dense
              icon="edit"
              color="primary"
              size="sm"
              @click="openForm(props.row)"
            >
              <q-tooltip>Editar</q-tooltip>
            </q-btn>
            <q-btn
              flat
              round
              dense
              icon="delete_outline"
              color="negative"
              size="sm"
              @click="confirmDelete(props.row)"
            >
              <q-tooltip>Eliminar</q-tooltip>
            </q-btn>
          </q-td>
        </template>

        <template #no-data>
          <div class="full-width column flex-center text-grey-5 q-pa-xl">
            <q-icon name="inbox" size="48px" class="q-mb-sm" />
            <span>Sin datos para mostrar</span>
          </div>
        </template>

        <template #loading>
          <q-inner-loading showing color="primary" />
        </template>
      </q-table>
    </q-card>

    <!-- Form Dialog -->
    <q-dialog v-model="showForm" persistent>
      <q-card class="form-card">
        <q-card-section class="form-header">
          <div class="row items-center">
            <q-icon :name="icon" color="primary" size="22px" class="q-mr-sm" />
            <span class="text-subtitle1 text-weight-bold">
              {{ editingRow ? 'Editar' : 'Nuevo' }} — {{ title }}
            </span>
          </div>
          <q-btn flat round dense icon="close" v-close-popup />
        </q-card-section>

        <q-separator />

        <q-card-section class="q-pa-lg">
          <slot name="form" :row="formData" :editing="!!editingRow" />
        </q-card-section>

        <q-separator />

        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat no-caps label="Cancelar" v-close-popup />
          <q-btn
            unelevated
            no-caps
            :label="editingRow ? 'Guardar cambios' : 'Crear'"
            color="primary"
            :loading="saving"
            @click="saveForm"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Delete confirm -->
    <q-dialog v-model="showDelete">
      <q-card style="min-width: 340px">
        <q-card-section class="row items-center">
          <q-avatar icon="warning" color="negative" text-color="white" />
          <span class="q-ml-sm">¿Eliminar este registro?</span>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat no-caps label="Cancelar" v-close-popup />
          <q-btn unelevated no-caps label="Eliminar" color="negative" :loading="deleting" @click="deleteRow" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive } from 'vue'
import { useQuasar } from 'quasar'
import { api } from 'src/boot/axios'

interface Column {
  name: string
  label: string
  field: string | ((row: Record<string, unknown>) => unknown)
  sortable?: boolean
  visible: boolean
  align?: 'left' | 'right' | 'center'
}

const props = defineProps<{
  title: string
  icon: string
  endpoint: string
  columns: Column[]
  defaultForm: Record<string, unknown>
  section?: string
  pkField?: string
  fetchOnEdit?: boolean
}>()

const emit = defineEmits<{
  (e: 'form-init', formData: Record<string, unknown>): void
  (e: 'before-save', formData: Record<string, unknown>): void
}>()

const $q = useQuasar()

const rows = ref<Record<string, unknown>[]>([])
const loading = ref(false)
const quickSearch = ref('')
const sortColumn = ref<string | null>(null)
const sortDir = ref<'asc' | 'desc'>('asc')

const showForm = ref(false)
const editingRow = ref<Record<string, unknown> | null>(null)
const formData = reactive<Record<string, unknown>>({ ...props.defaultForm })
const saving = ref(false)

const showDelete = ref(false)
const deletingRow = ref<Record<string, unknown> | null>(null)
const deleting = ref(false)

const visibleColumns = computed(() =>
  [
    { name: 'actions', label: '', field: 'actions', align: 'center' as const, sortable: false },
    ...props.columns.filter(c => c.visible)
  ]
)

const filteredRows = computed(() => {
  if (!quickSearch.value) return rows.value
  const q = quickSearch.value.toLowerCase()
  return rows.value.filter(row =>
    props.columns.some(col => {
      const val = typeof col.field === 'function' ? col.field(row) : row[col.field]
      return String(val ?? '').toLowerCase().includes(q)
    })
  )
})

function updateVisibleCols() { /* reactivity handles it */ }

function sortBy(col: string) {
  if (sortColumn.value === col) {
    sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortColumn.value = col
    sortDir.value = 'asc'
  }
}

function customSort(rows: Record<string, unknown>[], sortBy: string, descending: boolean) {
  return [...rows].sort((a, b) => {
    const av = a[sortBy]
    const bv = b[sortBy]
    const cmp = String(av ?? '') < String(bv ?? '') ? -1 : String(av ?? '') > String(bv ?? '') ? 1 : 0
    return descending ? -cmp : cmp
  })
}

function onQuickSearch() { /* computed handles filtering */ }

async function loadData() {
  loading.value = true
  try {
    const { data } = await api.get(props.endpoint)
    rows.value = data
  } catch (e) {
    $q.notify({ type: 'negative', message: 'Error al cargar datos', icon: 'error' })
  } finally {
    loading.value = false
  }
}

async function openForm(row: Record<string, unknown> | null) {
  editingRow.value = row
  let next = row ? { ...row } : { ...props.defaultForm }
  // Cuando la lista proviene de una vista, el registro de la fila puede traer
  // columnas no editables. Con fetchOnEdit se trae el registro limpio de la tabla.
  if (row && props.fetchOnEdit) {
    const pk = props.pkField ?? 'id'
    try {
      const { data } = await api.get(`${props.endpoint}/${row[pk] as string}`)
      next = { ...data }
    } catch {
      // si falla, se usa la fila tal cual
    }
  }
  // Sync all keys: remove stale ones (e.g. 'id' left from a previous edit), update/add the rest
  const allKeys = new Set([...Object.keys(formData), ...Object.keys(next)])
  for (const k of allKeys) {
    if (k in next) {
      formData[k] = next[k]
    } else {
      delete formData[k]
    }
  }
  emit('form-init', formData)
  showForm.value = true
}

async function saveForm() {
  emit('before-save', formData)
  saving.value = true
  const pk = props.pkField ?? 'id'
  try {
    if (editingRow.value) {
      const pkValue = formData[pk]
      // Strip the PK from the body — it goes in the URL, not the body
      const { [pk]: _pk, ...body } = formData as Record<string, unknown>
      await api.put(`${props.endpoint}/${pkValue}`, body)
      $q.notify({ type: 'positive', message: 'Registro actualizado', icon: 'check_circle' })
    } else {
      await api.post(props.endpoint, formData)
      $q.notify({ type: 'positive', message: 'Registro creado', icon: 'check_circle' })
    }
    showForm.value = false
    await loadData()
  } catch (e: unknown) {
    const err = e as { response?: { data?: { message?: string } } }
    $q.notify({ type: 'negative', message: err.response?.data?.message ?? 'Error al guardar', icon: 'error' })
  } finally {
    saving.value = false
  }
}

function confirmDelete(row: Record<string, unknown>) {
  deletingRow.value = row
  showDelete.value = true
}

async function deleteRow() {
  if (!deletingRow.value) return
  deleting.value = true
  const pk = props.pkField ?? 'id'
  try {
    await api.delete(`${props.endpoint}/${deletingRow.value[pk]}`)
    $q.notify({ type: 'positive', message: 'Registro eliminado' })
    showDelete.value = false
    await loadData()
  } catch {
    $q.notify({ type: 'negative', message: 'Error al eliminar' })
  } finally {
    deleting.value = false
  }
}

function exportCsv() {
  const cols = props.columns.filter(c => c.visible)
  const header = cols.map(c => c.label).join(',')
  const rowsStr = filteredRows.value.map(row =>
    cols.map(col => {
      const val = typeof col.field === 'function' ? col.field(row) : row[col.field]
      return `"${String(val ?? '').replace(/"/g, '""')}"`
    }).join(',')
  ).join('\n')
  const csv = `${header}\n${rowsStr}`
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${props.title.replace(/\s+/g, '_')}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

onMounted(loadData)
</script>

<style lang="scss" scoped>
.maestro-page { width: 100%; }

.toolbar-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 16px !important;
}
.toolbar-left {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}
.toolbar-right {
  display: flex;
  align-items: center;
  gap: 8px;
}
.search-input { width: 220px; }
.toolbar-btn {
  font-size: 12px !important;
  padding: 4px 10px !important;
  color: #616161 !important;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
}
.new-btn {
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.maestro-table {
  border-radius: 0 !important;
  :deep(.q-table__top) { padding: 8px 16px; }
  :deep(thead tr th) {
    font-weight: 700;
    font-size: 12px;
    color: #616161;
    background: #FAFAFA;
    letter-spacing: 0.5px;
    text-transform: uppercase;
  }
  :deep(.q-tr:hover) { background: #F0FAF8; }
}
.actions-cell { width: 80px; white-space: nowrap; }

.form-card { min-width: 480px; max-width: 600px; }
.form-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px !important;
  background: #FAFAFA;
}
</style>
