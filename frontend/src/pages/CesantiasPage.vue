<template>
  <q-page class="cesantias-page q-pa-lg">

    <!-- Toolbar -->
    <q-card flat bordered class="q-mb-md">
      <q-card-section class="toolbar-section">
        <div class="toolbar-right">
          <q-btn flat dense round icon="refresh" :loading="loading" @click="loadData">
            <q-tooltip>Actualizar</q-tooltip>
          </q-btn>
          <q-btn unelevated no-caps icon="add" label="Nueva Cesantía" color="primary"
            class="new-btn" @click="openForm(null)" />
        </div>
      </q-card-section>
    </q-card>

    <!-- Filters -->
    <q-card flat bordered class="q-mb-md">
      <q-card-section class="q-pa-md">
        <div class="row q-col-gutter-md items-end">
          <div class="col-12 col-sm-3">
            <q-input v-model="filters.search" dense outlined clearable debounce="400"
              placeholder="Buscar por nombre o cédula..." @update:model-value="onFilter">
              <template #prepend><q-icon name="search" color="grey-5" size="16px" /></template>
            </q-input>
          </div>
          <div class="col-12 col-sm-3">
            <q-input v-model="filters.empleado" dense outlined clearable debounce="400"
              placeholder="Cédula exacta del empleado..." @update:model-value="onFilter">
              <template #prepend><q-icon name="badge" color="grey-5" size="16px" /></template>
            </q-input>
          </div>
          <div class="col-12 col-sm-2">
            <q-input v-model="filters.fechaDesde" dense outlined clearable type="date"
              label="Desde" @update:model-value="onFilter">
              <template #prepend><q-icon name="event" color="grey-5" size="16px" /></template>
            </q-input>
          </div>
          <div class="col-12 col-sm-2">
            <q-input v-model="filters.fechaHasta" dense outlined clearable type="date"
              label="Hasta" @update:model-value="onFilter">
              <template #prepend><q-icon name="event" color="grey-5" size="16px" /></template>
            </q-input>
          </div>
          <div class="col-12 col-sm-2">
            <q-btn flat no-caps dense icon="clear" label="Limpiar" color="grey-7"
              class="full-width" @click="clearFilters" />
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Table -->
    <q-card flat bordered>
      <q-table
        :rows="rows"
        :columns="columns"
        :loading="loading"
        row-key="id"
        flat
        :rows-per-page-options="[]"
        hide-bottom
        class="cesantias-table"
      >
        <!-- Firma cell -->
        <template #body-cell-firma="props">
          <q-td :props="props">
            <div v-if="props.row.firma" class="firma-thumb-wrap">
              <FirmaViewer :firma="props.row.firma" :width="160" :height="60" />
            </div>
            <span v-else class="text-grey-4 text-caption">Sin firma</span>
          </q-td>
        </template>

        <!-- Actions -->
        <template #body-cell-actions="props">
          <q-td :props="props">
            <q-btn flat round dense icon="visibility" color="primary" size="sm"
              @click="openViewer(props.row)">
              <q-tooltip>Ver firma</q-tooltip>
            </q-btn>
            <q-btn flat round dense icon="edit" color="secondary" size="sm"
              @click="openForm(props.row)">
              <q-tooltip>Editar</q-tooltip>
            </q-btn>
            <q-btn flat round dense icon="delete_outline" color="negative" size="sm"
              @click="confirmDelete(props.row)">
              <q-tooltip>Eliminar</q-tooltip>
            </q-btn>
          </q-td>
        </template>

        <template #no-data>
          <div class="full-width column flex-center text-grey-5 q-pa-xl">
            <q-icon name="inbox" size="48px" class="q-mb-sm" />
            <span>Sin registros encontrados</span>
          </div>
        </template>
        <template #loading>
          <q-inner-loading showing color="primary" />
        </template>
      </q-table>

      <!-- Pagination -->
      <div class="pagination-bar">
        <span class="text-caption text-grey-6">
          Página {{ page }} de {{ totalPages }} · {{ total }} registros
        </span>
        <q-pagination v-model="page" :max="totalPages" :max-pages="7"
          boundary-links color="primary" @update:model-value="loadData" />
        <q-select v-model="limit" :options="[25,50,100,200]" dense outlined
          label="Por página" style="width:100px" @update:model-value="onLimitChange" />
      </div>
    </q-card>

    <!-- View Firma Dialog -->
    <q-dialog v-model="showViewer">
      <q-card class="viewer-card">
        <q-card-section class="dialog-header">
          <div class="row items-center">
            <q-icon name="draw" color="primary" size="22px" class="q-mr-sm" />
            <span class="text-subtitle1 text-weight-bold">Firma Digital</span>
          </div>
          <q-btn flat round dense icon="close" v-close-popup />
        </q-card-section>
        <q-separator />
        <q-card-section class="q-pa-lg" v-if="viewingRow">
          <div class="viewer-info q-mb-md">
            <div class="info-row"><span class="info-label">Nombre:</span><span>{{ viewingRow.nombre }}</span></div>
            <div class="info-row"><span class="info-label">Identificación:</span><span>{{ viewingRow.empleado }}</span></div>
            <div class="info-row"><span class="info-label">Fecha:</span><span>{{ formatDate(viewingRow.fecha) }}</span></div>
          </div>
          <div class="firma-large">
            <FirmaViewer :firma="viewingRow.firma" :width="480" :height="200" />
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Form Dialog -->
    <q-dialog v-model="showForm" persistent>
      <q-card class="form-card">
        <q-card-section class="dialog-header">
          <div class="row items-center">
            <q-icon name="account_balance" color="primary" size="22px" class="q-mr-sm" />
            <span class="text-subtitle1 text-weight-bold">
              {{ editingRow ? 'Editar Cesantía' : 'Nueva Cesantía' }}
            </span>
          </div>
          <q-btn flat round dense icon="close" v-close-popup />
        </q-card-section>
        <q-separator />
        <q-card-section class="q-pa-lg">
          <div class="q-gutter-y-md">

            <!-- Empleado -->
            <div class="form-row">
              <span class="form-label">Empleado: <span class="text-negative">*</span></span>
              <q-select
                v-model="formData.empleado"
                :options="empleadoOptions"
                option-value="value"
                option-label="label"
                emit-value map-options use-input input-debounce="0"
                outlined dense color="primary" clearable
                @filter="filterEmpleados"
              >
                <template #no-option>
                  <q-item><q-item-section class="text-grey">Sin resultados</q-item-section></q-item>
                </template>
              </q-select>
            </div>

            <!-- Texto fijo -->
            <div class="form-row">
              <span class="form-label">Texto:</span>
              <div class="autorizacion-text">
                Autorizo para que las Cesantías del año {{ currentYear }} o en su defecto las cesantías
                acumuladas hasta el año {{ currentYear - 1 }} en el fondo en el cual estoy afiliado (a),
                sean tramitadas ante el fondo correspondiente y consignadas en mi cuenta de nómina en un
                lapso de tiempo prudente después de mi desvinculación laboral de la empresa
                UNO-A ASEO INTEGRADO S.A.
              </div>
            </div>

            <!-- Firma -->
            <div class="form-row items-start">
              <span class="form-label q-pt-xs">Firma: <span class="text-negative">*</span></span>
              <div>
                <FirmaCapture v-model="formData.firma" :width="440" :height="180" />
                <div v-if="editingRow && editingRow.firma && !formData.firma" class="q-mt-sm">
                  <div class="text-caption text-grey-6 q-mb-xs">Firma actual (no modificada):</div>
                  <FirmaViewer :firma="editingRow.firma" :width="300" :height="100" />
                </div>
              </div>
            </div>

          </div>
        </q-card-section>
        <q-separator />
        <q-card-section class="q-pa-sm q-pl-lg">
          <span class="text-caption text-negative">* Campos obligatorios</span>
        </q-card-section>
        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat no-caps label="Cancelar" v-close-popup />
          <q-btn unelevated no-caps color="primary" :loading="saving"
            :label="editingRow ? 'Guardar cambios' : 'Guardar'"
            icon="save" @click="saveForm" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Delete confirm -->
    <q-dialog v-model="showDelete">
      <q-card style="min-width: 340px">
        <q-card-section class="row items-center q-pa-lg">
          <q-avatar icon="warning" color="negative" text-color="white" />
          <span class="q-ml-sm">¿Eliminar este registro de cesantía?</span>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat no-caps label="Cancelar" v-close-popup />
          <q-btn unelevated no-caps label="Eliminar" color="negative"
            :loading="deleting" @click="deleteRow" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive } from 'vue'
import { useQuasar } from 'quasar'
import { api } from 'src/boot/axios'
import FirmaViewer from 'src/components/FirmaViewer.vue'
import FirmaCapture from 'src/components/FirmaCapture.vue'
import { formatDate } from 'src/utils/date'

interface CesantiaRow {
  id: number
  empleado: string
  fecha: string
  firma: string | null
  nombre: string | null
}

const $q = useQuasar()

const rows = ref<CesantiaRow[]>([])
const loading = ref(false)
const page = ref(1)
const limit = ref(50)
const total = ref(0)
const totalPages = computed(() => Math.max(1, Math.ceil(total.value / limit.value)))

const filters = reactive({ search: '', empleado: '', fechaDesde: '', fechaHasta: '' })

function onFilter() { page.value = 1; void loadData() }
function onLimitChange() { page.value = 1; void loadData() }
function clearFilters() { filters.search = ''; filters.empleado = ''; filters.fechaDesde = ''; filters.fechaHasta = ''; onFilter() }

const columns = [
  { name: 'actions', label: '', field: 'actions', align: 'center' as const, sortable: false },
  { name: 'id', label: 'ID', field: 'id', sortable: true, align: 'left' as const },
  { name: 'fecha', label: 'Fecha', field: 'fecha', sortable: true, align: 'left' as const, format: (v: string | null) => formatDate(v) },
  { name: 'empleado', label: 'Identificación', field: 'empleado', sortable: true, align: 'left' as const },
  { name: 'nombre', label: 'Nombre', field: 'nombre', sortable: true, align: 'left' as const },
  { name: 'firma', label: 'Firma', field: 'firma', sortable: false, align: 'left' as const },
]

async function loadData() {
  loading.value = true
  try {
    const params: Record<string, string> = {
      page: String(page.value),
      limit: String(limit.value),
    }
    if (filters.search) params.search = filters.search
    if (filters.empleado) params.empleado = filters.empleado
    if (filters.fechaDesde) params.fechaDesde = filters.fechaDesde
    if (filters.fechaHasta) params.fechaHasta = filters.fechaHasta
    const { data } = await api.get('/cesantias', { params })
    rows.value = data.data
    total.value = data.total
  } catch {
    $q.notify({ type: 'negative', message: 'Error al cargar cesantías' })
  } finally {
    loading.value = false
  }
}

// Viewer
const showViewer = ref(false)
const viewingRow = ref<CesantiaRow | null>(null)
function openViewer(row: CesantiaRow) {
  viewingRow.value = row
  showViewer.value = true
}

// Employee options for form
interface Option { value: string; label: string }
const empleadosAll = ref<Option[]>([])
const empleadoOptions = ref<Option[]>([])
const currentYear = new Date().getFullYear()

async function loadEmpleadoOptions() {
  try {
    const { data } = await api.get('/asociaciones/options/empleados')
    empleadosAll.value = data
    empleadoOptions.value = data
  } catch { /* silent */ }
}

function filterEmpleados(val: string, update: (fn: () => void) => void) {
  update(() => {
    empleadoOptions.value = val
      ? empleadosAll.value.filter(o => o.label.toLowerCase().includes(val.toLowerCase()))
      : empleadosAll.value
  })
}

// Form
const showForm = ref(false)
const editingRow = ref<CesantiaRow | null>(null)
const formData = reactive({ empleado: '' as string | null, firma: '' })
const saving = ref(false)

function openForm(row: CesantiaRow | null) {
  editingRow.value = row
  formData.empleado = row?.empleado ?? null
  formData.firma = ''
  showForm.value = true
}

async function saveForm() {
  if (!formData.empleado) {
    $q.notify({ type: 'warning', message: 'Seleccione un empleado' })
    return
  }
  saving.value = true
  try {
    const today = new Date().toISOString().substring(0, 10)
    const payload = {
      empleado: formData.empleado,
      fecha: editingRow.value?.fecha?.substring(0, 10) ?? today,
      ...(formData.firma ? { firma: formData.firma } : {}),
    }
    if (editingRow.value) {
      await api.put(`/cesantias/${editingRow.value.id}`, payload)
      $q.notify({ type: 'positive', message: 'Registro actualizado', icon: 'check_circle' })
    } else {
      if (!formData.firma) {
        $q.notify({ type: 'warning', message: 'La firma es obligatoria' })
        saving.value = false
        return
      }
      await api.post('/cesantias', payload)
      $q.notify({ type: 'positive', message: 'Cesantía registrada', icon: 'check_circle' })
    }
    showForm.value = false
    await loadData()
  } catch (e: unknown) {
    const err = e as { response?: { data?: { message?: string } } }
    $q.notify({ type: 'negative', message: err.response?.data?.message ?? 'Error al guardar' })
  } finally {
    saving.value = false
  }
}

// Delete
const showDelete = ref(false)
const deletingRow = ref<CesantiaRow | null>(null)
const deleting = ref(false)

function confirmDelete(row: CesantiaRow) {
  deletingRow.value = row
  showDelete.value = true
}

async function deleteRow() {
  if (!deletingRow.value) return
  deleting.value = true
  try {
    await api.delete(`/cesantias/${deletingRow.value.id}`)
    $q.notify({ type: 'positive', message: 'Registro eliminado' })
    showDelete.value = false
    await loadData()
  } catch {
    $q.notify({ type: 'negative', message: 'Error al eliminar' })
  } finally {
    deleting.value = false
  }
}

onMounted(() => { void Promise.all([loadData(), loadEmpleadoOptions()]) })
</script>

<style lang="scss" scoped>
.cesantias-page { width: 100%; }



.toolbar-section {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  padding: 12px 16px !important;
}
.toolbar-right { display: flex; align-items: center; gap: 8px; }
.new-btn { font-weight: 600; letter-spacing: 0.5px; }

.cesantias-table {
  :deep(thead tr th) {
    font-weight: 700;
    font-size: 12px;
    color: #616161;
    background: #FAFAFA;
    text-transform: uppercase;
  }
  :deep(.q-tr:hover) { background: #F0FAF8; }
}

.firma-thumb-wrap { display: inline-block; }

.pagination-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-top: 1px solid #f0f0f0;
  padding: 8px 16px;
}

/* Dialogs */
.viewer-card { min-width: 560px; }
.form-card { min-width: 600px; max-width: 640px; }

.form-row {
  display: grid;
  grid-template-columns: 110px 1fr;
  gap: 12px;
  align-items: center;
}
.form-label {
  font-weight: 600;
  color: #424242;
  font-size: 13px;
  text-align: right;
  padding-right: 4px;
}
.autorizacion-text {
  background: #f5f5f5;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  padding: 10px 12px;
  font-size: 13px;
  color: #212121;
  line-height: 1.6;
}
.dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px !important;
  background: #FAFAFA;
}
.viewer-info { background: #f8f8f8; border-radius: 8px; padding: 12px 16px; }
.info-row { display: flex; gap: 12px; margin-bottom: 4px; }
.info-label { font-weight: 600; color: #616161; min-width: 110px; }
.firma-large { display: flex; justify-content: center; margin-top: 12px; }
</style>
