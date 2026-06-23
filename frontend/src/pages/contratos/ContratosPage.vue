<template>
  <q-page class="contratos-page q-pa-lg">

    <!-- Header -->
    <div class="page-header q-mb-lg">
      <div class="page-title-area">
        <q-icon name="description" color="primary" size="28px" class="q-mr-sm" />
        <h5 class="q-ma-none text-weight-bold text-grey-9">Contratos</h5>
      </div>
      <q-breadcrumbs class="text-caption q-mt-xs" active-color="primary">
        <q-breadcrumbs-el label="Inicio" to="/app/inicio" />
        <q-breadcrumbs-el label="Contratos" />
      </q-breadcrumbs>
    </div>

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
        flat :rows-per-page-options="[25,50,100]" class="contratos-table">
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
import { useQuasar } from 'quasar'
import { api } from 'src/boot/axios'
import { formatDate } from 'src/utils/date'

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

onMounted(() => { void loadData() })
</script>

<style lang="scss" scoped>
.contratos-page { max-width: 1400px; margin: 0 auto; }

.page-header {
  background: white; border-radius: 12px;
  padding: 20px 24px; box-shadow: 0 1px 4px rgba(0,0,0,0.06);
}
.page-title-area { display: flex; align-items: center; margin-bottom: 4px; }

.toolbar-row {
  display: flex; align-items: center; justify-content: space-between;
  gap: 12px; padding: 12px 16px !important;
}
.search-input { width: 280px; }

.tipo-badge { font-size: 11px; font-weight: 600; }

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
  max-width: 1200px;
  margin: 0 auto;
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
