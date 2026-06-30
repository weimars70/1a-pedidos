<template>
  <q-page class="registra-pedidos-page q-pa-md">

    <!-- ═══════════════════════════ PAGE HEADER ═══════════════════════════ -->
    <div class="page-header q-mb-md">
      <div class="header-gradient">
        <div class="row items-center q-gutter-sm">
          <q-icon name="assignment_add" color="white" size="28px" />
          <div>
            <div class="text-h6 text-white text-weight-bold q-ma-none">Registrar Pedido</div>
          </div>
        </div>
      </div>
    </div>

    <!-- ═══════════════════════════ HEADER FORM ═══════════════════════════ -->
    <q-card flat bordered class="q-mb-md">
      <q-card-section class="q-pb-sm">
        <div class="section-label q-mb-sm">
          <q-icon name="business" size="16px" class="q-mr-xs" />Datos del Cliente y Pedido
        </div>

        <!-- Row 1: Empresa | Dirección | Fecha Pedido | Supervisor | Sector -->
        <div class="row q-gutter-sm q-mb-sm">
          <div class="col">
            <q-select
              v-model="selectedCliente"
              label="Empresa *"
              outlined dense
              use-input
              input-debounce="0"
              option-label="nombre"
              option-value="id"
              :options="clientesFiltrados"
              @filter="filtrarClientes"
              @update:model-value="onClienteSelected"
              clearable
              color="teal"
            >
              <template #no-option>
                <q-item>
                  <q-item-section class="text-grey">Sin resultados</q-item-section>
                </q-item>
              </template>
              <template #option="scope">
                <q-item v-bind="scope.itemProps">
                  <q-item-section>
                    <q-item-label>{{ scope.opt.nombre }}</q-item-label>
                    <q-item-label caption>NIT: {{ scope.opt.nit }} | {{ scope.opt.ciudad }}</q-item-label>
                  </q-item-section>
                </q-item>
              </template>
            </q-select>
          </div>
          <div class="col">
            <q-input v-model="pedido.direccion" label="Dirección *" outlined dense color="teal" readonly />
          </div>
          <div class="col">
            <q-input
              v-model="pedido.fecha_pedido"
              label="Fecha Pedido *"
              outlined dense color="teal"
              type="date"
              stack-label
            />
          </div>
          <div class="col">
            <q-input v-model="pedido.nombre_asesor" label="Nombre Supervisor *" outlined dense color="teal" />
          </div>
          <div class="col">
            <q-select
              v-model="pedido.sector"
              label="Sector Económico *"
              outlined dense color="teal"
              :options="sectores"
              option-label="nombre"
              option-value="nombre"
              emit-value
              map-options
            />
          </div>
        </div>

        <!-- Row 2: Contacto | Nit | Teléfono | Id Cliente | Ciudad | EPP | Insumos | Facturación -->
        <div class="row q-gutter-sm">
          <div class="col">
            <q-input v-model="pedido.contacto" label="Contacto *" outlined dense color="teal" readonly />
          </div>
          <div class="col">
            <q-input v-model="pedido.nit" label="Nit *" outlined dense color="teal" readonly />
          </div>
          <div class="col">
            <q-input v-model="pedido.telefono" label="Teléfono *" outlined dense color="teal" readonly />
          </div>
          <div class="col">
            <q-input v-model="pedido.id_cliente" label="Id Cliente *" outlined dense color="teal" readonly />
          </div>
          <div class="col">
            <q-input v-model="pedido.ciudad" label="Ciudad *" outlined dense color="teal" readonly />
          </div>
          <div class="col-auto" style="min-width: 110px">
            <q-select
              v-model="pedido.epp"
              label="Aplica EPP *"
              outlined dense color="teal"
              :options="eppOpciones"
              emit-value
              map-options
            />
          </div>
          <div class="col-auto" style="min-width: 110px">
            <q-input
              v-model.number="pedido.insumos"
              label="Insumos *"
              outlined dense color="teal"
              type="number"
              min="0"
            />
          </div>
          <div class="col-auto" style="min-width: 120px">
            <q-select
              v-model="pedido.facturado"
              label="Facturación *"
              outlined dense color="teal"
              :options="facturacionOpciones"
              emit-value
              map-options
            />
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- ═══════════════════════════ TABS ═══════════════════════════ -->
    <q-card flat bordered class="q-mb-md">
      <q-tabs
        v-model="tabActivo"
        dense
        align="left"
        active-color="teal"
        indicator-color="teal"
        class="text-grey-7"
        narrow-indicator
      >
        <q-tab name="personal" label="Personal" icon="people" />
        <q-tab name="especiales" label="Servicios Especiales" icon="star_outline" />
        <q-tab name="elementos" label="Elementos pp" icon="inventory_2" />
      </q-tabs>

      <q-separator />

      <q-tab-panels v-model="tabActivo" animated>

        <!-- ─── TAB: PERSONAL ─── -->
        <q-tab-panel name="personal" class="q-pa-md">

          <!-- Sub-form de personal -->
          <q-card flat bordered class="q-mb-md sub-form-card">
            <q-card-section class="q-pb-xs">
              <div class="section-label q-mb-sm">
                <q-icon name="person_add" size="16px" class="q-mr-xs" />Agregar Personal
              </div>

              <!-- Sub-form Row 1 -->
              <div class="row q-gutter-sm q-mb-sm">
                <div class="col">
                  <q-select
                    v-model="personalForm.tipo_perfil"
                    label="Perfil"
                    outlined dense color="teal"
                    :options="perfiles"
                    option-label="nombre"
                    option-value="id"
                    emit-value
                    map-options
                    @update:model-value="onPerfilSelected"
                  />
                </div>
                <div class="col-auto" style="min-width:110px">
                  <q-input
                    v-model.number="personalForm.nro_personas"
                    label="Personas"
                    outlined dense color="teal"
                    type="number"
                    min="1"
                  />
                </div>
                <div class="col">
                  <q-input
                    v-model="personalForm.fecha_inicio"
                    label="Fecha Inicio"
                    outlined dense color="teal"
                    type="date"
                    stack-label
                  />
                </div>
                <div class="col">
                  <q-input
                    v-model="personalForm.fecha_final"
                    label="Fecha Fin"
                    outlined dense color="teal"
                    type="date"
                    stack-label
                  />
                </div>
                <div class="col">
                  <q-select
                    v-model="personalForm.tipo_servicio"
                    label="Tipo Servicio"
                    outlined dense color="teal"
                    :options="tiposServicio"
                    option-label="nombre"
                    option-value="id"
                    emit-value
                    map-options
                    @update:model-value="onTipoServicioSelected"
                  />
                </div>
                <div class="col">
                  <q-select
                    v-model="personalForm.sexo"
                    label="Género"
                    outlined dense color="teal"
                    :options="generoOpciones"
                    option-label="nombre"
                    option-value="id"
                    emit-value
                    map-options
                    @update:model-value="onGeneroSelected"
                  />
                </div>
                <div class="col-auto" style="min-width:130px">
                  <q-input
                    v-model.number="personalForm.pedido_anterior"
                    label="Pedido Anterior"
                    outlined dense color="teal"
                    type="number"
                    min="0"
                  />
                </div>
                <div class="col-auto" style="min-width:170px">
                  <q-select
                    v-model="personalForm.per_recomendacion"
                    label="Personal con Recomendación"
                    outlined dense color="teal"
                    :options="recomendacionOpciones"
                    emit-value
                    map-options
                  />
                </div>
              </div>

              <!-- Sub-form Row 2 -->
              <div class="row q-gutter-sm items-start">
                <div class="col">
                  <q-input
                    v-model.number="personalForm.valor_servicio"
                    label="Valor Servicio"
                    outlined dense color="teal"
                    type="number"
                    min="0"
                  />
                </div>
                <div class="col-auto" style="min-width:120px">
                  <q-input
                    v-model="personalForm.hora_inicio"
                    label="Hora Inicial"
                    outlined dense color="teal"
                    type="time"
                    stack-label
                  />
                </div>
                <div class="col-auto" style="min-width:120px">
                  <q-input
                    v-model="personalForm.hora_final"
                    label="Hora Final"
                    outlined dense color="teal"
                    type="time"
                    stack-label
                  />
                </div>
                <div class="col-auto" style="min-width:130px">
                  <q-select
                    v-model="personalForm.riesgo_arl"
                    label="Riesgo ARL"
                    outlined dense color="teal"
                    :options="riesgosArl"
                    option-label="id"
                    option-value="id"
                    emit-value
                    map-options
                  />
                </div>
                <div class="col">
                  <q-input
                    v-model.number="personalForm.bonificacion"
                    label="Bonificación"
                    outlined dense color="teal"
                    type="number"
                    min="0"
                  />
                </div>
                <div class="col-2">
                  <q-input
                    v-model="personalForm.observaciones"
                    label="Observaciones"
                    outlined dense color="teal"
                  />
                </div>
                <div class="col-auto flex items-end">
                  <q-btn
                    unelevated
                    no-caps
                    icon="add"
                    label="Agregar"
                    color="teal"
                    @click="agregarPersonal"
                    :disable="!personalForm.tipo_perfil"
                  />
                </div>
              </div>
            </q-card-section>
          </q-card>

          <!-- Tabla de personal -->
          <q-table
            :rows="personalRows"
            :columns="columnaPersonal"
            row-key="_idx"
            flat
            bordered
            dense
            :rows-per-page-options="[0]"
            hide-pagination
            no-data-label="Sin personal agregado. Use el formulario de arriba."
          >
            <template #body-cell-eliminar="props">
              <q-td :props="props">
                <q-btn
                  flat round dense
                  icon="delete"
                  color="negative"
                  size="sm"
                  @click="eliminarPersonal(props.rowIndex)"
                >
                  <q-tooltip>Eliminar fila</q-tooltip>
                </q-btn>
              </q-td>
            </template>
            <template #body-cell-valor_servicio="props">
              <q-td :props="props">
                {{ formatCurrency(props.row.valor_servicio) }}
              </q-td>
            </template>
            <template #body-cell-bonificacion="props">
              <q-td :props="props">
                {{ formatCurrency(props.row.bonificacion) }}
              </q-td>
            </template>
            <template #no-data="{ message }">
              <div class="full-width column flex-center text-grey-5 q-py-lg">
                <q-icon name="people_outline" size="40px" class="q-mb-sm" />
                <span class="text-caption">{{ message }}</span>
              </div>
            </template>
          </q-table>
        </q-tab-panel>

        <!-- ─── TAB: SERVICIOS ESPECIALES ─── -->
        <q-tab-panel name="especiales" class="q-pa-xl">
          <div class="column flex-center text-grey-5" style="min-height:120px">
            <q-icon name="construction" size="48px" class="q-mb-sm" />
            <span class="text-subtitle1">Próximamente</span>
            <span class="text-caption">Esta sección está en desarrollo</span>
          </div>
        </q-tab-panel>

        <!-- ─── TAB: ELEMENTOS PP ─── -->
        <q-tab-panel name="elementos" class="q-pa-xl">
          <div class="column flex-center text-grey-5" style="min-height:120px">
            <q-icon name="construction" size="48px" class="q-mb-sm" />
            <span class="text-subtitle1">Próximamente</span>
            <span class="text-caption">Esta sección está en desarrollo</span>
          </div>
        </q-tab-panel>

      </q-tab-panels>
    </q-card>

    <!-- ═══════════════════════════ BOTTOM ACTIONS ═══════════════════════════ -->
    <div class="row q-gutter-sm justify-end q-mt-sm">
      <q-btn
        unelevated
        no-caps
        icon="cleaning_services"
        label="Limpiar"
        color="grey-5"
        text-color="white"
        @click="limpiarForm"
      />
      <q-btn
        unelevated
        no-caps
        icon="save"
        label="Guardar Pedido"
        color="teal"
        :loading="guardando"
        @click="guardarPedido"
      />
    </div>

  </q-page>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { api } from 'src/boot/axios'
import { formatDate } from 'src/utils/date'

// ─────────────────────────── INTERFACES ────────────────────────────

interface ClienteOption {
  id: number
  nit: string
  nombre: string
  direccion: string
  telefono: string
  contacto: string
  ciudad: string
}

interface PerfilOption {
  id: number
  nombre: string
}

interface TipoServicioOption {
  id: number
  nombre: string
}

interface SectorOption {
  id: number
  nombre: string
}

interface RiesgoOption {
  id: number
}

interface PersonalRow {
  tipo_perfil: number | null
  perfil_nombre: string
  nro_personas: number
  fecha_inicio: string
  fecha_final: string
  tipo_servicio: number | null
  tipo_servicio_nombre: string
  sexo: number | null
  sexo_nombre: string
  pedido_anterior: number
  per_recomendacion: string
  valor_servicio: number
  hora_inicio: string
  hora_final: string
  riesgo_arl: number | null
  bonificacion: number
  observaciones: string
  _idx: number
}

// ─────────────────────────── QUASAR ────────────────────────────────

const $q = useQuasar()

// ─────────────────────────── LOOKUP DATA ───────────────────────────

const clientes       = ref<ClienteOption[]>([])
const clientesFiltrados = ref<ClienteOption[]>([])
const perfiles       = ref<PerfilOption[]>([])
const tiposServicio  = ref<TipoServicioOption[]>([])
const sectores       = ref<SectorOption[]>([])
const riesgosArl     = ref<RiesgoOption[]>([])

const generoOpciones: { id: number; nombre: string }[] = [
  { id: 1, nombre: 'Masculino' },
  { id: 2, nombre: 'Femenino' },
]

const eppOpciones          = ['NO', 'SI']
const facturacionOpciones  = ['No', 'Si']
const recomendacionOpciones = ['NO', 'SI']

// ─────────────────────────── ESTADO TABS ───────────────────────────

const tabActivo = ref<string>('personal')

// ─────────────────────────── PEDIDO FORM ───────────────────────────

function todayStr(): string {
  return new Date().toISOString().slice(0, 10)
}

const emptyPedido = () => ({
  id_cliente:    null as number | null,
  nit:           '',
  nombre:        '',
  direccion:     '',
  telefono:      '',
  contacto:      '',
  ciudad:        '',
  fecha_pedido:  todayStr(),
  nombre_asesor: '',
  sector:        '',
  epp:           'NO',
  insumos:       0,
  facturado:     'No',
})

const pedido = reactive(emptyPedido())
const selectedCliente = ref<ClienteOption | null>(null)

// ─────────────────────────── PERSONAL SUB-FORM ─────────────────────

let _personalIdx = 0

const emptyPersonalForm = () => ({
  tipo_perfil:      null as number | null,
  perfil_nombre:    '',
  nro_personas:     1,
  fecha_inicio:     '',
  fecha_final:      '',
  tipo_servicio:    null as number | null,
  tipo_servicio_nombre: '',
  sexo:             null as number | null,
  sexo_nombre:      '',
  pedido_anterior:  0,
  per_recomendacion: 'NO',
  valor_servicio:   0,
  hora_inicio:      '',
  hora_final:       '',
  riesgo_arl:       null as number | null,
  bonificacion:     0,
  observaciones:    '',
})

const personalForm = reactive(emptyPersonalForm())
const personalRows = ref<PersonalRow[]>([])

// ─────────────────────────── TABLA PERSONAL — COLUMNAS ─────────────

const columnaPersonal = [
  { name: 'eliminar',             label: '',                field: 'eliminar',             align: 'center' as const, sortable: false },
  { name: 'perfil_nombre',        label: 'Tipo Perfil',     field: 'perfil_nombre',        align: 'left' as const,   sortable: true  },
  { name: 'nro_personas',         label: 'Nro Personas',    field: 'nro_personas',         align: 'center' as const, sortable: false },
  { name: 'fecha_inicio',         label: 'Fecha Inicio',    field: 'fecha_inicio',         align: 'left' as const,   sortable: false, format: (v: string | null) => formatDate(v) },
  { name: 'fecha_final',          label: 'Fecha Final',     field: 'fecha_final',          align: 'left' as const,   sortable: false, format: (v: string | null) => formatDate(v) },
  { name: 'tipo_servicio_nombre', label: 'Tipo Servicio',   field: 'tipo_servicio_nombre', align: 'left' as const,   sortable: false, style: 'white-space: normal; word-break: break-word; max-width: 500px; min-width: 300px;' },
  { name: 'sexo_nombre',          label: 'Género',          field: 'sexo_nombre',          align: 'left' as const,   sortable: false },
  { name: 'per_recomendacion',    label: 'Recomendación',   field: 'per_recomendacion',    align: 'center' as const, sortable: false },
  { name: 'valor_servicio',       label: 'Valor Servicio',  field: 'valor_servicio',       align: 'right' as const,  sortable: false },
  { name: 'hora_inicio',          label: 'Hora Inicio',     field: 'hora_inicio',          align: 'center' as const, sortable: false },
  { name: 'hora_final',           label: 'Hora Final',      field: 'hora_final',           align: 'center' as const, sortable: false },
  { name: 'riesgo_arl',           label: 'Riesgo ARL',      field: 'riesgo_arl',           align: 'center' as const, sortable: false },
  { name: 'bonificacion',         label: 'Bonificación',    field: 'bonificacion',         align: 'right' as const,  sortable: false },
  { name: 'observaciones',        label: 'Observaciones',   field: 'observaciones',        align: 'left' as const,   sortable: false, style: 'white-space: normal; word-break: break-word; max-width: 500px; min-width: 300px;' },
]

// ─────────────────────────── GUARDANDO ─────────────────────────────

const guardando = ref(false)

// ─────────────────────────── LOAD LOOKUPS ──────────────────────────

async function cargarLookups() {
  try {
    const [resClientes, resPerfiles, resTipos, resSectores, resRiesgos] = await Promise.all([
      api.get<ClienteOption[]>('/lookup/clientes'),
      api.get<PerfilOption[]>('/lookup/perfiles'),
      api.get<TipoServicioOption[]>('/lookup/tipo-servicio'),
      api.get<SectorOption[]>('/lookup/sectores'),
      api.get<RiesgoOption[]>('/lookup/riesgo-arl'),
    ])
    clientes.value      = resClientes.data
    clientesFiltrados.value = resClientes.data
    perfiles.value      = resPerfiles.data
    tiposServicio.value = resTipos.data
    sectores.value      = resSectores.data
    riesgosArl.value    = resRiesgos.data
  } catch {
    $q.notify({ type: 'negative', message: 'Error al cargar datos de referencia' })
  }
}

// ─────────────────────────── AUTOCOMPLETE CLIENTE ──────────────────

function filtrarClientes(val: string, update: (fn: () => void) => void) {
  update(() => {
    if (!val) {
      clientesFiltrados.value = clientes.value
      return
    }
    const q = val.toLowerCase()
    clientesFiltrados.value = clientes.value.filter(
      c => c.nombre.toLowerCase().includes(q) || c.nit.toLowerCase().includes(q)
    )
  })
}

function onClienteSelected(cliente: ClienteOption | null) {
  if (cliente) {
    pedido.id_cliente = cliente.id
    pedido.nit        = cliente.nit
    pedido.nombre     = cliente.nombre
    pedido.direccion  = cliente.direccion
    pedido.telefono   = cliente.telefono
    pedido.contacto   = cliente.contacto
    pedido.ciudad     = cliente.ciudad
  } else {
    Object.assign(pedido, {
      id_cliente: null, nit: '', nombre: '', direccion: '',
      telefono: '', contacto: '', ciudad: '',
    })
  }
}

// ─────────────────────────── SUB-FORM HELPERS ──────────────────────

function onPerfilSelected(id: number | null) {
  const found = perfiles.value.find(p => p.id === id)
  personalForm.perfil_nombre = found ? found.nombre : ''
}

function onTipoServicioSelected(id: number | null) {
  const found = tiposServicio.value.find(t => t.id === id)
  personalForm.tipo_servicio_nombre = found ? found.nombre : ''
}

function onGeneroSelected(id: number | null) {
  const found = generoOpciones.find(g => g.id === id)
  personalForm.sexo_nombre = found ? found.nombre : ''
}

// ─────────────────────────── AGREGAR PERSONAL ──────────────────────

function agregarPersonal() {
  if (!personalForm.tipo_perfil) {
    $q.notify({ type: 'warning', message: 'Seleccione un perfil' })
    return
  }
  personalRows.value.push({
    ...personalForm,
    _idx: _personalIdx++,
  })
  Object.assign(personalForm, emptyPersonalForm())
}

function eliminarPersonal(index: number) {
  personalRows.value.splice(index, 1)
}

// ─────────────────────────── GUARDAR PEDIDO ────────────────────────

async function guardarPedido() {
  // Validaciones básicas
  if (!pedido.id_cliente) {
    $q.notify({ type: 'warning', message: 'Seleccione una empresa' })
    return
  }
  if (!pedido.fecha_pedido) {
    $q.notify({ type: 'warning', message: 'Ingrese la fecha del pedido' })
    return
  }
  if (!pedido.nombre_asesor.trim()) {
    $q.notify({ type: 'warning', message: 'Ingrese el nombre del supervisor' })
    return
  }
  if (personalRows.value.length === 0) {
    $q.notify({ type: 'warning', message: 'Agregue al menos una fila de personal' })
    return
  }

  guardando.value = true
  try {
    const payload = {
      pedido: {
        nit:          pedido.nit,
        nombre:       pedido.nombre,
        fecha_pedido: pedido.fecha_pedido,
        id_cliente:   pedido.id_cliente,
        nombre_asesor: pedido.nombre_asesor,
        ciudad:       pedido.ciudad,
        direccion:    pedido.direccion,
        telefono:     pedido.telefono,
        epp:          pedido.epp,
        insumos:      pedido.insumos,
        facturado:    pedido.facturado,
        usuario:      'SISTEMA',
      },
      personal: personalRows.value.map(r => ({
        tipo_perfil:      r.tipo_perfil,
        nro_personas:     r.nro_personas,
        fecha_inicio:     r.fecha_inicio,
        fecha_final:      r.fecha_final,
        tipo_servicio:    r.tipo_servicio,
        sexo:             r.sexo,
        pedido_anterior:  r.pedido_anterior,
        per_recomendacion: r.per_recomendacion,
        valor_servicio:   r.valor_servicio,
        hora_inicio:      r.hora_inicio,
        hora_final:       r.hora_final,
        riesgo_arl:       r.riesgo_arl,
        bonificacion:     r.bonificacion,
        observaciones:    r.observaciones,
      })),
    }

    await api.post('/pedidos/registrar', payload)

    $q.notify({
      type: 'positive',
      message: 'Pedido registrado exitosamente',
      icon: 'check_circle',
      timeout: 3000,
    })

    limpiarForm()
  } catch (e: unknown) {
    const err = e as { response?: { data?: { message?: string } } }
    $q.notify({
      type: 'negative',
      message: err.response?.data?.message ?? 'Error al registrar el pedido',
    })
  } finally {
    guardando.value = false
  }
}

// ─────────────────────────── LIMPIAR ───────────────────────────────

function limpiarForm() {
  selectedCliente.value = null
  Object.assign(pedido, emptyPedido())
  Object.assign(personalForm, emptyPersonalForm())
  personalRows.value = []
  tabActivo.value = 'personal'
}

// ─────────────────────────── HELPERS ───────────────────────────────

function formatCurrency(value: number): string {
  if (!value && value !== 0) return ''
  return new Intl.NumberFormat('es-CO', {
    style: 'currency', currency: 'COP', maximumFractionDigits: 0,
  }).format(value)
}

// ─────────────────────────── LIFECYCLE ─────────────────────────────

onMounted(() => {
  void cargarLookups()
})
</script>

<style lang="scss" scoped>
.registra-pedidos-page {
  width: 100%;
}

/* ── Page header ── */
.header-gradient {
  background: linear-gradient(135deg, #0F5A52 0%, #26A69A 100%);
  padding: 18px 24px;
}

/* ── Section labels ── */
.section-label {
  display: flex;
  align-items: center;
  font-size: 11px;
  font-weight: 700;
  color: #0F5A52;
  text-transform: uppercase;
  letter-spacing: 0.8px;
}

/* ── Sub-form card ── */
.sub-form-card {
  background: #f9fffe;
  border-color: #b2dfdb !important;
}

/* ── Table header ── */
:deep(.q-table thead tr th) {
  font-size: 11px;
  font-weight: 700;
  color: #546e7a;
  background: #f5f5f5;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  white-space: nowrap;
}

:deep(.q-table tbody tr:hover) {
  background: #e0f2f1;
}

/* ── Tab styles ── */
:deep(.q-tab__label) {
  font-size: 13px;
  font-weight: 600;
}
</style>
