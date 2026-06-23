<template>
  <q-page class="maestro-page q-pa-lg">
    <!-- Toolbar -->
    <q-card flat bordered class="q-mb-md">
      <q-card-section class="toolbar-section">
        <div class="toolbar-left">
          <q-input v-model="quickSearch" dense outlined placeholder="Búsqueda rápida..." class="search-input" clearable>
            <template #prepend><q-icon name="search" color="grey-5" size="18px" /></template>
          </q-input>
        </div>
        <div class="toolbar-right">
          <q-btn flat dense round icon="refresh" @click="loadData" :loading="loading">
            <q-tooltip>Actualizar</q-tooltip>
          </q-btn>
          <q-btn unelevated no-caps icon="add" label="Nuevo" color="primary" class="new-btn" @click="openForm(null)" />
        </div>
      </q-card-section>
    </q-card>

    <!-- Table -->
    <q-card flat bordered>
      <q-table :rows="filteredRows" :columns="tableColumns" :loading="loading" row-key="id" flat
        :rows-per-page-options="[12, 25, 50, 100]" :rows-per-page="25" class="soporte-table">

        <template #body-cell-estado="props">
          <q-td :props="props">
            <q-chip :color="estadoColor(props.value)" text-color="white" dense size="sm">
              {{ props.value }}
            </q-chip>
          </q-td>
        </template>

        <template #body-cell-seguimiento="props">
          <q-td :props="props" class="actions-cell">
            <q-btn flat round dense icon="add" color="positive" size="sm" @click="openSeguimiento(props.row)">
              <q-tooltip>Agregar seguimiento</q-tooltip>
            </q-btn>
          </q-td>
        </template>

        <template #body-cell-actions="props">
          <q-td :props="props" class="actions-cell">
            <q-btn flat round dense icon="edit" color="primary" size="sm" @click="openForm(props.row)">
              <q-tooltip>Editar</q-tooltip>
            </q-btn>
            <q-btn flat round dense icon="delete_outline" color="negative" size="sm" @click="confirmDelete(props.row)">
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
      </q-table>
    </q-card>

    <!-- Form Dialog -->
    <q-dialog v-model="showForm" persistent>
      <q-card style="min-width: 520px; max-width: 640px">
        <q-card-section class="form-header">
          <div class="row items-center">
            <q-icon name="support_agent" color="primary" size="22px" class="q-mr-sm" />
            <span class="text-subtitle1 text-weight-bold">{{ editingRow ? 'Editar' : 'Nuevo' }} — Soporte</span>
          </div>
          <q-btn flat round dense icon="close" v-close-popup />
        </q-card-section>
        <q-separator />
        <q-card-section class="q-pa-lg q-gutter-y-md">
          <q-input v-model="formData.novedad" label="Novedad" outlined dense color="primary" type="textarea" rows="4"
            :rules="[v => !!v || 'Requerido']" />
          <q-select v-model="formData.estado" label="Estado" outlined dense color="primary"
            :options="['Abierto', 'En proceso', 'Cerrado']" />
        </q-card-section>
        <q-separator />
        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat no-caps label="Cancelar" v-close-popup />
          <q-btn unelevated no-caps :label="editingRow ? 'Guardar cambios' : 'Crear'" color="primary"
            :loading="saving" @click="saveForm" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Seguimiento Dialog -->
    <q-dialog v-model="showSeguimiento" persistent>
      <q-card style="min-width: 560px; max-width: 700px">
        <q-card-section class="form-header">
          <div class="row items-center">
            <q-icon name="track_changes" color="primary" size="22px" class="q-mr-sm" />
            <span class="text-subtitle1 text-weight-bold">Seguimientos — Ticket #{{ currentTicket?.id }}</span>
          </div>
          <q-btn flat round dense icon="close" v-close-popup />
        </q-card-section>
        <q-separator />
        <q-card-section class="q-pa-md" style="max-height: 300px; overflow-y: auto">
          <div v-if="seguimientos.length === 0" class="text-grey-5 text-center q-py-md">Sin seguimientos</div>
          <q-list separator v-else>
            <q-item v-for="s in seguimientos" :key="s.id">
              <q-item-section>
                <q-item-label class="text-caption text-grey-6">{{ formatDate(s.fecha) }} — {{ s.usuario }}</q-item-label>
                <q-item-label>{{ s.descripcion }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
        <q-separator />
        <q-card-section class="q-pa-lg">
          <q-input v-model="nuevoSeguimiento" label="Agregar seguimiento" outlined dense color="primary"
            type="textarea" rows="3" />
        </q-card-section>
        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat no-caps label="Cerrar" v-close-popup />
          <q-btn unelevated no-caps label="Agregar" color="positive" :loading="savingSeg"
            :disable="!nuevoSeguimiento.trim()" @click="addSeguimiento" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Delete confirm -->
    <q-dialog v-model="showDelete">
      <q-card style="min-width: 340px">
        <q-card-section class="row items-center">
          <q-avatar icon="warning" color="negative" text-color="white" />
          <span class="q-ml-sm">¿Eliminar este ticket?</span>
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
import { useAuthStore } from 'src/stores/auth'
import { api } from 'src/boot/axios'

interface Ticket { id: number; fechaHora: string; novedad: string; estado: string }
interface Seguimiento { id: number; fecha: string; descripcion: string; usuario: string }

const $q = useQuasar()
const authStore = useAuthStore()

const rows = ref<Ticket[]>([])
const loading = ref(false)
const quickSearch = ref('')

const tableColumns = [
  { name: 'actions', label: '', field: 'actions', align: 'center' as const, sortable: false },
  { name: 'id', label: 'Id', field: 'id', sortable: true, align: 'left' as const },
  { name: 'fechaHora', label: 'Fecha Hora', field: 'fechaHora', sortable: true, align: 'left' as const,
    format: (v: string) => v ? new Date(v).toLocaleString('es-CO') : '' },
  { name: 'novedad', label: 'Novedad', field: 'novedad', sortable: false, align: 'left' as const },
  { name: 'estado', label: 'Estado', field: 'estado', sortable: true, align: 'center' as const },
  { name: 'seguimiento', label: 'Seguimiento', field: 'seguimiento', sortable: false, align: 'center' as const },
]

const filteredRows = computed(() => {
  if (!quickSearch.value) return rows.value
  const q = quickSearch.value.toLowerCase()
  return rows.value.filter(r =>
    String(r.novedad ?? '').toLowerCase().includes(q) ||
    String(r.estado ?? '').toLowerCase().includes(q)
  )
})

function estadoColor(estado: string) {
  if (estado === 'Cerrado') return 'positive'
  if (estado === 'En proceso') return 'warning'
  return 'info'
}

function formatDate(d: string) {
  return d ? String(d).slice(0, 10) : ''
}

// Form
const showForm = ref(false)
const editingRow = ref<Ticket | null>(null)
const formData = reactive({ novedad: '', estado: 'Abierto' })
const saving = ref(false)

function openForm(row: Ticket | null) {
  editingRow.value = row
  if (row) { formData.novedad = row.novedad; formData.estado = row.estado }
  else { formData.novedad = ''; formData.estado = 'Abierto' }
  showForm.value = true
}

async function saveForm() {
  saving.value = true
  try {
    if (editingRow.value) {
      await api.put(`/seguridad/soporte/${editingRow.value.id}`, formData)
      $q.notify({ type: 'positive', message: 'Ticket actualizado', icon: 'check_circle' })
    } else {
      await api.post('/seguridad/soporte', formData)
      $q.notify({ type: 'positive', message: 'Ticket creado', icon: 'check_circle' })
    }
    showForm.value = false
    await loadData()
  } catch {
    $q.notify({ type: 'negative', message: 'Error al guardar' })
  } finally { saving.value = false }
}

// Seguimiento
const showSeguimiento = ref(false)
const currentTicket = ref<Ticket | null>(null)
const seguimientos = ref<Seguimiento[]>([])
const nuevoSeguimiento = ref('')
const savingSeg = ref(false)

async function openSeguimiento(ticket: Ticket) {
  currentTicket.value = ticket
  nuevoSeguimiento.value = ''
  showSeguimiento.value = true
  try {
    const { data } = await api.get(`/seguridad/soporte/${ticket.id}/seguimientos`)
    seguimientos.value = data
  } catch { seguimientos.value = [] }
}

async function addSeguimiento() {
  if (!currentTicket.value) return
  savingSeg.value = true
  try {
    const { data } = await api.post(`/seguridad/soporte/${currentTicket.value.id}/seguimientos`, {
      descripcion: nuevoSeguimiento.value,
      usuario: authStore.user?.usuario ?? '',
    })
    seguimientos.value.push(data)
    nuevoSeguimiento.value = ''
    $q.notify({ type: 'positive', message: 'Seguimiento agregado' })
  } catch {
    $q.notify({ type: 'negative', message: 'Error al agregar seguimiento' })
  } finally { savingSeg.value = false }
}

// Delete
const showDelete = ref(false)
const deletingRow = ref<Ticket | null>(null)
const deleting = ref(false)

function confirmDelete(row: Ticket) { deletingRow.value = row; showDelete.value = true }

async function deleteRow() {
  if (!deletingRow.value) return
  deleting.value = true
  try {
    await api.delete(`/seguridad/soporte/${deletingRow.value.id}`)
    $q.notify({ type: 'positive', message: 'Ticket eliminado' })
    showDelete.value = false
    await loadData()
  } catch {
    $q.notify({ type: 'negative', message: 'Error al eliminar' })
  } finally { deleting.value = false }
}

async function loadData() {
  loading.value = true
  try {
    const { data } = await api.get('/seguridad/soporte')
    rows.value = data
  } catch {
    $q.notify({ type: 'negative', message: 'Error al cargar datos' })
  } finally { loading.value = false }
}

onMounted(loadData)
</script>

<style lang="scss" scoped>
.maestro-page { width: 100%; }
.toolbar-section { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 12px 16px !important; }
.toolbar-left { display: flex; align-items: center; gap: 6px; }
.toolbar-right { display: flex; align-items: center; gap: 8px; }
.search-input { width: 220px; }
.new-btn { font-size: 13px; font-weight: 600; }
.soporte-table {
  border-radius: 0 !important;
  :deep(thead tr th) { font-weight: 700; font-size: 12px; color: #616161; background: #FAFAFA; text-transform: uppercase; }
  :deep(.q-tr:hover) { background: #F0FAF8; }
}
.actions-cell { width: 80px; white-space: nowrap; }
.form-header { display: flex; align-items: center; justify-content: space-between; padding: 16px 20px !important; background: #FAFAFA; }
</style>
