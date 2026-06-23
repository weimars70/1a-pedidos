<template>
  <q-page class="registrar-contrato-page q-pa-lg">

    <!-- Header -->
    <div class="page-header q-mb-lg">
      <div class="page-title-area">
        <q-icon name="assignment_late" color="primary" size="28px" class="q-mr-sm" />
        <h5 class="q-ma-none text-weight-bold text-grey-9">Nuevo registro de Terminación Contrato</h5>
      </div>
      <q-breadcrumbs class="text-caption q-mt-xs" active-color="primary">
        <q-breadcrumbs-el label="Inicio" to="/app/inicio" />
        <q-breadcrumbs-el label="Contratos" />
        <q-breadcrumbs-el label="Nuevo Terminación Contrato" />
      </q-breadcrumbs>
    </div>

    <!-- Form card -->
    <q-card flat bordered class="form-card">
      <div class="form-topbar">
        <q-icon name="assignment_late" color="white" size="20px" class="q-mr-sm" />
        <span class="text-subtitle1 text-white text-weight-bold">Nuevo registro de Terminación Contrato</span>
      </div>

      <q-form ref="formRef" @submit="onSubmit" class="form-body">

        <!-- Cliente -->
        <div class="field-grid">
          <q-select
            v-model="form.id_cliente"
            :options="clienteFiltered"
            option-value="id" option-label="nombre" emit-value map-options
            label="Cliente *" outlined dense color="primary"
            use-input input-debounce="200" @filter="filterCliente"
            :loading="loadingLk"
            :rules="[(v) => !!v || 'Requerido']" hint="DIGITE PARA BUSCAR">
            <template #no-option>
              <q-item><q-item-section class="text-grey">Sin resultados</q-item-section></q-item>
            </template>
          </q-select>
        </div>

        <!-- Supervisor -->
        <div class="field-grid-2 q-mt-md">
          <q-input v-model.number="form.id_supervisor" label="Id Supervisor *" outlined dense color="primary"
            type="number" @blur="loadSupervisor" :rules="[(v) => !!v || 'Requerido']" />
          <q-input v-model="supervisorNombre" label="Nombre supervisor" outlined dense readonly
            bg-color="grey-2" />
        </div>

        <!-- Fechas / personas / causal -->
        <div class="field-grid-2 q-mt-md">
          <q-input v-model="form.fecha_inicio" label="Fecha Inicio *" outlined dense color="primary"
            type="date" stack-label :rules="[(v) => !!v || 'Requerido']" />
          <q-input v-model="form.fecha_terminacion" label="Fecha Terminacion *" outlined dense color="primary"
            type="date" stack-label :rules="[(v) => !!v || 'Requerido']" />
        </div>
        <div class="field-grid-2 q-mt-md">
          <q-input v-model.number="form.personas" label="Personas *" outlined dense color="primary"
            type="number" min="1" :rules="[(v) => (!!v && v > 0) || 'Requerido']" />
          <q-select v-model="form.id_causa" :options="causalOpts"
            option-value="id" option-label="nombre" emit-value map-options
            label="Causal *" outlined dense color="primary"
            :rules="[(v) => !!v || 'Requerido']" />
        </div>

        <!-- Observacion -->
        <div class="q-mt-md">
          <q-input v-model="form.observacion" label="Observacion *" outlined dense color="primary"
            type="textarea" rows="3" autogrow :rules="[(v) => !!v || 'Requerido']" />
        </div>

        <div class="text-caption text-negative q-mt-sm">* Campos obligatorios</div>

        <div class="row justify-center q-gutter-md q-mt-lg">
          <q-btn unelevated no-caps icon="add" label="Agregar" color="positive" type="submit" :loading="saving" />
          <q-btn flat no-caps icon="arrow_back" label="Volver" color="grey-8" to="/app/contratos" />
        </div>
      </q-form>
    </q-card>

  </q-page>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useQuasar, QForm } from 'quasar'
import { api } from 'src/boot/axios'

interface Cliente { id: number; nit: string; nombre: string }
interface Opt { id: number; nombre: string }

const $q = useQuasar()
const formRef = ref<QForm | null>(null)
const saving = ref(false)
const loadingLk = ref(false)

const today = new Date().toISOString().slice(0, 10)

const form = reactive({
  id_cliente: null as number | null,
  id_supervisor: null as number | null,
  fecha_inicio: today,
  fecha_terminacion: today,
  personas: null as number | null,
  id_causa: null as number | null,
  observacion: '',
})

const supervisorNombre = ref('')

// ── Lookups ──
const clientes = ref<Cliente[]>([])
const clienteFiltered = ref<Cliente[]>([])
const causalOpts = ref<Opt[]>([])

function filterCliente(val: string, update: (fn: () => void) => void) {
  update(() => {
    const q = val.toLowerCase()
    clienteFiltered.value = q
      ? clientes.value.filter(c => c.nombre.toLowerCase().includes(q) || (c.nit ?? '').includes(q))
      : clientes.value
  })
}

async function loadLookups() {
  loadingLk.value = true
  try {
    const [cli, cau] = await Promise.all([
      api.get('/lookup/clientes'),
      api.get('/lookup/causales'),
    ])
    clientes.value = cli.data
    clienteFiltered.value = cli.data
    causalOpts.value = cau.data
  } catch {
    $q.notify({ type: 'negative', message: 'Error al cargar listas' })
  } finally { loadingLk.value = false }
}

async function loadSupervisor() {
  if (!form.id_supervisor) { supervisorNombre.value = ''; return }
  try {
    const { data } = await api.get(`/lookup/empleado/${form.id_supervisor}`)
    supervisorNombre.value = data?.nombre ?? ''
    if (!data) $q.notify({ type: 'warning', message: 'Supervisor no encontrado' })
  } catch { supervisorNombre.value = '' }
}

async function onSubmit() {
  saving.value = true
  try {
    await api.post('/contratos', {
      tipo: 1,
      fecha: today,
      id_cliente: form.id_cliente,
      id_supervisor: form.id_supervisor,
      id_causa: form.id_causa,
      personas: form.personas,
      fecha_inicio: form.fecha_inicio,
      fecha_terminacion: form.fecha_terminacion,
      observacion: form.observacion,
    })
    $q.notify({ type: 'positive', message: 'Terminación de contrato registrada', icon: 'check_circle' })
    resetForm()
  } catch (e: unknown) {
    const err = e as { response?: { data?: { message?: string | string[] } } }
    const msg = err.response?.data?.message
    $q.notify({ type: 'negative', message: Array.isArray(msg) ? msg.join(', ') : (msg ?? 'Error al guardar') })
  } finally { saving.value = false }
}

function resetForm() {
  Object.assign(form, {
    id_cliente: null, id_supervisor: null, fecha_inicio: today,
    fecha_terminacion: today, personas: null, id_causa: null, observacion: '',
  })
  supervisorNombre.value = ''
  formRef.value?.resetValidation()
}

onMounted(() => { void loadLookups() })
</script>

<style lang="scss" scoped>
.registrar-contrato-page { max-width: 900px; margin: 0 auto; }
.page-header {
  background: white; border-radius: 12px;
  padding: 20px 24px; box-shadow: 0 1px 4px rgba(0,0,0,0.06);
}
.page-title-area { display: flex; align-items: center; margin-bottom: 4px; }

.form-card { border-radius: 12px; overflow: hidden; }
.form-topbar {
  display: flex; align-items: center;
  padding: 14px 24px;
  background: linear-gradient(135deg, #0F5A52 0%, #26A69A 100%);
}
.form-body { padding: 28px; }
.field-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
</style>
