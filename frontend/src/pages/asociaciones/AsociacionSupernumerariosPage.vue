<template>
  <q-page class="sn-page q-pa-lg">
    <!-- Auxiliar selector -->
    <q-card flat bordered class="q-mb-md shadow-2">
      <q-card-section>
        <div class="row q-col-gutter-md items-center">
          <div class="col-12 col-sm-6">
            <div class="text-caption text-grey-6 q-mb-xs text-weight-medium text-uppercase">
              Seleccione un Auxiliar
            </div>
            <q-select
              v-model="selectedAuxiliar"
              :options="auxiliarOptions"
              option-value="value"
              option-label="label"
              emit-value map-options use-input input-debounce="0"
              label="Auxiliar"
              outlined dense color="teal-9" clearable
              @filter="filterAuxiliares"
              @update:model-value="onAuxiliarChange"
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
          <div class="col-12 col-sm-6 text-grey-6 text-caption" v-if="selectedAuxiliar">
            <q-icon name="info_outline" size="14px" class="q-mr-xs" />
            Mostrando supernumerarios vinculados al auxiliar seleccionado
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Supernumerarios table -->
    <q-card flat bordered class="shadow-2">
      <q-card-section class="table-toolbar q-pa-sm">
        <div class="row items-center">
          <q-icon name="group" color="teal-9" size="20px" class="q-mr-sm" />
          <span class="text-subtitle2 text-grey-8">Supernumerarios vinculados</span>
          <q-badge
            v-if="filteredAssociations.length > 0"
            color="teal-9"
            class="q-ml-sm"
            :label="filteredAssociations.length"
          />
        </div>
        <q-btn flat dense round icon="refresh" color="grey-7" :loading="loading" @click="loadAssociations">
          <q-tooltip>Actualizar</q-tooltip>
        </q-btn>
      </q-card-section>

      <q-table
        :rows="filteredAssociations"
        :columns="columns"
        :loading="loading"
        row-key="id_supernumerario"
        flat dense bordered
        :rows-per-page-options="[]"
        hide-bottom
      >
        <template #body-cell-supernumerario="props">
          <q-td :props="props">
            <div class="row items-center">
              <q-icon name="person_outline" color="grey-5" size="16px" class="q-mr-sm" />
              <span>{{ props.row.nombre_supernumerario }}</span>
            </div>
          </q-td>
        </template>

        <template #body-cell-actions="props">
          <q-td :props="props" class="text-center">
            <q-btn
              flat round dense
              icon="delete_outline"
              color="negative"
              size="sm"
              :loading="deletingKey === `${props.row.id_auxiliar}|${props.row.id_supernumerario}`"
              @click="confirmEliminar(props.row)"
            >
              <q-tooltip>Eliminar asociación</q-tooltip>
            </q-btn>
          </q-td>
        </template>

        <template #no-data>
          <div class="full-width column flex-center text-grey-5 q-pa-xl">
            <q-icon
              :name="selectedAuxiliar ? 'person_off' : 'manage_search'"
              size="48px"
              class="q-mb-sm"
            />
            <span v-if="!selectedAuxiliar">Seleccione un auxiliar para ver sus supernumerarios</span>
            <span v-else>No hay supernumerarios vinculados a este auxiliar</span>
          </div>
        </template>

        <template #loading>
          <q-inner-loading showing color="teal-9" />
        </template>
      </q-table>

      <!-- Agregar nuevo supernumerario -->
      <div class="agregar-section q-pa-md" v-if="selectedAuxiliar">
        <div class="row q-col-gutter-md items-end">
          <div class="col-12 col-sm-7">
            <q-select
              v-model="newSupernumerario"
              :options="supernumerarioOptions"
              option-value="value"
              option-label="label"
              emit-value map-options use-input input-debounce="0"
              label="Agregar supernumerario..."
              outlined dense color="teal-9" clearable
              @filter="filterSupernumerarios"
            >
              <template #prepend>
                <q-icon name="person_add" color="teal-9" size="18px" />
              </template>
              <template #no-option>
                <q-item>
                  <q-item-section class="text-grey">Sin resultados</q-item-section>
                </q-item>
              </template>
            </q-select>
          </div>
          <div class="col-12 col-sm-5">
            <q-btn
              unelevated no-caps
              label="Agregar Supernumerario"
              icon="add"
              class="full-width agregar-btn"
              :loading="saving"
              :disable="!newSupernumerario"
              @click="agregar"
            />
          </div>
        </div>
      </div>

      <div class="agregar-section q-pa-md text-caption text-grey-5" v-else>
        <q-icon name="arrow_upward" size="14px" class="q-mr-xs" />
        Seleccione un auxiliar para poder agregar supernumerarios
      </div>
    </q-card>

    <!-- Confirm delete dialog -->
    <q-dialog v-model="showConfirm">
      <q-card style="min-width: 340px">
        <q-card-section class="row items-center q-pa-lg">
          <q-avatar icon="delete_outline" color="negative" text-color="white" />
          <span class="q-ml-sm">
            ¿Eliminar la asociación con
            <strong>{{ confirmRow?.nombre_supernumerario }}</strong>?
          </span>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat no-caps label="Cancelar" v-close-popup />
          <q-btn
            unelevated no-caps
            label="Eliminar"
            color="negative"
            :loading="removing"
            @click="doEliminar"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { api } from 'src/boot/axios'

interface Association {
  id_auxiliar: string
  id_supernumerario: string
  nombre_auxiliar: string
  nombre_supernumerario: string
}

interface Option {
  value: string
  label: string
}

const $q = useQuasar()

// ── Options ──
const empleadosAll = ref<Option[]>([])
const auxiliarOptions = ref<Option[]>([])
const supernumerarioOptions = ref<Option[]>([])

function filterAuxiliares(val: string, update: (fn: () => void) => void) {
  update(() => {
    auxiliarOptions.value = val
      ? empleadosAll.value.filter(o => o.label.toLowerCase().includes(val.toLowerCase()))
      : empleadosAll.value
  })
}

function filterSupernumerarios(val: string, update: (fn: () => void) => void) {
  update(() => {
    supernumerarioOptions.value = val
      ? empleadosAll.value.filter(o => o.label.toLowerCase().includes(val.toLowerCase()))
      : empleadosAll.value
  })
}

async function loadOptions() {
  try {
    const { data } = await api.get<Option[]>('/asociaciones/options/empleados')
    empleadosAll.value = data
    auxiliarOptions.value = data
    supernumerarioOptions.value = data
  } catch {
    $q.notify({ type: 'negative', message: 'Error al cargar empleados' })
  }
}

// ── Associations ──
const allAssociations = ref<Association[]>([])
const loading = ref(false)

const filteredAssociations = computed(() => {
  if (!selectedAuxiliar.value) return []
  return allAssociations.value.filter(a => a.id_auxiliar === selectedAuxiliar.value)
})

async function loadAssociations() {
  loading.value = true
  try {
    const { data } = await api.get<Association[]>('/asociaciones/supernumerarios')
    allAssociations.value = data
  } catch {
    $q.notify({ type: 'negative', message: 'Error al cargar supernumerarios' })
  } finally {
    loading.value = false
  }
}

// ── Auxiliar selection ──
const selectedAuxiliar = ref<string | null>(null)

function onAuxiliarChange() {
  // filteredAssociations is computed — no extra action needed
  // Reset add form when switching auxiliar
  newSupernumerario.value = null
}

// ── Table columns ──
const columns = [
  {
    name: 'supernumerario',
    label: 'Supernumerario',
    field: 'nombre_supernumerario',
    align: 'left' as const,
    sortable: true,
  },
  {
    name: 'actions',
    label: 'Acciones',
    field: 'actions',
    align: 'center' as const,
    sortable: false,
    style: 'width: 80px',
  },
]

// ── Add supernumerario ──
const newSupernumerario = ref<string | null>(null)
const saving = ref(false)

async function agregar() {
  if (!selectedAuxiliar.value || !newSupernumerario.value) return

  // Prevent duplicate
  const alreadyLinked = filteredAssociations.value.some(
    a => a.id_supernumerario === newSupernumerario.value
  )
  if (alreadyLinked) {
    $q.notify({ type: 'warning', message: 'Este supernumerario ya está vinculado al auxiliar seleccionado' })
    return
  }

  saving.value = true
  try {
    await api.post('/asociaciones/supernumerarios', {
      id_auxiliar: selectedAuxiliar.value,
      id_supernumerario: newSupernumerario.value,
    })
    $q.notify({ type: 'positive', message: 'Supernumerario agregado correctamente', icon: 'check_circle' })
    newSupernumerario.value = null
    await loadAssociations()
  } catch (e: unknown) {
    const err = e as { response?: { data?: { message?: string } } }
    $q.notify({ type: 'negative', message: err.response?.data?.message ?? 'Error al agregar supernumerario' })
  } finally {
    saving.value = false
  }
}

// ── Delete supernumerario ──
const showConfirm = ref(false)
const confirmRow = ref<Association | null>(null)
const removing = ref(false)
const deletingKey = ref<string | null>(null)

function confirmEliminar(row: Association) {
  confirmRow.value = row
  showConfirm.value = true
}

async function doEliminar() {
  if (!confirmRow.value) return

  const { id_auxiliar, id_supernumerario } = confirmRow.value
  removing.value = true
  deletingKey.value = `${id_auxiliar}|${id_supernumerario}`

  try {
    await api.delete(`/asociaciones/supernumerarios/${id_auxiliar}/${id_supernumerario}`)
    $q.notify({ type: 'positive', message: 'Asociación eliminada', icon: 'check_circle' })
    showConfirm.value = false
    // Optimistic removal
    allAssociations.value = allAssociations.value.filter(
      a => !(a.id_auxiliar === id_auxiliar && a.id_supernumerario === id_supernumerario)
    )
  } catch {
    $q.notify({ type: 'negative', message: 'Error al eliminar la asociación' })
  } finally {
    removing.value = false
    deletingKey.value = null
    confirmRow.value = null
  }
}

// ── Init ──
onMounted(async () => {
  await Promise.all([loadOptions(), loadAssociations()])
})
</script>

<style lang="scss" scoped>
.sn-page {
  width: 100%;
}

.table-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #f0f0f0;
}

.agregar-section {
  border-top: 1px dashed #e0e0e0;
  background: #fafafa;
}

.agregar-btn {
  background: linear-gradient(135deg, #0F5A52, #26A69A) !important;
  color: white !important;
  font-weight: 600;
  letter-spacing: 0.5px;
  height: 40px;
}

:deep(thead tr th) {
  font-weight: 700;
  font-size: 12px;
  color: #616161;
  background: #fafafa;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

:deep(.q-tr:hover) {
  background: #f0faf8;
}
</style>
