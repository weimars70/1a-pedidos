<template>
  <q-page class="registrar-contrato-page q-pa-lg">
    <!-- Form card -->
    <q-card flat bordered class="form-card">
      <div class="form-topbar">
        <q-icon name="trending_down" color="white" size="20px" class="q-mr-sm" />
        <span class="text-subtitle1 text-white text-weight-bold">Nuevo registro de Disminución Contrato</span>
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

        <!-- Coordinador Operativo -->
        <div class="field-grid-2 q-mt-md">
          <q-input v-model.number="form.id_supervisor" label="Coordinador Operativo *" outlined dense color="primary"
            type="number" @blur="loadSupervisor" :rules="[(v) => !!v || 'Requerido']" />
          <q-input v-model="supervisorNombre" label="Nombre Coordinador Operativo" outlined dense readonly
            bg-color="grey-2" />
        </div>

        <!-- Perfil / Fecha Terminacion -->
        <div class="field-grid-2 q-mt-md">
          <q-select v-model="form.perfil" :options="perfilOpts"
            option-value="id" option-label="nombre" emit-value map-options
            label="Perfil" outlined dense color="primary" clearable />
          <q-input v-model="form.fecha_terminacion" label="Fecha Terminacion *" outlined dense color="primary"
            type="date" stack-label :rules="[(v) => !!v || 'Requerido']" />
        </div>

        <!-- Personas / Causal -->
        <div class="field-grid-2 q-mt-md">
          <q-input v-model.number="form.personas" label="Personas *" outlined dense color="primary"
            type="number" min="1" :rules="[(v) => (!!v && v > 0) || 'Requerido']" />
          <q-select v-model="form.id_causa" :options="causalOpts"
            option-value="id" option-label="nombre" emit-value map-options
            label="Causal *" outlined dense color="primary"
            :rules="[(v) => !!v || 'Requerido']" />
        </div>

        <!-- Fecha Inicio -->
        <div class="field-grid-2 q-mt-md">
          <q-input v-model="form.fecha_inicio" label="Fecha Inicio *" outlined dense color="primary"
            type="date" stack-label :rules="[(v) => !!v || 'Requerido']" />
          <div></div>
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
  perfil: null as number | null,
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
const perfilOpts = ref<Opt[]>([])

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
    const [cli, cau, per] = await Promise.all([
      api.get('/lookup/clientes'),
      api.get('/lookup/causales'),
      api.get('/lookup/perfiles'),
    ])
    clientes.value = cli.data
    clienteFiltered.value = cli.data
    causalOpts.value = cau.data
    perfilOpts.value = per.data
  } catch {
    $q.notify({ type: 'negative', message: 'Error al cargar listas' })
  } finally { loadingLk.value = false }
}

async function loadSupervisor() {
  if (!form.id_supervisor) { supervisorNombre.value = ''; return }
  try {
    const { data } = await api.get(`/lookup/empleado/${form.id_supervisor}`)
    supervisorNombre.value = data?.nombre ?? ''
    if (!data) $q.notify({ type: 'warning', message: 'Coordinador no encontrado' })
  } catch { supervisorNombre.value = '' }
}

async function onSubmit() {
  saving.value = true
  try {
    await api.post('/contratos', {
      tipo: 2,
      fecha: today,
      id_cliente: form.id_cliente,
      id_supervisor: form.id_supervisor,
      id_causa: form.id_causa,
      perfil: form.perfil ?? undefined,
      personas: form.personas,
      fecha_inicio: form.fecha_inicio,
      fecha_terminacion: form.fecha_terminacion,
      observacion: form.observacion,
    })
    $q.notify({ type: 'positive', message: 'Disminución de contrato registrada', icon: 'check_circle' })
    resetForm()
  } catch (e: unknown) {
    const err = e as { response?: { data?: { message?: string | string[] } } }
    const msg = err.response?.data?.message
    $q.notify({ type: 'negative', message: Array.isArray(msg) ? msg.join(', ') : (msg ?? 'Error al guardar') })
  } finally { saving.value = false }
}

function resetForm() {
  Object.assign(form, {
    id_cliente: null, id_supervisor: null, perfil: null, fecha_inicio: today,
    fecha_terminacion: today, personas: null, id_causa: null, observacion: '',
  })
  supervisorNombre.value = ''
  formRef.value?.resetValidation()
}

onMounted(() => { void loadLookups() })
</script>

<style lang="scss" scoped>
.registrar-contrato-page { width: 100%; }
.form-card { border-radius: 12px; overflow: hidden; }
.form-topbar {
  display: flex; align-items: center;
  padding: 14px 24px;
  background: linear-gradient(135deg, #0F5A52 0%, #26A69A 100%);
}
.form-body { padding: 28px; }
.field-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
</style>
