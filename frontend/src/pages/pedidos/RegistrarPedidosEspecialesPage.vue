<template>
  <q-page class="registrar-esp-page q-pa-md">

    <!-- ═══════════════════════════ PAGE HEADER ═══════════════════════════ -->
    <div class="page-header q-mb-md">
      <div class="header-gradient">
        <div class="row items-center q-gutter-sm">
          <q-icon name="star_rate" color="white" size="28px" />
          <div>
            <div class="text-h6 text-white text-weight-bold q-ma-none">Registrar Pedido Especial</div>
            <q-breadcrumbs class="text-caption" active-color="white" separator-color="white" style="opacity:0.8">
              <q-breadcrumbs-el label="Inicio" to="/app/inicio" />
              <q-breadcrumbs-el label="Pedidos" />
              <q-breadcrumbs-el label="Pedidos Especiales" />
            </q-breadcrumbs>
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
              color="indigo"
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
            <q-input v-model="pedido.direccion" label="Dirección" outlined dense color="indigo" readonly />
          </div>
          <div class="col">
            <q-input
              v-model="pedido.fecha_pedido"
              label="Fecha Pedido *"
              outlined dense color="indigo"
              type="date"
              stack-label
            />
          </div>
          <div class="col">
            <q-input v-model="pedido.nombre_supervisor" label="Nombre Supervisor *" outlined dense color="indigo" />
          </div>
          <div class="col">
            <q-select
              v-model="pedido.id_sector"
              label="Sector Económico"
              outlined dense color="indigo"
              :options="sectores"
              option-label="nombre"
              option-value="id"
              emit-value
              map-options
            />
          </div>
        </div>

        <!-- Row 2: Contacto | NIT | Teléfono | Id Cliente | Ciudad -->
        <div class="row q-gutter-sm">
          <div class="col">
            <q-input v-model="pedido.contacto" label="Contacto" outlined dense color="indigo" readonly />
          </div>
          <div class="col">
            <q-input v-model="pedido.nit" label="NIT" outlined dense color="indigo" readonly />
          </div>
          <div class="col">
            <q-input v-model="pedido.telefono" label="Teléfono" outlined dense color="indigo" readonly />
          </div>
          <div class="col">
            <q-input v-model="pedido.id_cliente" label="Id Cliente" outlined dense color="indigo" readonly />
          </div>
          <div class="col">
            <q-input v-model="pedido.ciudad" label="Ciudad" outlined dense color="indigo" readonly />
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- ═══════════════════════════ SERVICIOS ESPECIALES ═══════════════════════════ -->
    <q-card flat bordered class="q-mb-md">
      <q-card-section>
        <div class="section-label q-mb-sm">
          <q-icon name="star_outline" size="16px" class="q-mr-xs" />Servicios Especiales
        </div>

        <!-- Row 1 — Cost fields -->
        <div class="row q-gutter-sm q-mb-md">
          <div class="col-auto" style="min-width:110px">
            <q-input v-model.number="pedido.personas_esp" label="#Personas" outlined dense color="indigo" type="number" min="0" />
          </div>
          <div class="col-auto" style="min-width:110px">
            <q-input v-model.number="pedido.dias_esp" label="#Días" outlined dense color="indigo" type="number" min="0" />
          </div>
          <div class="col">
            <q-input v-model.number="pedido.mano_obra_esp" label="Mano de Obra" outlined dense color="indigo" type="number" min="0" />
          </div>
          <div class="col">
            <q-input v-model.number="pedido.insumos_esp" label="Insumos" outlined dense color="indigo" type="number" min="0" />
          </div>
          <div class="col">
            <q-input v-model.number="pedido.transporte_esp" label="Transporte" outlined dense color="indigo" type="number" min="0" />
          </div>
          <div class="col">
            <q-input v-model.number="pedido.valor_servicio_esp" label="Valor Servicio" outlined dense color="indigo" type="number" min="0" />
          </div>
          <div class="col">
            <q-input v-model.number="pedido.depreciacion_esp" label="Depreciación" outlined dense color="indigo" type="number" min="0" />
          </div>
          <div class="col">
            <q-input v-model.number="pedido.imprevistos_esp" label="Imprevistos" outlined dense color="indigo" type="number" min="0" />
          </div>
          <div class="col">
            <q-input v-model.number="pedido.iva_esp" label="IVA" outlined dense color="indigo" type="number" min="0" />
          </div>
          <div class="col">
            <q-input v-model.number="pedido.comision_esp" label="Comisión" outlined dense color="indigo" type="number" min="0" />
          </div>
          <div class="col">
            <q-input v-model.number="pedido.otros_esp" label="Otros" outlined dense color="indigo" type="number" min="0" />
          </div>
          <div class="col">
            <q-input v-model.number="pedido.epp_esp" label="EPP" outlined dense color="indigo" type="number" min="0" />
          </div>
          <div class="col">
            <q-input v-model.number="pedido.utilidad_esp" label="Utilidad" outlined dense color="indigo" type="number" min="0" />
          </div>
        </div>

        <!-- Row 2 — Machinery sub-form -->
        <q-card flat bordered class="q-mb-md sub-form-card">
          <q-card-section class="q-pb-xs">
            <div class="section-label q-mb-sm">
              <q-icon name="construction" size="16px" class="q-mr-xs" />Agregar Maquinaria / Equipo
            </div>

            <div class="row q-gutter-sm q-mb-sm">
              <div class="col">
                <q-select
                  v-model="equipoForm.tipo_equipo"
                  label="Tipo Equipo *"
                  outlined dense color="indigo"
                  :options="tiposEquipo"
                  option-label="nombre"
                  option-value="id"
                  emit-value
                  map-options
                />
              </div>
              <div class="col-auto" style="min-width:100px">
                <q-input v-model.number="equipoForm.cantidad" label="Cantidad" outlined dense color="indigo" type="number" min="0" />
              </div>
              <div class="col-auto" style="min-width:100px">
                <q-input v-model.number="equipoForm.dias" label="Días" outlined dense color="indigo" type="number" min="0" />
              </div>
              <div class="col-auto" style="min-width:100px">
                <q-input v-model.number="equipoForm.personas" label="Personas" outlined dense color="indigo" type="number" min="0" />
              </div>
              <div class="col">
                <q-select
                  v-model="equipoForm.tipo_servicio"
                  label="Tipo Servicio"
                  outlined dense color="indigo"
                  :options="tiposServicio"
                  option-label="nombre"
                  option-value="id"
                  emit-value
                  map-options
                />
              </div>
              <div class="col-auto" style="min-width:100px">
                <q-select
                  v-model="equipoForm.genero"
                  label="Género"
                  outlined dense color="indigo"
                  :options="generoOpciones"
                  emit-value
                  map-options
                />
              </div>
            </div>

            <div class="row q-gutter-sm items-start">
              <div class="col">
                <q-input v-model.number="equipoForm.valor_servicio" label="Valor Servicio" outlined dense color="indigo" type="number" min="0" />
              </div>
              <div class="col">
                <q-input v-model.number="equipoForm.mano_obra" label="Mano de Obra" outlined dense color="indigo" type="number" min="0" />
              </div>
              <div class="col">
                <q-input v-model.number="equipoForm.imprevistos" label="Imprevistos" outlined dense color="indigo" type="number" min="0" />
              </div>
              <div class="col">
                <q-input v-model.number="equipoForm.insumos" label="Insumos" outlined dense color="indigo" type="number" min="0" />
              </div>
              <div class="col">
                <q-input v-model.number="equipoForm.transporte" label="Transporte" outlined dense color="indigo" type="number" min="0" />
              </div>
              <div class="col">
                <q-input v-model.number="equipoForm.depreciacion" label="Depreciación" outlined dense color="indigo" type="number" min="0" />
              </div>
              <div class="col-2">
                <q-input v-model="equipoForm.observacion" label="Observación" outlined dense color="indigo" />
              </div>
              <div class="col-auto flex items-end">
                <q-btn
                  unelevated
                  no-caps
                  icon="add"
                  label="Agregar"
                  color="indigo"
                  @click="agregarEquipo"
                  :disable="!equipoForm.tipo_equipo"
                />
              </div>
            </div>
          </q-card-section>
        </q-card>

        <!-- Equipos table -->
        <q-table
          :rows="equiposList"
          :columns="columnasEquipos"
          row-key="_idx"
          flat
          bordered
          dense
          :rows-per-page-options="[0]"
          hide-pagination
          no-data-label="Sin equipos agregados. Use el formulario de arriba."
        >
          <template #body-cell-eliminar="props">
            <q-td :props="props">
              <q-btn
                flat round dense
                icon="delete"
                color="negative"
                size="sm"
                @click="eliminarEquipo(props.rowIndex)"
              >
                <q-tooltip>Eliminar equipo</q-tooltip>
              </q-btn>
            </q-td>
          </template>
          <template #body-cell-tipo_equipo_nombre="props">
            <q-td :props="props">{{ props.row.tipo_equipo_nombre }}</q-td>
          </template>
          <template #body-cell-valor_servicio="props">
            <q-td :props="props">{{ formatCurrency(props.row.valor_servicio) }}</q-td>
          </template>
          <template #no-data="{ message }">
            <div class="full-width column flex-center text-grey-5 q-py-lg">
              <q-icon name="construction" size="40px" class="q-mb-sm" />
              <span class="text-caption">{{ message }}</span>
            </div>
          </template>
        </q-table>
      </q-card-section>
    </q-card>

    <!-- ═══════════════════════════ BOTTOM ACTIONS ═══════════════════════════ -->
    <div class="row q-gutter-sm justify-end q-mt-sm q-mb-lg">
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
        color="indigo"
        :loading="guardando"
        @click="guardarPedido"
      />
    </div>

    <!-- ═══════════════════════════ CRUD LIST ═══════════════════════════ -->
    <q-card flat bordered>
      <q-card-section class="q-pb-sm">
        <div class="section-label q-mb-sm">
          <q-icon name="list_alt" size="16px" class="q-mr-xs" />Pedidos Especiales Registrados
          <q-space />
          <q-btn flat dense round icon="refresh" :loading="loadingList" @click="cargarPedidosEspeciales" size="sm">
            <q-tooltip>Actualizar lista</q-tooltip>
          </q-btn>
        </div>
      </q-card-section>

      <q-table
        :rows="pedidosEspeciales"
        :columns="columnasPedidos"
        row-key="id"
        flat
        bordered
        dense
        :loading="loadingList"
        :rows-per-page-options="[25, 50, 100]"
        no-data-label="Sin pedidos especiales registrados"
      >
        <template #body-cell-acciones="props">
          <q-td :props="props">
            <q-btn flat round dense icon="edit" color="indigo" size="sm" @click="abrirEditar(props.row)">
              <q-tooltip>Editar</q-tooltip>
            </q-btn>
            <q-btn flat round dense icon="delete" color="negative" size="sm" @click="confirmarEliminar(props.row)">
              <q-tooltip>Eliminar</q-tooltip>
            </q-btn>
          </q-td>
        </template>
        <template #body-cell-mano_obra_esp="props">
          <q-td :props="props">{{ formatCurrency(props.row.mano_obra_esp) }}</q-td>
        </template>
        <template #loading>
          <q-inner-loading showing color="indigo" />
        </template>
        <template #no-data="{ message }">
          <div class="full-width column flex-center text-grey-5 q-py-lg">
            <q-icon name="star_rate" size="40px" class="q-mb-sm" />
            <span class="text-caption">{{ message }}</span>
          </div>
        </template>
      </q-table>
    </q-card>

    <!-- ═══════════════════════════ EDIT DIALOG ═══════════════════════════ -->
    <q-dialog v-model="showEditDialog" persistent>
      <q-card style="min-width: 640px; max-width: 900px; width: 100%">
        <div class="edit-dialog-topbar">
          <div class="row items-center q-gutter-sm">
            <q-icon name="edit" color="white" size="20px" />
            <span class="text-subtitle1 text-white text-weight-bold">Editar Pedido Especial</span>
            <q-chip v-if="editingRow" dense color="white" text-color="indigo-9" class="q-ml-sm">
              #{{ editingRow.id }} — {{ editingRow.nombre }}
            </q-chip>
          </div>
          <q-btn flat round dense icon="close" color="white" v-close-popup />
        </div>

        <q-card-section class="q-pt-md">
          <div class="row q-gutter-sm q-mb-sm">
            <div class="col">
              <q-input v-model="editForm.nombre_supervisor" label="Nombre Supervisor" outlined dense color="indigo" />
            </div>
            <div class="col">
              <q-input
                v-model="editForm.fecha_pedido"
                label="Fecha Pedido"
                outlined dense color="indigo"
                type="date"
                stack-label
              />
            </div>
          </div>
          <div class="row q-gutter-sm q-mb-sm">
            <div class="col-auto" style="min-width:110px">
              <q-input v-model.number="editForm.personas_esp" label="#Personas" outlined dense color="indigo" type="number" min="0" />
            </div>
            <div class="col-auto" style="min-width:110px">
              <q-input v-model.number="editForm.dias_esp" label="#Días" outlined dense color="indigo" type="number" min="0" />
            </div>
            <div class="col">
              <q-input v-model.number="editForm.mano_obra_esp" label="Mano de Obra" outlined dense color="indigo" type="number" min="0" />
            </div>
            <div class="col">
              <q-input v-model.number="editForm.insumos_esp" label="Insumos" outlined dense color="indigo" type="number" min="0" />
            </div>
            <div class="col">
              <q-input v-model.number="editForm.transporte_esp" label="Transporte" outlined dense color="indigo" type="number" min="0" />
            </div>
          </div>
          <div class="row q-gutter-sm q-mb-sm">
            <div class="col">
              <q-input v-model.number="editForm.valor_servicio_esp" label="Valor Servicio" outlined dense color="indigo" type="number" min="0" />
            </div>
            <div class="col">
              <q-input v-model.number="editForm.depreciacion_esp" label="Depreciación" outlined dense color="indigo" type="number" min="0" />
            </div>
            <div class="col">
              <q-input v-model.number="editForm.imprevistos_esp" label="Imprevistos" outlined dense color="indigo" type="number" min="0" />
            </div>
            <div class="col">
              <q-input v-model.number="editForm.iva_esp" label="IVA" outlined dense color="indigo" type="number" min="0" />
            </div>
            <div class="col">
              <q-input v-model.number="editForm.comision_esp" label="Comisión" outlined dense color="indigo" type="number" min="0" />
            </div>
          </div>
          <div class="row q-gutter-sm">
            <div class="col">
              <q-input v-model.number="editForm.otros_esp" label="Otros" outlined dense color="indigo" type="number" min="0" />
            </div>
            <div class="col">
              <q-input v-model.number="editForm.epp_esp" label="EPP" outlined dense color="indigo" type="number" min="0" />
            </div>
            <div class="col">
              <q-input v-model.number="editForm.utilidad_esp" label="Utilidad" outlined dense color="indigo" type="number" min="0" />
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat no-caps label="Cancelar" color="grey-7" v-close-popup />
          <q-btn unelevated no-caps icon="save" label="Guardar Cambios" color="indigo" :loading="guardandoEdit" @click="guardarEdicion" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- ═══════════════════════════ DELETE CONFIRM DIALOG ═══════════════════════════ -->
    <q-dialog v-model="showDeleteDialog" persistent>
      <q-card style="min-width: 360px">
        <q-card-section class="row items-center q-pb-none">
          <q-icon name="warning" color="negative" size="28px" class="q-mr-sm" />
          <span class="text-subtitle1 text-weight-bold">Confirmar eliminación</span>
        </q-card-section>
        <q-card-section>
          ¿Está seguro que desea eliminar el pedido especial
          <strong>#{{ deletingRow?.id }}</strong> — {{ deletingRow?.nombre }}?
          Esta acción eliminará también los equipos asociados y no se puede deshacer.
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat no-caps label="Cancelar" color="grey-7" v-close-popup />
          <q-btn unelevated no-caps icon="delete" label="Eliminar" color="negative" :loading="eliminando" @click="ejecutarEliminar" />
        </q-card-actions>
      </q-card>
    </q-dialog>

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

interface TipoEquipoOption {
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

interface EquipoRow {
  tipo_equipo: number | null
  tipo_equipo_nombre: string
  cantidad: number
  dias: number
  personas: number
  tipo_servicio: number | null
  tipo_servicio_nombre: string
  genero: string
  valor_servicio: number
  mano_obra: number
  imprevistos: number
  insumos: number
  transporte: number
  depreciacion: number
  observacion: string
  _idx: number
}

interface PedidoEspecialRow {
  id: number
  nombre: string
  fecha_pedido: string
  personas_esp: number | null
  dias_esp: number | null
  mano_obra_esp: number | null
  insumos_esp: number | null
  transporte_esp: number | null
  valor_servicio_esp: number | null
  depreciacion_esp: number | null
  imprevistos_esp: number | null
  iva_esp: number | null
  comision_esp: number | null
  otros_esp: number | null
  epp_esp: number | null
  utilidad_esp: number | null
  nombre_supervisor: string
  id_sector: number | null
}

// ─────────────────────────── QUASAR ────────────────────────────────

const $q = useQuasar()

// ─────────────────────────── LOOKUP DATA ───────────────────────────

const clientes           = ref<ClienteOption[]>([])
const clientesFiltrados  = ref<ClienteOption[]>([])
const tiposEquipo        = ref<TipoEquipoOption[]>([])
const tiposServicio      = ref<TipoServicioOption[]>([])
const sectores           = ref<SectorOption[]>([])

const generoOpciones = [
  { label: 'M',  value: 'M'  },
  { label: 'F',  value: 'F'  },
  { label: 'MF', value: 'MF' },
]

// ─────────────────────────── PEDIDO FORM ───────────────────────────

function todayStr(): string {
  return new Date().toISOString().slice(0, 10)
}

const emptyPedido = () => ({
  id_cliente:        null as number | null,
  nit:               '',
  nombre:            '',
  direccion:         '',
  telefono:          '',
  contacto:          '',
  ciudad:            '',
  fecha_pedido:      todayStr(),
  nombre_supervisor: '',
  id_sector:         null as number | null,
  mano_obra_esp:     0,
  insumos_esp:       0,
  transporte_esp:    0,
  valor_servicio_esp: 0,
  depreciacion_esp:  0,
  imprevistos_esp:   0,
  iva_esp:           0,
  comision_esp:      0,
  otros_esp:         0,
  epp_esp:           0,
  utilidad_esp:      0,
  personas_esp:      0,
  dias_esp:          0,
})

const pedido = reactive(emptyPedido())
const selectedCliente = ref<ClienteOption | null>(null)

// ─────────────────────────── EQUIPO SUB-FORM ───────────────────────

let _equipoIdx = 0

const emptyEquipoForm = () => ({
  tipo_equipo:         null as number | null,
  cantidad:            1,
  dias:                1,
  personas:            1,
  tipo_servicio:       null as number | null,
  genero:              'MF',
  valor_servicio:      0,
  mano_obra:           0,
  imprevistos:         0,
  insumos:             0,
  transporte:          0,
  depreciacion:        0,
  observacion:         '',
})

const equipoForm = reactive(emptyEquipoForm())
const equiposList = ref<EquipoRow[]>([])

// ─────────────────────────── TABLA EQUIPOS — COLUMNAS ──────────────

const columnasEquipos = [
  { name: 'eliminar',           label: '',              field: 'eliminar',           align: 'center' as const, sortable: false },
  { name: 'tipo_equipo_nombre', label: 'Maquinaria',    field: 'tipo_equipo_nombre', align: 'left' as const,   sortable: true  },
  { name: 'cantidad',           label: 'Cantidad',      field: 'cantidad',           align: 'center' as const, sortable: false },
  { name: 'dias',               label: 'Días',          field: 'dias',               align: 'center' as const, sortable: false },
  { name: 'personas',           label: 'Personas',      field: 'personas',           align: 'center' as const, sortable: false },
  { name: 'tipo_servicio_nombre', label: 'Tipo Servicio', field: 'tipo_servicio_nombre', align: 'left' as const, sortable: false, style: 'white-space: normal; word-break: break-word; max-width: 500px; min-width: 300px;' },
  { name: 'genero',             label: 'Género',        field: 'genero',             align: 'center' as const, sortable: false },
  { name: 'valor_servicio',     label: 'Valor Servicio', field: 'valor_servicio',   align: 'right' as const,  sortable: false },
  { name: 'observacion',        label: 'Observaciones', field: 'observacion',        align: 'left' as const,   sortable: false, style: 'white-space: normal; word-break: break-word; max-width: 500px; min-width: 300px;' },
]

// ─────────────────────────── TABLA PEDIDOS — COLUMNAS ──────────────

const columnasPedidos = [
  { name: 'acciones',    label: '',             field: 'acciones',    align: 'center' as const, sortable: false },
  { name: 'id',          label: 'ID',           field: 'id',          align: 'left' as const,   sortable: true  },
  { name: 'nombre',      label: 'Cliente',      field: 'nombre',      align: 'left' as const,   sortable: true,  style: 'white-space: normal; word-break: break-word; max-width: 500px; min-width: 300px;' },
  { name: 'fecha_pedido', label: 'Fecha',       field: 'fecha_pedido', align: 'left' as const,  sortable: true, format: (v: string | null) => formatDate(v)  },
  { name: 'personas_esp', label: '#Personas',   field: 'personas_esp', align: 'center' as const, sortable: false },
  { name: 'dias_esp',    label: '#Días',        field: 'dias_esp',    align: 'center' as const, sortable: false },
  { name: 'mano_obra_esp', label: 'Mano de Obra', field: 'mano_obra_esp', align: 'right' as const, sortable: false },
]

// ─────────────────────────── STATES ────────────────────────────────

const guardando         = ref(false)
const loadingList       = ref(false)
const pedidosEspeciales = ref<PedidoEspecialRow[]>([])

const showEditDialog = ref(false)
const editingRow     = ref<PedidoEspecialRow | null>(null)
const guardandoEdit  = ref(false)

const showDeleteDialog = ref(false)
const deletingRow      = ref<PedidoEspecialRow | null>(null)
const eliminando       = ref(false)

const emptyEditForm = () => ({
  nombre_supervisor:  '',
  fecha_pedido:       '',
  personas_esp:       null as number | null,
  dias_esp:           null as number | null,
  mano_obra_esp:      null as number | null,
  insumos_esp:        null as number | null,
  transporte_esp:     null as number | null,
  valor_servicio_esp: null as number | null,
  depreciacion_esp:   null as number | null,
  imprevistos_esp:    null as number | null,
  iva_esp:            null as number | null,
  comision_esp:       null as number | null,
  otros_esp:          null as number | null,
  epp_esp:            null as number | null,
  utilidad_esp:       null as number | null,
})

const editForm = reactive(emptyEditForm())

// ─────────────────────────── LOAD LOOKUPS ──────────────────────────

async function cargarLookups() {
  try {
    const [resClientes, resTiposEquipo, resTiposServicio, resSectores] = await Promise.all([
      api.get<ClienteOption[]>('/lookup/clientes'),
      api.get<TipoEquipoOption[]>('/lookup/tipo-equipo'),
      api.get<TipoServicioOption[]>('/lookup/tipo-servicio'),
      api.get<SectorOption[]>('/lookup/sectores'),
    ])
    clientes.value          = resClientes.data
    clientesFiltrados.value = resClientes.data
    tiposEquipo.value       = resTiposEquipo.data
    tiposServicio.value     = resTiposServicio.data
    sectores.value          = resSectores.data
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

// ─────────────────────────── AGREGAR EQUIPO ────────────────────────

function agregarEquipo() {
  if (!equipoForm.tipo_equipo) {
    $q.notify({ type: 'warning', message: 'Seleccione un tipo de equipo' })
    return
  }
  const tipoEquipoObj = tiposEquipo.value.find(t => t.id === equipoForm.tipo_equipo)
  const tipoServicioObj = tiposServicio.value.find(t => t.id === equipoForm.tipo_servicio)

  equiposList.value.push({
    tipo_equipo:          equipoForm.tipo_equipo,
    tipo_equipo_nombre:   tipoEquipoObj?.nombre ?? '',
    cantidad:             equipoForm.cantidad,
    dias:                 equipoForm.dias,
    personas:             equipoForm.personas,
    tipo_servicio:        equipoForm.tipo_servicio,
    tipo_servicio_nombre: tipoServicioObj?.nombre ?? '',
    genero:               equipoForm.genero,
    valor_servicio:       equipoForm.valor_servicio,
    mano_obra:            equipoForm.mano_obra,
    imprevistos:          equipoForm.imprevistos,
    insumos:              equipoForm.insumos,
    transporte:           equipoForm.transporte,
    depreciacion:         equipoForm.depreciacion,
    observacion:          equipoForm.observacion,
    _idx:                 _equipoIdx++,
  })
  Object.assign(equipoForm, emptyEquipoForm())
}

function eliminarEquipo(index: number) {
  equiposList.value.splice(index, 1)
}

// ─────────────────────────── GUARDAR PEDIDO ────────────────────────

async function guardarPedido() {
  if (!pedido.id_cliente) {
    $q.notify({ type: 'warning', message: 'Seleccione una empresa' })
    return
  }
  if (!pedido.fecha_pedido) {
    $q.notify({ type: 'warning', message: 'Ingrese la fecha del pedido' })
    return
  }
  if (!pedido.nombre_supervisor.trim()) {
    $q.notify({ type: 'warning', message: 'Ingrese el nombre del supervisor' })
    return
  }

  guardando.value = true
  try {
    const payload = {
      pedido: {
        id_cliente:         pedido.id_cliente,
        nit:                pedido.nit,
        nombre:             pedido.nombre,
        direccion:          pedido.direccion,
        telefono:           pedido.telefono,
        contacto:           pedido.contacto,
        ciudad:             pedido.ciudad,
        fecha_pedido:       pedido.fecha_pedido,
        nombre_supervisor:  pedido.nombre_supervisor,
        id_sector:          pedido.id_sector,
        mano_obra_esp:      pedido.mano_obra_esp,
        insumos_esp:        pedido.insumos_esp,
        transporte_esp:     pedido.transporte_esp,
        valor_servicio_esp: pedido.valor_servicio_esp,
        depreciacion_esp:   pedido.depreciacion_esp,
        imprevistos_esp:    pedido.imprevistos_esp,
        iva_esp:            pedido.iva_esp,
        comision_esp:       pedido.comision_esp,
        otros_esp:          pedido.otros_esp,
        epp_esp:            pedido.epp_esp,
        utilidad_esp:       pedido.utilidad_esp,
        personas_esp:       pedido.personas_esp,
        dias_esp:           pedido.dias_esp,
      },
      equipos: equiposList.value.map(e => ({
        tipo_equipo:   e.tipo_equipo,
        cantidad:      e.cantidad,
        dias:          e.dias,
        personas:      e.personas,
        tipo_servicio: e.tipo_servicio,
        genero:        e.genero,
        valor_servicio: e.valor_servicio,
        mano_obra:     e.mano_obra,
        imprevistos:   e.imprevistos,
        insumos:       e.insumos,
        transporte:    e.transporte,
        depreciacion:  e.depreciacion,
        observacion:   e.observacion,
      })),
    }

    await api.post('/pedidos/especiales/registrar', payload)

    $q.notify({
      type: 'positive',
      message: 'Pedido especial registrado exitosamente',
      icon: 'check_circle',
      timeout: 3000,
    })

    limpiarForm()
    await cargarPedidosEspeciales()
  } catch (e: unknown) {
    const err = e as { response?: { data?: { message?: string } } }
    $q.notify({
      type: 'negative',
      message: err.response?.data?.message ?? 'Error al registrar el pedido especial',
    })
  } finally {
    guardando.value = false
  }
}

// ─────────────────────────── LIMPIAR ───────────────────────────────

function limpiarForm() {
  selectedCliente.value = null
  Object.assign(pedido, emptyPedido())
  Object.assign(equipoForm, emptyEquipoForm())
  equiposList.value = []
}

// ─────────────────────────── CARGAR LISTA ──────────────────────────

async function cargarPedidosEspeciales() {
  loadingList.value = true
  try {
    const { data } = await api.get<PedidoEspecialRow[]>('/pedidos/especiales')
    pedidosEspeciales.value = data
  } catch {
    $q.notify({ type: 'negative', message: 'Error al cargar pedidos especiales' })
  } finally {
    loadingList.value = false
  }
}

// ─────────────────────────── EDITAR ────────────────────────────────

function abrirEditar(row: PedidoEspecialRow) {
  editingRow.value = row
  Object.assign(editForm, {
    nombre_supervisor:  row.nombre_supervisor ?? '',
    fecha_pedido:       row.fecha_pedido ?? '',
    personas_esp:       row.personas_esp ?? null,
    dias_esp:           row.dias_esp ?? null,
    mano_obra_esp:      row.mano_obra_esp ?? null,
    insumos_esp:        row.insumos_esp ?? null,
    transporte_esp:     row.transporte_esp ?? null,
    valor_servicio_esp: row.valor_servicio_esp ?? null,
    depreciacion_esp:   row.depreciacion_esp ?? null,
    imprevistos_esp:    row.imprevistos_esp ?? null,
    iva_esp:            row.iva_esp ?? null,
    comision_esp:       row.comision_esp ?? null,
    otros_esp:          row.otros_esp ?? null,
    epp_esp:            row.epp_esp ?? null,
    utilidad_esp:       row.utilidad_esp ?? null,
  })
  showEditDialog.value = true
}

async function guardarEdicion() {
  if (!editingRow.value) return
  guardandoEdit.value = true
  try {
    await api.put(`/pedidos/especiales/${editingRow.value.id}`, { ...editForm })
    $q.notify({ type: 'positive', message: 'Pedido especial actualizado', icon: 'check_circle', timeout: 3000 })
    showEditDialog.value = false
    await cargarPedidosEspeciales()
  } catch (e: unknown) {
    const err = e as { response?: { data?: { message?: string } } }
    $q.notify({ type: 'negative', message: err.response?.data?.message ?? 'Error al actualizar el pedido' })
  } finally {
    guardandoEdit.value = false
  }
}

// ─────────────────────────── ELIMINAR ──────────────────────────────

function confirmarEliminar(row: PedidoEspecialRow) {
  deletingRow.value = row
  showDeleteDialog.value = true
}

async function ejecutarEliminar() {
  if (!deletingRow.value) return
  eliminando.value = true
  try {
    await api.delete(`/pedidos/especiales/${deletingRow.value.id}`)
    $q.notify({ type: 'positive', message: 'Pedido especial eliminado correctamente', icon: 'check_circle', timeout: 3000 })
    showDeleteDialog.value = false
    deletingRow.value = null
    await cargarPedidosEspeciales()
  } catch (e: unknown) {
    const err = e as { response?: { data?: { message?: string } } }
    $q.notify({ type: 'negative', message: err.response?.data?.message ?? 'Error al eliminar el pedido' })
  } finally {
    eliminando.value = false
  }
}

// ─────────────────────────── HELPERS ───────────────────────────────

function formatCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined) return ''
  return new Intl.NumberFormat('es-CO', {
    style: 'currency', currency: 'COP', maximumFractionDigits: 0,
  }).format(value)
}

// ─────────────────────────── LIFECYCLE ─────────────────────────────

onMounted(() => {
  void cargarLookups()
  void cargarPedidosEspeciales()
})
</script>

<style lang="scss" scoped>
.registrar-esp-page {
  max-width: 1600px;
  margin: 0 auto;
}

/* ── Page header ── */
.page-header {
  border-radius: 12px;
  overflow: hidden;
}

.header-gradient {
  background: linear-gradient(135deg, #1A237E 0%, #3949AB 100%);
  padding: 18px 24px;
}

/* ── Section labels ── */
.section-label {
  display: flex;
  align-items: center;
  font-size: 11px;
  font-weight: 700;
  color: #1A237E;
  text-transform: uppercase;
  letter-spacing: 0.8px;
}

/* ── Sub-form card ── */
.sub-form-card {
  background: #f3f4ff;
  border-color: #c5cae9 !important;
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
  background: #e8eaf6;
}

/* ── Edit dialog topbar ── */
.edit-dialog-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 20px;
  background: linear-gradient(135deg, #1A237E 0%, #3949AB 100%);
}
</style>
