<template>
  <q-page class="clientes-page q-pa-lg">
    <!-- Toolbar -->
    <q-card flat bordered class="q-mb-md">
      <q-card-section class="toolbar-row">
        <q-input v-model="search" dense outlined clearable placeholder="Buscar cliente..."
          class="search-input" debounce="300" @update:model-value="onSearch">
          <template #prepend><q-icon name="search" color="grey-5" size="18px" /></template>
        </q-input>
        <div class="row q-gutter-sm">
          <q-btn flat dense round icon="refresh" :loading="loading" @click="loadData">
            <q-tooltip>Actualizar</q-tooltip>
          </q-btn>
          <q-btn unelevated no-caps icon="add" label="Nuevo cliente" color="primary"
            class="new-btn" @click="openForm(null)" />
        </div>
      </q-card-section>
    </q-card>

    <!-- Table -->
    <q-card flat bordered>
      <q-table :rows="filtered" :columns="columns" :loading="loading" row-key="id"
        flat :rows-per-page-options="[12, 25, 50, 100]" class="clientes-table">
        <template #body-cell-actions="props">
          <q-td :props="props">
            <q-btn flat round dense icon="edit" color="primary" size="sm" @click="openForm(props.row)">
              <q-tooltip>Editar</q-tooltip>
            </q-btn>
            <q-btn flat round dense icon="delete_outline" color="negative" size="sm" @click="confirmDelete(props.row)">
              <q-tooltip>Inactivar</q-tooltip>
            </q-btn>
          </q-td>
        </template>
        <template #no-data>
          <div class="full-width column flex-center text-grey-5 q-pa-xl">
            <q-icon name="people_outline" size="48px" class="q-mb-sm" />
            <span>Sin clientes</span>
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
            <q-icon name="people" color="white" size="22px" />
            <span class="text-h6 text-white text-weight-bold">
              {{ editingRow ? 'Editar Cliente' : 'Nuevo Cliente' }}
            </span>
            <q-chip v-if="editingRow" dense color="white" text-color="primary" class="q-ml-sm">
              {{ editingRow.nombre }}
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

              <!-- Section: Datos generales -->
              <div class="form-section">
                <div class="section-title">
                  <q-icon name="info_outline" size="16px" class="q-mr-xs" />Datos generales
                </div>

                <!-- Fila 1: Id · Codigo · Centro Costos · Ident · Nombre -->
                <div class="field-grid-5 q-mb-sm">
                  <q-input v-model="form.id" label="Id" outlined dense color="primary" readonly />
                  <q-input v-model="form.codigo" label="Codigo" outlined dense color="primary" readonly />
                  <q-input v-model="form.centro_costos" label="Centro Costos" outlined dense color="primary" />
                  <q-input v-model="form.ident" label="Ident" outlined dense color="primary" />
                  <q-input v-model="form.nombre" label="Nombre" outlined dense color="primary"
                    :rules="[(v) => !!v || 'Requerido']" />
                </div>

                <!-- Fila 2: Direccion · Telefono · Tope Credito · Ciudad -->
                <div class="field-grid-4 q-mb-sm">
                  <q-input v-model="form.direccion" label="Direccion" outlined dense color="primary" />
                  <q-input v-model="form.telefono" label="Telefono" outlined dense color="primary" />
                  <q-input v-model="form.tope_credito" label="Tope Credito" outlined dense color="primary"
                    type="number" prefix="$" />
                  <q-select
                    v-model="form.ciudad_codigo"
                    :options="ciudadOpts" option-value="value" option-label="label"
                    emit-value map-options use-input input-debounce="0"
                    label="Ciudad" outlined dense color="primary" clearable
                    @filter="filterCiudades"
                  >
                    <template #no-option><q-item><q-item-section class="text-grey">Sin resultados</q-item-section></q-item></template>
                  </q-select>
                </div>

                <!-- Fila 3: Correo · Contacto · Supervisor -->
                <div class="field-grid-3 q-mb-sm">
                  <q-input v-model="form.correo" label="Correo" outlined dense color="primary" type="email" />
                  <q-input v-model="form.contacto" label="Contacto" outlined dense color="primary" />
                  <q-select
                    v-model="form.cod_supervisor"
                    :options="supervisorOpts" option-value="value" option-label="label"
                    emit-value map-options use-input input-debounce="0"
                    label="Supervisor" outlined dense color="primary" clearable
                    @filter="filterSupervisores"
                  >
                    <template #no-option><q-item><q-item-section class="text-grey">Sin resultados</q-item-section></q-item></template>
                  </q-select>
                </div>

                <!-- Fila 4: Sector · Observaciones -->
                <div class="field-grid-2 q-mb-sm">
                  <q-select
                    v-model="form.codigo_sector"
                    :options="sectorOpts" option-value="value" option-label="label"
                    emit-value map-options label="Sector" outlined dense color="primary" clearable
                  />
                  <q-input v-model="form.observaciones" label="Observaciones" outlined dense color="primary"
                    type="textarea" rows="2" autogrow />
                </div>

                <q-toggle v-model="form.activo" label="Cliente activo" color="primary" />
              </div>
            </div>

            <!-- ── RIGHT COLUMN: Contactos ── -->
            <div class="form-col">
              <div class="form-section contacts-section">
                <div class="section-title">
                  <q-icon name="contacts" size="16px" class="q-mr-xs" />Contactos del cliente
                  <q-badge color="primary" class="q-ml-sm">{{ contactos.length }}</q-badge>
                </div>

                <!-- Add contact form -->
                <div class="add-contact-card q-mb-md">
                  <div class="text-caption text-grey-6 q-mb-sm text-weight-medium">Agregar contacto</div>
                  <div class="field-grid-2 q-gutter-y-xs">
                    <q-input v-model="newContact.nombre" label="Nombre *" outlined dense color="teal-8" />
                    <q-select
                      v-model="newContact.cargo"
                      :options="tipoContactoOpts" option-value="value" option-label="label"
                      emit-value map-options label="Tipo" outlined dense color="teal-8" clearable
                    />
                    <q-input v-model="newContact.telefono" label="Teléfono" outlined dense color="teal-8" />
                    <q-input v-model="newContact.correo" label="Correo" outlined dense color="teal-8" type="email" />
                    <q-input v-model="newContact.direccion" label="Dirección" outlined dense color="teal-8"
                      class="col-span-2" />
                    <q-input v-model="newContact.comentario" label="Comentario" outlined dense color="teal-8"
                      class="col-span-2" />
                  </div>
                  <div class="row justify-end q-mt-sm">
                    <q-btn unelevated no-caps icon="add" label="Agregar" color="teal-8"
                      :disable="!newContact.nombre" @click="addContact" :loading="addingContact" />
                  </div>
                </div>

                <!-- Contacts list -->
                <div v-if="contactos.length === 0" class="no-contacts">
                  <q-icon name="person_add_disabled" size="36px" color="grey-4" />
                  <div class="text-grey-5 text-caption q-mt-xs">Sin contactos registrados</div>
                </div>

                <div v-for="ct in contactos" :key="ct.id ?? ct._tempId" class="contact-card">
                  <div class="contact-header">
                    <div>
                      <div class="text-weight-bold text-grey-9">{{ ct.nombre }}</div>
                      <q-badge v-if="ct.cargo_nombre" color="blue-1" text-color="blue-9" class="q-mt-xs">
                        {{ ct.cargo_nombre }}
                      </q-badge>
                    </div>
                    <q-btn flat round dense icon="delete_outline" color="negative" size="sm"
                      @click="removeContact(ct)" />
                  </div>
                  <div class="contact-details">
                    <span v-if="ct.telefono"><q-icon name="phone" size="12px" /> {{ ct.telefono }}</span>
                    <span v-if="ct.correo"><q-icon name="email" size="12px" /> {{ ct.correo }}</span>
                    <span v-if="ct.direccion"><q-icon name="location_on" size="12px" /> {{ ct.direccion }}</span>
                    <span v-if="ct.comentario" class="text-grey-6 text-caption col-span-2">{{ ct.comentario }}</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </q-card>
    </q-dialog>

    <!-- Delete confirm -->
    <q-dialog v-model="showDelete">
      <q-card style="min-width:340px">
        <q-card-section class="row items-center q-pa-lg">
          <q-avatar icon="warning" color="negative" text-color="white" />
          <span class="q-ml-sm">¿Inactivar a <strong>{{ deletingRow?.nombre }}</strong>?</span>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat no-caps label="Cancelar" v-close-popup />
          <q-btn unelevated no-caps label="Inactivar" color="negative" :loading="deleting" @click="doDelete" />
        </q-card-actions>
      </q-card>
    </q-dialog>

  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { api } from 'src/boot/axios'

interface ClienteRow {
  id: number; ident: string; nombre: string; ciudad_codigo: string; ciudad_nombre: string
  direccion: string; telefono: string; correo: string; contacto: string
  centro_costos: string; tope_credito: number | null
  cod_supervisor: number | null; supervisor_nombre: string
  codigo_sector: number | null; sector_nombre: string
  observaciones: string; activo: boolean
}
interface Contacto {
  id?: number; _tempId?: number; id_cliente?: number; cargo?: number | null
  cargo_nombre?: string; nombre: string; telefono?: string
  direccion?: string; correo?: string; comentario?: string
}
interface Opt { value: string | number; label: string }

const $q = useQuasar()
let _tempCounter = 0

// ── Table ──
const rows    = ref<ClienteRow[]>([])
const loading = ref(false)
const search  = ref('')
const filtered = computed(() => {
  const q = search.value.toLowerCase()
  return q ? rows.value.filter(r =>
    [r.nombre, r.ident, r.ciudad_nombre, r.telefono, r.correo, r.sector_nombre]
      .some(v => (v ?? '').toLowerCase().includes(q))
  ) : rows.value
})

const columns = [
  { name: 'actions',           label: '',               field: 'actions',           align: 'center' as const, sortable: false },
  { name: 'id',                label: 'Id',             field: 'id',                align: 'left' as const,   sortable: true  },
  { name: 'codigo',            label: 'Codigo',         field: 'codigo',            align: 'left' as const,   sortable: true  },
  { name: 'ident',             label: 'Identificacion', field: 'ident',             align: 'left' as const,   sortable: true  },
  { name: 'nombre',            label: 'Nombre',         field: 'nombre',            align: 'left' as const,   sortable: true  },
  { name: 'telefono',          label: 'Telefono',       field: 'telefono',          align: 'left' as const,   sortable: false },
  { name: 'correo',            label: 'Correo',         field: 'correo',            align: 'left' as const,   sortable: false },
  { name: 'supervisor_nombre', label: 'Sup Nombre',     field: 'supervisor_nombre', align: 'left' as const,   sortable: false },
  { name: 'contacto',          label: 'Contacto',       field: 'contacto',          align: 'left' as const,   sortable: false },
  { name: 'centro_costos',     label: 'Centro Costos',  field: 'centro_costos',     align: 'left' as const,   sortable: false },
  { name: 'direccion',         label: 'Direccion',      field: 'direccion',         align: 'left' as const,   sortable: false },
]

function onSearch() { /* computed handles */ }

async function loadData() {
  loading.value = true
  try {
    const { data } = await api.get('/maestros/clientes')
    rows.value = data
  } catch {
    $q.notify({ type: 'negative', message: 'Error al cargar clientes' })
  } finally { loading.value = false }
}

// ── Options ──
const ciudadesAll     = ref<Opt[]>([])
const ciudadOpts      = ref<Opt[]>([])
const supervisoresAll = ref<Opt[]>([])
const supervisorOpts  = ref<Opt[]>([])
const sectorOpts      = ref<Opt[]>([])
const tipoContactoOpts = ref<Opt[]>([])

async function loadOptions() {
  const [cRes, sRes, secRes, tcRes] = await Promise.all([
    api.get('/maestros/clientes/options/ciudades'),
    api.get('/asociaciones/options/empleados'),
    api.get('/maestros/clientes/options/sectores'),
    api.get('/maestros/clientes/options/contactos-tipo'),
  ])
  ciudadesAll.value = ciudadOpts.value = cRes.data
  supervisoresAll.value = supervisorOpts.value = sRes.data
  sectorOpts.value = secRes.data
  tipoContactoOpts.value = tcRes.data
}

function filterCiudades(val: string, update: (fn: () => void) => void) {
  update(() => {
    ciudadOpts.value = val
      ? ciudadesAll.value.filter(o => o.label.toLowerCase().includes(val.toLowerCase()))
      : ciudadesAll.value
  })
}
function filterSupervisores(val: string, update: (fn: () => void) => void) {
  update(() => {
    supervisorOpts.value = val
      ? supervisoresAll.value.filter(o => o.label.toLowerCase().includes(val.toLowerCase()))
      : supervisoresAll.value
  })
}

// ── Form ──
const showForm   = ref(false)
const editingRow = ref<ClienteRow | null>(null)
const saving     = ref(false)

const form = reactive({
  id: null as number | null, codigo: null as number | null,
  ident: '', nombre: '', ciudad_codigo: null as string | null,
  direccion: '', telefono: '', correo: '', contacto: '',
  centro_costos: '', tope_credito: null as number | null,
  cod_supervisor: null as number | null, codigo_sector: null as number | null,
  observaciones: '', activo: true,
})

// ── Contacts ──
const contactos     = ref<Contacto[]>([])
const addingContact = ref(false)
const newContact    = reactive<Contacto>({ nombre: '', cargo: null, telefono: '', correo: '', direccion: '', comentario: '' })

function resetContact() {
  newContact.nombre = ''; newContact.cargo = null
  newContact.telefono = ''; newContact.correo = ''
  newContact.direccion = ''; newContact.comentario = ''
}

async function openForm(row: ClienteRow | null) {
  editingRow.value = row
  if (row) {
    Object.assign(form, {
      id: row.id ?? null, codigo: (row as Record<string, unknown>).codigo ?? null,
      ident: row.ident ?? '', nombre: row.nombre ?? '',
      ciudad_codigo: row.ciudad_codigo ?? null,
      direccion: row.direccion ?? '', telefono: row.telefono ?? '',
      correo: row.correo ?? '', contacto: row.contacto ?? '',
      centro_costos: row.centro_costos ?? '',
      tope_credito: row.tope_credito ?? null,
      cod_supervisor: row.cod_supervisor ?? null,
      codigo_sector: row.codigo_sector ?? null,
      observaciones: row.observaciones ?? '', activo: row.activo ?? true,
    })
    // Load existing contacts
    try {
      const { data } = await api.get(`/maestros/clientes/${row.id}/contactos`)
      contactos.value = data
    } catch { contactos.value = [] }
  } else {
    Object.assign(form, {
      id: null, codigo: null,
      ident: '', nombre: '', ciudad_codigo: null, direccion: '', telefono: '',
      correo: '', contacto: '', centro_costos: '', tope_credito: null,
      cod_supervisor: null, codigo_sector: null, observaciones: '', activo: true,
    })
    contactos.value = []
  }
  resetContact()
  showForm.value = true
}

async function addContact() {
  if (!newContact.nombre) return
  if (editingRow.value) {
    // Existing client: save immediately
    addingContact.value = true
    try {
      const { data } = await api.post(`/maestros/clientes/${editingRow.value.id}/contactos`, { ...newContact })
      contactos.value.push(data)
      resetContact()
    } catch {
      $q.notify({ type: 'negative', message: 'Error al agregar contacto' })
    } finally { addingContact.value = false }
  } else {
    // New client: queue locally
    const tipoNombre = tipoContactoOpts.value.find(o => o.value === newContact.cargo)?.label ?? ''
    contactos.value.push({ ...newContact, _tempId: ++_tempCounter, cargo_nombre: tipoNombre })
    resetContact()
  }
}

async function removeContact(ct: Contacto) {
  if (ct.id && editingRow.value) {
    try {
      await api.delete(`/maestros/clientes/${editingRow.value.id}/contactos/${ct.id}`)
      contactos.value = contactos.value.filter(c => c.id !== ct.id)
    } catch {
      $q.notify({ type: 'negative', message: 'Error al eliminar contacto' })
    }
  } else {
    contactos.value = contactos.value.filter(c => c._tempId !== ct._tempId)
  }
}

async function saveForm() {
  if (!form.nombre) { $q.notify({ type: 'warning', message: 'El nombre es requerido' }); return }
  saving.value = true
  try {
    let clienteId: number
    if (editingRow.value) {
      await api.put(`/maestros/clientes/${editingRow.value.id}`, { ...form })
      clienteId = editingRow.value.id
      $q.notify({ type: 'positive', message: 'Cliente actualizado', icon: 'check_circle' })
    } else {
      const { data } = await api.post('/maestros/clientes', { ...form })
      clienteId = data.id
      // Save queued contacts for new client
      for (const ct of contactos.value) {
        if (ct._tempId) {
          await api.post(`/maestros/clientes/${clienteId}/contactos`, {
            cargo: ct.cargo, nombre: ct.nombre, telefono: ct.telefono,
            direccion: ct.direccion, correo: ct.correo, comentario: ct.comentario,
          })
        }
      }
      $q.notify({ type: 'positive', message: 'Cliente creado', icon: 'check_circle' })
    }
    showForm.value = false
    await loadData()
  } catch (e: unknown) {
    const err = e as { response?: { data?: { message?: string } } }
    $q.notify({ type: 'negative', message: err.response?.data?.message ?? 'Error al guardar' })
  } finally { saving.value = false }
}

// ── Delete ──
const showDelete  = ref(false)
const deletingRow = ref<ClienteRow | null>(null)
const deleting    = ref(false)

function confirmDelete(row: ClienteRow) { deletingRow.value = row; showDelete.value = true }

async function doDelete() {
  if (!deletingRow.value) return
  deleting.value = true
  try {
    await api.delete(`/maestros/clientes/${deletingRow.value.id}`)
    $q.notify({ type: 'positive', message: 'Cliente inactivado' })
    showDelete.value = false
    await loadData()
  } catch { $q.notify({ type: 'negative', message: 'Error al inactivar' }) }
  finally { deleting.value = false }
}

onMounted(() => { void Promise.all([loadData(), loadOptions()]) })
</script>

<style lang="scss" scoped>
.clientes-page { width: 100%; }

.toolbar-row {
  display: flex; align-items: center; justify-content: space-between;
  gap: 12px; padding: 12px 16px !important;
}
.search-input { width: 280px; }
.new-btn { font-weight: 600; letter-spacing: 0.5px; }

.clientes-table {
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
  background: linear-gradient(135deg, #0d5c52 0%, #12776a 100%);
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
  font-size: 12px; font-weight: 700; color: #0d5c52;
  text-transform: uppercase; letter-spacing: 0.8px;
  margin-bottom: 16px; display: flex; align-items: center;
}

.field-grid-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}
.field-grid-2 .col-span-2 { grid-column: 1 / -1; }

.field-grid-3 {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 12px;
}

.field-grid-4 {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr;
  gap: 12px;
}

.field-grid-5 {
  display: grid;
  grid-template-columns: 0.6fr 0.6fr 1fr 0.8fr 1.4fr;
  gap: 12px;
}

/* ── Contacts ── */
.contacts-section { height: 100%; }

.add-contact-card {
  background: #f0faf8;
  border: 1px solid #b2dfdb;
  border-radius: 10px;
  padding: 16px;
}

.no-contacts {
  display: flex; flex-direction: column; align-items: center;
  padding: 32px 0; color: #bdbdbd;
}

.contact-card {
  background: #fafafa; border: 1px solid #e0e0e0;
  border-radius: 10px; padding: 14px 16px; margin-bottom: 10px;
  transition: box-shadow 0.15s;
  &:hover { box-shadow: 0 2px 8px rgba(0,0,0,0.09); }
}
.contact-header {
  display: flex; align-items: flex-start; justify-content: space-between;
  margin-bottom: 8px;
}
.contact-details {
  display: grid; grid-template-columns: 1fr 1fr;
  gap: 4px 16px; font-size: 12px; color: #616161;
  span { display: flex; align-items: center; gap: 4px; }
}
</style>
