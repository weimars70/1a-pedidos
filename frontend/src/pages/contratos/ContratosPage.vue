<template>
  <q-page class="contratos-page q-pa-lg">

    <!-- Header -->
  

    <!-- Toolbar -->
    <q-card flat bordered class="q-mb-md">
      <q-card-section>
        <div class="row q-gutter-sm items-center q-mb-sm">
          <q-input v-model="search" dense outlined clearable placeholder="Buscar en todos los campos..."
            style="min-width:260px" debounce="300">
            <template #prepend><q-icon name="search" color="grey-5" size="18px" /></template>
          </q-input>
          <q-select v-model="filterTipo" :options="tipoFilterOpts" option-value="value" option-label="label"
            emit-value map-options label="Tipo" outlined dense clearable style="min-width:160px" />
          <q-select v-model="filterPerfil" :options="perfilOpts" option-value="value" option-label="label"
            emit-value map-options label="Perfil" outlined dense clearable style="min-width:180px" />
          <q-input v-model="filterFechaDesde" type="date" label="Fecha desde" outlined dense stack-label style="min-width:155px" />
          <q-input v-model="filterFechaHasta" type="date" label="Fecha hasta" outlined dense stack-label style="min-width:155px" />
          <q-btn flat dense round icon="refresh" :loading="loading" @click="loadData"><q-tooltip>Actualizar</q-tooltip></q-btn>
          <q-space />
          <q-btn unelevated no-caps icon="assignment_late" label="Nueva Terminación" color="red-7"
            class="q-ml-sm" @click="openTerminacion" />
          <q-btn unelevated no-caps icon="trending_down" label="Nueva Disminución" color="orange-8"
            @click="openDisminucion" />
        </div>
        <div v-if="filterTipo || filterPerfil || filterFechaDesde || filterFechaHasta" class="row q-gutter-xs items-center">
          <span class="text-caption text-grey-6">Filtros activos:</span>
          <q-chip v-if="filterTipo" dense removable color="orange-2" text-color="orange-9" @remove="filterTipo = null">{{ filterTipo }}</q-chip>
          <q-chip v-if="filterPerfil" dense removable color="teal-1" text-color="teal-9" @remove="filterPerfil = null">{{ filterPerfil }}</q-chip>
          <q-chip v-if="filterFechaDesde" dense removable color="blue-1" text-color="blue-9" @remove="filterFechaDesde = ''">Desde {{ filterFechaDesde }}</q-chip>
          <q-chip v-if="filterFechaHasta" dense removable color="blue-1" text-color="blue-9" @remove="filterFechaHasta = ''">Hasta {{ filterFechaHasta }}</q-chip>
        </div>
      </q-card-section>
    </q-card>

    <!-- Table -->
    <q-card flat bordered>
      <q-table :rows="filtered" :columns="columns" :loading="loading" row-key="id"
        flat :rows-per-page-options="[12, 25, 50, 100]" class="contratos-table">
        <template #body-cell-tipo="props">
          <q-td :props="props">
            <q-badge
              :color="tipoBadgeColor(props.row.tipo)"
              :label="props.row.tipo"
              class="tipo-badge"
            />
          </q-td>
        </template>
        <template #body-cell-actions="props">
          <q-td :props="props">
            <q-btn flat round dense icon="edit" color="primary" size="sm" @click="openForm(props.row)">
              <q-tooltip>Editar</q-tooltip>
            </q-btn>
            <q-btn flat round dense icon="block" color="negative" size="sm" @click="confirmAnular(props.row)">
              <q-tooltip>Anular</q-tooltip>
            </q-btn>
          </q-td>
        </template>
        <template #no-data>
          <div class="full-width column flex-center text-grey-5 q-pa-xl">
            <q-icon name="description" size="48px" class="q-mb-sm" />
            <span>Sin contratos</span>
          </div>
        </template>
        <template #loading><q-inner-loading showing color="primary" /></template>
      </q-table>
    </q-card>

    <!-- ═══════════════════════════ FORM DIALOG ═══════════════════════════ -->
    <q-dialog v-model="showForm" persistent maximized>
      <q-card class="form-fullcard">

        <!-- Dialog header -->
        <div class="form-topbar">
          <div class="row items-center q-gutter-sm">
            <q-icon name="description" color="white" size="22px" />
            <span class="text-h6 text-white text-weight-bold">
              {{ editingRow ? 'Editar Contrato' : 'Nuevo Contrato' }}
            </span>
            <q-chip v-if="editingRow" dense color="white" text-color="primary" class="q-ml-sm">
              {{ editingRow.nombre_cliente }}
            </q-chip>
          </div>
          <div class="row q-gutter-sm">
            <q-btn flat no-caps label="Cancelar" color="white" v-close-popup />
            <q-btn unelevated no-caps label="Guardar" icon="save" color="white"
              text-color="primary" :loading="saving" @click="saveForm" />
          </div>
        </div>

        <!-- Dialog body -->
        <div class="form-body">
          <div class="form-cols">

            <!-- ── LEFT COLUMN ── -->
            <div class="form-col">

              <!-- Section: Datos del contrato -->
              <div class="form-section">
                <div class="section-title">
                  <q-icon name="info_outline" size="16px" class="q-mr-xs" />Datos del contrato
                </div>
                <div class="field-grid-2">
                  <q-select
                    v-model="form.tipo"
                    :options="tipoOpts"
                    option-value="value"
                    option-label="label"
                    emit-value
                    map-options
                    label="Tipo"
                    outlined dense color="primary"
                  />
                  <q-input v-model.number="form.perfil" label="N Perfil (id)" outlined dense color="primary"
                    type="number" />
                </div>
                <div class="field-grid-2 q-mt-sm">
                  <q-input v-model="form.fecha" label="Fecha *" outlined dense color="primary" type="date"
                    stack-label :rules="[(v) => !!v || 'Requerido']" />
                  <q-input v-model="form.fecha_inicio" label="Fecha Inicio" outlined dense color="primary"
                    type="date" stack-label />
                </div>
                <div class="q-mt-sm">
                  <q-input v-model="form.fecha_terminacion" label="Fecha Terminación" outlined dense color="primary"
                    type="date" stack-label />
                </div>
              </div>

              <!-- Section: Cliente -->
              <div class="form-section q-mt-lg">
                <div class="section-title">
                  <q-icon name="people" size="16px" class="q-mr-xs" />Datos del cliente
                </div>
                <div class="field-grid-2">
                  <q-input v-model.number="form.id_cliente" label="ID Cliente *" outlined dense color="primary"
                    type="number" :rules="[(v) => !!v || 'Requerido']" />
                  <q-input v-model.number="form.personas" label="Personas" outlined dense color="primary"
                    type="number" />
                </div>
              </div>
            </div>

            <!-- ── RIGHT COLUMN ── -->
            <div class="form-col">
              <div class="form-section">
                <div class="section-title">
                  <q-icon name="notes" size="16px" class="q-mr-xs" />Observaciones
                </div>
                <q-input v-model="form.observacion" label="Observaciones" outlined dense color="primary"
                  type="textarea" rows="6" autogrow />
              </div>
            </div>

          </div>
        </div>
      </q-card>
    </q-dialog>

    <!-- ═══════ MODAL NUEVA TERMINACIÓN ═══════ -->
    <q-dialog v-model="showTerminacion" persistent>
      <q-card style="min-width:560px;max-width:640px">
        <div class="modal-topbar modal-red">
          <q-icon name="assignment_late" color="white" size="20px" class="q-mr-sm" />
          <span class="text-subtitle1 text-white text-weight-bold">Nuevo registro de Terminación Contrato</span>
          <q-space />
          <q-btn flat round dense icon="close" color="white" v-close-popup />
        </div>
        <q-form ref="formTermRef" @submit="submitTerminacion" class="q-pa-lg q-gutter-y-md">
          <q-select v-model="fTerm.id_cliente" :options="clienteFilteredT"
            option-value="id" option-label="nombre" emit-value map-options
            label="Cliente *" outlined dense color="primary"
            use-input input-debounce="200" @filter="filterClienteT" :loading="loadingLk"
            :rules="[(v) => !!v || 'Requerido']" hint="DIGITE PARA BUSCAR">
            <template #no-option><q-item><q-item-section class="text-grey">Sin resultados</q-item-section></q-item></template>
          </q-select>
          <div class="row q-col-gutter-md">
            <div class="col-6">
              <q-input v-model.number="fTerm.id_supervisor" label="Id Supervisor *" outlined dense color="primary"
                type="number" @blur="loadSupT" :rules="[(v) => !!v || 'Requerido']" />
            </div>
            <div class="col-6">
              <q-input v-model="supNombreT" label="Nombre supervisor" outlined dense readonly bg-color="grey-2" />
            </div>
          </div>
          <div class="row q-col-gutter-md">
            <div class="col-6">
              <q-input v-model="fTerm.fecha_inicio" label="Fecha Inicio *" outlined dense color="primary"
                type="date" stack-label :rules="[(v) => !!v || 'Requerido']" />
            </div>
            <div class="col-6">
              <q-input v-model="fTerm.fecha_terminacion" label="Fecha Terminación *" outlined dense color="primary"
                type="date" stack-label :rules="[(v) => !!v || 'Requerido']" />
            </div>
          </div>
          <div class="row q-col-gutter-md">
            <div class="col-6">
              <q-input v-model.number="fTerm.personas" label="Personas *" outlined dense color="primary"
                type="number" min="1" :rules="[(v) => (!!v && v > 0) || 'Requerido']" />
            </div>
            <div class="col-6">
              <q-select v-model="fTerm.id_causa" :options="causalOpts2"
                option-value="id" option-label="nombre" emit-value map-options
                label="Causal *" outlined dense color="primary" :rules="[(v) => !!v || 'Requerido']" />
            </div>
          </div>
          <q-input v-model="fTerm.observacion" label="Observación *" outlined dense color="primary"
            type="textarea" rows="3" autogrow :rules="[(v) => !!v || 'Requerido']" />
          <p class="text-caption text-negative q-ma-none">* Campos obligatorios</p>
          <div class="row justify-end q-gutter-sm">
            <q-btn flat no-caps label="Cancelar" v-close-popup />
            <q-btn unelevated no-caps icon="add" label="Agregar" color="red-7" type="submit" :loading="savingT" />
          </div>
        </q-form>
      </q-card>
    </q-dialog>

    <!-- ═══════ MODAL NUEVA DISMINUCIÓN ═══════ -->
    <q-dialog v-model="showDisminucion" persistent>
      <q-card style="min-width:560px;max-width:640px">
        <div class="modal-topbar modal-orange">
          <q-icon name="trending_down" color="white" size="20px" class="q-mr-sm" />
          <span class="text-subtitle1 text-white text-weight-bold">Nuevo registro de Disminución Contrato</span>
          <q-space />
          <q-btn flat round dense icon="close" color="white" v-close-popup />
        </div>
        <q-form ref="formDismRef" @submit="submitDisminucion" class="q-pa-lg q-gutter-y-md">
          <q-select v-model="fDism.id_cliente" :options="clienteFilteredD"
            option-value="id" option-label="nombre" emit-value map-options
            label="Cliente *" outlined dense color="primary"
            use-input input-debounce="200" @filter="filterClienteD" :loading="loadingLk"
            :rules="[(v) => !!v || 'Requerido']" hint="DIGITE PARA BUSCAR">
            <template #no-option><q-item><q-item-section class="text-grey">Sin resultados</q-item-section></q-item></template>
          </q-select>
          <div class="row q-col-gutter-md">
            <div class="col-6">
              <q-input v-model.number="fDism.id_supervisor" label="Coordinador Operativo *" outlined dense color="primary"
                type="number" @blur="loadSupD" :rules="[(v) => !!v || 'Requerido']" />
            </div>
            <div class="col-6">
              <q-input v-model="supNombreD" label="Nombre Coordinador" outlined dense readonly bg-color="grey-2" />
            </div>
          </div>
          <div class="row q-col-gutter-md">
            <div class="col-6">
              <q-select v-model="fDism.perfil" :options="perfilOpts2"
                option-value="id" option-label="nombre" emit-value map-options
                label="Perfil" outlined dense color="primary" clearable />
            </div>
            <div class="col-6">
              <q-input v-model="fDism.fecha_terminacion" label="Fecha Terminación *" outlined dense color="primary"
                type="date" stack-label :rules="[(v) => !!v || 'Requerido']" />
            </div>
          </div>
          <div class="row q-col-gutter-md">
            <div class="col-6">
              <q-input v-model.number="fDism.personas" label="Personas *" outlined dense color="primary"
                type="number" min="1" :rules="[(v) => (!!v && v > 0) || 'Requerido']" />
            </div>
            <div class="col-6">
              <q-select v-model="fDism.id_causa" :options="causalOpts2"
                option-value="id" option-label="nombre" emit-value map-options
                label="Causal *" outlined dense color="primary" :rules="[(v) => !!v || 'Requerido']" />
            </div>
          </div>
          <q-input v-model="fDism.fecha_inicio" label="Fecha Inicio *" outlined dense color="primary"
            type="date" stack-label :rules="[(v) => !!v || 'Requerido']" />
          <q-input v-model="fDism.observacion" label="Observación *" outlined dense color="primary"
            type="textarea" rows="3" autogrow :rules="[(v) => !!v || 'Requerido']" />
          <p class="text-caption text-negative q-ma-none">* Campos obligatorios</p>
          <div class="row justify-end q-gutter-sm">
            <q-btn flat no-caps label="Cancelar" v-close-popup />
            <q-btn unelevated no-caps icon="add" label="Agregar" color="orange-8" type="submit" :loading="savingD" />
          </div>
        </q-form>
      </q-card>
    </q-dialog>

    <!-- Anular confirm -->
    <q-dialog v-model="showAnular">
      <q-card style="min-width:340px">
        <q-card-section class="row items-center q-pa-lg">
          <q-avatar icon="block" color="negative" text-color="white" />
          <span class="q-ml-sm">¿Anular contrato de <strong>{{ anulandoRow?.nombre_cliente }}</strong>? Se inactivará pero no se borrará de la base de datos.</span>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat no-caps label="Cancelar" v-close-popup />
          <q-btn unelevated no-caps label="Anular" color="negative" :loading="anulando" @click="doAnular" />
        </q-card-actions>
      </q-card>
    </q-dialog>

  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted } from 'vue'
import { useQuasar, QForm } from 'quasar'
import { api } from 'src/boot/axios'
import { formatDate } from 'src/utils/date'

interface Cliente { id: number; nit: string; nombre: string }
interface LkOpt   { id: number; nombre: string }

interface ContratoRow {
  id: number
  tipo: string
  n_perfil: string | null
  fecha: string
  fecha_inicio: string | null
  fecha_terminacion: string | null
  nit: string | null
  nombre_cliente: string | null
  personas: number | null
  nombre_supervisor: string | null
  id_cliente: number
  usuario_crea: string | null
  usuario_anula: string | null
  causal: string | null
  observacion: string | null
}

const $q = useQuasar()

// ── Table ──
const rows    = ref<ContratoRow[]>([])
const loading = ref(false)
const search  = ref('')
const filterTipo   = ref<string | null>(null)
const filterPerfil = ref<string | null>(null)
const filterFechaDesde = ref('')
const filterFechaHasta = ref('')

const tipoFilterOpts = [
  { label: 'Terminacion', value: 'Terminacion' },
  { label: 'Disminución', value: 'Disminución' },
]
const perfilOpts = computed(() =>
  [...new Set(rows.value.map(r => r.n_perfil).filter(Boolean))]
    .map(p => ({ label: p as string, value: p as string }))
)

const filtered = computed(() => {
  let data = rows.value
  if (filterTipo.value)   data = data.filter(r => r.tipo === filterTipo.value)
  if (filterPerfil.value) data = data.filter(r => r.n_perfil === filterPerfil.value)
  if (filterFechaDesde.value) data = data.filter(r => r.fecha >= filterFechaDesde.value)
  if (filterFechaHasta.value) data = data.filter(r => r.fecha <= filterFechaHasta.value)
  if (search.value) {
    const q = search.value.toLowerCase()
    data = data.filter(r =>
      [r.nombre_cliente, r.nit, r.tipo, r.n_perfil, r.nombre_supervisor, r.causal, r.observacion]
        .some(v => (v ?? '').toLowerCase().includes(q))
    )
  }
  return data
})

const tipoOpts = [
  { label: 'Terminacion', value: 1 },
  { label: 'Disminución', value: 2 },
]

function tipoBadgeColor(tipo: string): string {
  if (tipo === 'Terminacion') return 'red'
  if (tipo === 'Disminución') return 'orange'
  return 'grey'
}

const columns = [
  { name: 'actions',           label: '',                   field: 'actions',           align: 'center' as const, sortable: false },
  { name: 'id',                label: 'Id',                 field: 'id',                align: 'left' as const,   sortable: true },
  { name: 'tipo',              label: 'Tipo',               field: 'tipo',              align: 'left' as const,   sortable: true },
  { name: 'n_perfil',          label: 'N Perfil',           field: 'n_perfil',          align: 'left' as const,   sortable: true },
  { name: 'fecha',             label: 'Fecha',              field: 'fecha',             align: 'left' as const,   sortable: true, format: (v: string | null) => formatDate(v) },
  { name: 'fecha_inicio',      label: 'Fecha Inicio',       field: 'fecha_inicio',      align: 'left' as const,   sortable: true, format: (v: string | null) => formatDate(v) },
  { name: 'fecha_terminacion', label: 'Fecha Terminación',  field: 'fecha_terminacion', align: 'left' as const,   sortable: true, format: (v: string | null) => formatDate(v) },
  { name: 'nit',               label: 'Nit',                field: 'nit',               align: 'left' as const,   sortable: true },
  { name: 'nombre_cliente',    label: 'Nombre Cliente',     field: 'nombre_cliente',    align: 'left' as const,   sortable: true },
  { name: 'personas',          label: 'Personas',           field: 'personas',          align: 'left' as const,   sortable: true },
  { name: 'nombre_supervisor', label: 'Coordinador',        field: 'nombre_supervisor', align: 'left' as const,   sortable: true },
  { name: 'usuario_crea',      label: 'Usuario Crea',       field: 'usuario_crea',      align: 'left' as const,   sortable: true },
  { name: 'usuario_anula',     label: 'Usuario Anula',      field: 'usuario_anula',     align: 'left' as const,   sortable: true },
  { name: 'causal',           label: 'Causa',              field: 'causal',            align: 'left' as const,   sortable: true },
  { name: 'observacion',      label: 'Observación',        field: 'observacion',       align: 'left' as const,   sortable: true },
]

async function loadData() {
  loading.value = true
  try {
    const { data } = await api.get('/contratos')
    rows.value = data
  } catch {
    $q.notify({ type: 'negative', message: 'Error al cargar contratos' })
  } finally { loading.value = false }
}

// ── Form ──
const showForm   = ref(false)
const editingRow = ref<ContratoRow | null>(null)
const saving     = ref(false)

const form = reactive({
  fecha: '',
  id_cliente: null as number | null,
  personas: null as number | null,
  fecha_inicio: '',
  fecha_terminacion: '',
  tipo: null as number | null,
  perfil: null as number | null,
  observacion: '',
})

// La BD devuelve las fechas como timestamp ISO (ej. "2026-06-20T05:00:00.000Z");
// el <input type="date"> requiere "YYYY-MM-DD". Tomamos los primeros 10 caracteres
// para evitar desfases por zona horaria.
function toDateInput(v: string | null): string {
  return v ? String(v).slice(0, 10) : ''
}

function openForm(row: ContratoRow | null) {
  editingRow.value = row
  if (row) {
    Object.assign(form, {
      fecha: toDateInput(row.fecha),
      id_cliente: row.id_cliente ?? null,
      personas: row.personas ?? null,
      fecha_inicio: toDateInput(row.fecha_inicio),
      fecha_terminacion: toDateInput(row.fecha_terminacion),
      tipo: row.tipo === 'Terminacion' ? 1 : row.tipo === 'Disminución' ? 2 : null,
      perfil: null,
      observacion: row.observacion ?? '',
    })
  } else {
    Object.assign(form, {
      fecha: '',
      id_cliente: null,
      personas: null,
      fecha_inicio: '',
      fecha_terminacion: '',
      tipo: null,
      perfil: null,
      observacion: '',
    })
  }
  showForm.value = true
}

async function saveForm() {
  if (!form.fecha) { $q.notify({ type: 'warning', message: 'La fecha es requerida' }); return }
  if (!form.id_cliente) { $q.notify({ type: 'warning', message: 'El ID del cliente es requerido' }); return }
  saving.value = true
  try {
    const payload = {
      fecha: form.fecha || undefined,
      id_cliente: form.id_cliente,
      personas: form.personas ?? undefined,
      fecha_inicio: form.fecha_inicio || undefined,
      fecha_terminacion: form.fecha_terminacion || undefined,
      tipo: form.tipo ?? undefined,
      perfil: form.perfil ?? undefined,
      observacion: form.observacion || undefined,
    }
    if (editingRow.value) {
      await api.put(`/contratos/${editingRow.value.id}`, payload)
      $q.notify({ type: 'positive', message: 'Contrato actualizado', icon: 'check_circle' })
    } else {
      await api.post('/contratos', payload)
      $q.notify({ type: 'positive', message: 'Contrato creado', icon: 'check_circle' })
    }
    showForm.value = false
    await loadData()
  } catch (e: unknown) {
    const err = e as { response?: { data?: { message?: string } } }
    $q.notify({ type: 'negative', message: err.response?.data?.message ?? 'Error al guardar' })
  } finally { saving.value = false }
}

// ── Anular (soft-delete) ──
const showAnular  = ref(false)
const anulandoRow = ref<ContratoRow | null>(null)
const anulando    = ref(false)

function confirmAnular(row: ContratoRow) { anulandoRow.value = row; showAnular.value = true }

async function doAnular() {
  if (!anulandoRow.value) return
  anulando.value = true
  try {
    await api.patch(`/contratos/${anulandoRow.value.id}/anular`)
    $q.notify({ type: 'positive', message: 'Contrato anulado' })
    showAnular.value = false
    await loadData()
  } catch { $q.notify({ type: 'negative', message: 'Error al anular' }) }
  finally { anulando.value = false }
}

// ══════════════════════════════════════════════
// MODALES TERMINACIÓN / DISMINUCIÓN
// ══════════════════════════════════════════════
const loadingLk = ref(false)
const clientes2 = ref<Cliente[]>([])
const causalOpts2 = ref<LkOpt[]>([])
const perfilOpts2 = ref<LkOpt[]>([])

async function loadLookups2() {
  if (clientes2.value.length) return   // ya cargados
  loadingLk.value = true
  try {
    const [cli, cau, per] = await Promise.all([
      api.get('/lookup/clientes'),
      api.get('/lookup/causales'),
      api.get('/lookup/perfiles'),
    ])
    clientes2.value = cli.data
    clienteFilteredT.value = cli.data
    clienteFilteredD.value = cli.data
    causalOpts2.value = cau.data
    perfilOpts2.value = per.data
  } finally { loadingLk.value = false }
}

// ── Terminación ──
const showTerminacion = ref(false)
const formTermRef = ref<QForm | null>(null)
const savingT = ref(false)
const supNombreT = ref('')
const clienteFilteredT = ref<Cliente[]>([])
const today = new Date().toISOString().slice(0, 10)

const fTerm = reactive({
  id_cliente: null as number | null,
  id_supervisor: null as number | null,
  fecha_inicio: today, fecha_terminacion: today,
  personas: null as number | null,
  id_causa: null as number | null,
  observacion: '',
})

function filterClienteT(val: string, update: (fn: () => void) => void) {
  update(() => {
    const q = val.toLowerCase()
    clienteFilteredT.value = q
      ? clientes2.value.filter(c => c.nombre.toLowerCase().includes(q) || (c.nit ?? '').includes(q))
      : clientes2.value
  })
}
async function loadSupT() {
  if (!fTerm.id_supervisor) { supNombreT.value = ''; return }
  const { data } = await api.get(`/lookup/empleado/${fTerm.id_supervisor}`).catch(() => ({ data: null }))
  supNombreT.value = data?.nombre ?? ''
}
async function openTerminacion() {
  await loadLookups2()
  showTerminacion.value = true
}
async function submitTerminacion() {
  savingT.value = true
  try {
    await api.post('/contratos', { tipo: 1, fecha: today, id_cliente: fTerm.id_cliente,
      id_supervisor: fTerm.id_supervisor, id_causa: fTerm.id_causa, personas: fTerm.personas,
      fecha_inicio: fTerm.fecha_inicio, fecha_terminacion: fTerm.fecha_terminacion, observacion: fTerm.observacion })
    $q.notify({ type: 'positive', message: 'Terminación registrada', icon: 'check_circle' })
    showTerminacion.value = false
    Object.assign(fTerm, { id_cliente: null, id_supervisor: null, fecha_inicio: today,
      fecha_terminacion: today, personas: null, id_causa: null, observacion: '' })
    supNombreT.value = ''
    formTermRef.value?.resetValidation()
    await loadData()
  } catch (e: unknown) {
    const err = e as { response?: { data?: { message?: string | string[] } } }
    const msg = err.response?.data?.message
    $q.notify({ type: 'negative', message: Array.isArray(msg) ? msg.join(', ') : (msg ?? 'Error') })
  } finally { savingT.value = false }
}

// ── Disminución ──
const showDisminucion = ref(false)
const formDismRef = ref<QForm | null>(null)
const savingD = ref(false)
const supNombreD = ref('')
const clienteFilteredD = ref<Cliente[]>([])

const fDism = reactive({
  id_cliente: null as number | null,
  id_supervisor: null as number | null,
  perfil: null as number | null,
  fecha_inicio: today, fecha_terminacion: today,
  personas: null as number | null,
  id_causa: null as number | null,
  observacion: '',
})

function filterClienteD(val: string, update: (fn: () => void) => void) {
  update(() => {
    const q = val.toLowerCase()
    clienteFilteredD.value = q
      ? clientes2.value.filter(c => c.nombre.toLowerCase().includes(q) || (c.nit ?? '').includes(q))
      : clientes2.value
  })
}
async function loadSupD() {
  if (!fDism.id_supervisor) { supNombreD.value = ''; return }
  const { data } = await api.get(`/lookup/empleado/${fDism.id_supervisor}`).catch(() => ({ data: null }))
  supNombreD.value = data?.nombre ?? ''
}
async function openDisminucion() {
  await loadLookups2()
  showDisminucion.value = true
}
async function submitDisminucion() {
  savingD.value = true
  try {
    await api.post('/contratos', { tipo: 2, fecha: today, id_cliente: fDism.id_cliente,
      id_supervisor: fDism.id_supervisor, id_causa: fDism.id_causa, perfil: fDism.perfil ?? undefined,
      personas: fDism.personas, fecha_inicio: fDism.fecha_inicio,
      fecha_terminacion: fDism.fecha_terminacion, observacion: fDism.observacion })
    $q.notify({ type: 'positive', message: 'Disminución registrada', icon: 'check_circle' })
    showDisminucion.value = false
    Object.assign(fDism, { id_cliente: null, id_supervisor: null, perfil: null, fecha_inicio: today,
      fecha_terminacion: today, personas: null, id_causa: null, observacion: '' })
    supNombreD.value = ''
    formDismRef.value?.resetValidation()
    await loadData()
  } catch (e: unknown) {
    const err = e as { response?: { data?: { message?: string | string[] } } }
    const msg = err.response?.data?.message
    $q.notify({ type: 'negative', message: Array.isArray(msg) ? msg.join(', ') : (msg ?? 'Error') })
  } finally { savingD.value = false }
}

onMounted(() => { void loadData() })
</script>

<style lang="scss" scoped>
.contratos-page { width: 100%; }

.toolbar-row {
  display: flex; align-items: center; justify-content: space-between;
  gap: 12px; padding: 12px 16px !important;
}
.search-input { width: 280px; }

.tipo-badge { font-size: 11px; font-weight: 600; }

.modal-topbar {
  display: flex; align-items: center;
  padding: 14px 20px;
  border-radius: 4px 4px 0 0;
}
.modal-red    { background: linear-gradient(135deg, #c62828, #e53935); }
.modal-orange { background: linear-gradient(135deg, #e65100, #f57c00); }

.contratos-table {
  :deep(thead tr th) {
    font-weight: 700; font-size: 12px; color: #616161;
    background: #fafafa; text-transform: uppercase; letter-spacing: 0.5px;
  }
  :deep(.q-tr:hover) { background: #f0faf8; }
}

/* ── Full-screen form ── */
.form-fullcard {
  display: flex; flex-direction: column; height: 100%; background: #f5f6fa;
}

.form-topbar {
  display: flex; align-items: center; justify-content: space-between;
  padding: 14px 28px;
  background: linear-gradient(135deg, #0F5A52 0%, #26A69A 100%);
  box-shadow: 0 2px 8px rgba(0,0,0,0.18);
  flex-shrink: 0;
}

.form-body {
  flex: 1; overflow-y: auto; padding: 28px;
}

.form-cols {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  width: 100%;
}

.form-col { display: flex; flex-direction: column; gap: 0; }

.form-section {
  background: white;
  border-radius: 12px;
  padding: 20px 24px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.07);
}

.section-title {
  font-size: 12px; font-weight: 700; color: #0F5A52;
  text-transform: uppercase; letter-spacing: 0.8px;
  margin-bottom: 16px; display: flex; align-items: center;
}

.field-grid-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}
</style>
