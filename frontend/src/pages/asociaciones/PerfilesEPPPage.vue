<template>
  <q-page>
    <div class="page-header q-pa-md">
      <div class="row items-center">
        <q-icon name="health_and_safety" color="white" size="28px" class="q-mr-sm" />
        <div class="text-h5 text-white">Listado Perfil EPP</div>
      </div>
    </div>

    <div class="q-pa-md">
      <!-- Toolbar -->
      <div class="row q-gutter-md q-mb-md items-center">
        <q-select
          v-model="filterPerfil"
          :options="perfilOpts"
          label="Filtrar por Perfil"
          clearable outlined dense
          style="min-width: 220px"
          emit-value map-options
        />
        <q-input v-model="search" label="Búsqueda rápida..." outlined dense clearable style="min-width: 220px">
          <template #prepend><q-icon name="search" /></template>
        </q-input>
        <q-btn icon="refresh" flat round dense color="teal" @click="loadData" />
      </div>

      <!-- Create form -->
      <q-card flat bordered class="q-mb-md">
        <q-card-section>
          <div class="row q-gutter-md items-end">
            <q-select
              v-model="form.perfil"
              :options="perfilSelectFiltered"
              label="Perfil"
              outlined dense clearable use-input input-debounce="0"
              option-value="value" option-label="label"
              emit-value map-options
              style="min-width: 220px"
              @filter="filterPerfilOpts"
            />
            <q-select
              v-model="form.epp"
              :options="eppFiltered"
              label="EPP / Artículo"
              outlined dense clearable use-input input-debounce="0"
              option-value="value" option-label="label"
              emit-value map-options
              style="min-width: 280px"
              @filter="filterEppOpts"
            />
            <q-btn
              label="ASOCIAR" icon="add_link" unelevated no-caps
              class="asociar-btn" :loading="saving"
              :disable="!form.perfil || !form.epp"
              @click="asociar"
            />
          </div>
        </q-card-section>
      </q-card>

      <!-- Table -->
      <q-table
        :rows="filteredRows"
        :columns="columns"
        row-key="rowKey"
        dense bordered
        :loading="loading"
        :pagination="{ rowsPerPage: 15 }"
      >
        <template #header="props">
          <q-tr :props="props" class="teal-header">
            <q-th v-for="col in props.cols" :key="col.name" :props="props">{{ col.label }}</q-th>
          </q-tr>
        </template>
        <template #body-cell-actions="props">
          <q-td :props="props" class="text-center">
            <q-btn flat round dense icon="delete" color="negative" size="sm" @click="confirmDelete(props.row)" />
          </q-td>
        </template>
      </q-table>
    </div>

    <!-- Delete confirm -->
    <q-dialog v-model="showDelete">
      <q-card>
        <q-card-section>
          <div class="text-h6">¿Eliminar asociación?</div>
          <div class="text-body2 q-mt-sm">
            <b>{{ deletingRow?.perfil }}</b> — {{ deletingRow?.nombre_epp }}
          </div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancelar" v-close-popup />
          <q-btn flat label="Eliminar" color="negative" :loading="deleting" @click="doDelete" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { api } from 'src/boot/axios'

const $q = useQuasar()

interface Row { id_perfil: number; perfil: string; id_epp: number; nombre_epp: string }
interface Opt { value: number; label: string }

const rows = ref<Row[]>([])
const loading = ref(false)
const saving = ref(false)
const search = ref('')
const filterPerfil = ref<string | null>(null)

const perfilSelectOpts = ref<Opt[]>([])
const perfilSelectFiltered = ref<Opt[]>([])
const eppOpts = ref<Opt[]>([])
const eppFiltered = ref<Opt[]>([])

const form = ref({ perfil: null as number | null, epp: null as number | null })

const showDelete = ref(false)
const deletingRow = ref<Row | null>(null)
const deleting = ref(false)

const columns = [
  { name: 'actions', label: '', field: 'actions', align: 'center' as const, sortable: false, style: 'width:50px' },
  { name: 'id_perfil', label: 'Id perfil', field: 'id_perfil', sortable: true, align: 'left' as const },
  { name: 'perfil', label: 'Perfil', field: 'perfil', sortable: true, align: 'left' as const },
  { name: 'id_epp', label: 'Id epp', field: 'id_epp', sortable: true, align: 'left' as const },
  { name: 'nombre_epp', label: 'Nombre epp', field: 'nombre_epp', sortable: true, align: 'left' as const },
]

const perfilOpts = computed(() =>
  [...new Set(rows.value.map(r => r.perfil).filter(Boolean))].map(p => ({ value: p, label: p }))
)

const filteredRows = computed(() => {
  let data = rows.value
  if (filterPerfil.value) data = data.filter(r => r.perfil === filterPerfil.value)
  if (search.value) {
    const q = search.value.toLowerCase()
    data = data.filter(r =>
      r.perfil?.toLowerCase().includes(q) ||
      r.nombre_epp?.toLowerCase().includes(q) ||
      String(r.id_epp).includes(q) ||
      String(r.id_perfil).includes(q)
    )
  }
  return data
})

function filterPerfilOpts(val: string, update: (fn: () => void) => void) {
  update(() => {
    perfilSelectFiltered.value = val
      ? perfilSelectOpts.value.filter(o => o.label.toLowerCase().includes(val.toLowerCase()))
      : [...perfilSelectOpts.value]
  })
}

function filterEppOpts(val: string, update: (fn: () => void) => void) {
  update(() => {
    eppFiltered.value = val
      ? eppOpts.value.filter(o => o.label.toLowerCase().includes(val.toLowerCase()))
      : [...eppOpts.value]
  })
}

async function loadData() {
  loading.value = true
  try {
    const { data } = await api.get('/asociaciones/perfiles-epp')
    rows.value = Array.isArray(data) ? data : (data?.rows ?? [])
  } finally {
    loading.value = false
  }
}

async function loadOptions() {
  try {
    const r1 = await api.get('/asociaciones/options/perfiles')
    const arr1 = Array.isArray(r1.data) ? r1.data : (r1.data?.rows ?? [])
    perfilSelectOpts.value = arr1
    perfilSelectFiltered.value = [...arr1]
  } catch { /* silent */ }
  try {
    const r2 = await api.get('/asociaciones/options/epp')
    const arr2 = Array.isArray(r2.data) ? r2.data : (r2.data?.rows ?? [])
    eppOpts.value = arr2
    eppFiltered.value = [...arr2]
  } catch { /* silent */ }
}

async function asociar() {
  saving.value = true
  try {
    await api.post('/asociaciones/perfiles-epp', { id_perfil: form.value.perfil, id_epp: form.value.epp })
    $q.notify({ type: 'positive', message: 'Asociación creada' })
    form.value = { perfil: null, epp: null }
    await loadData()
  } catch {
    $q.notify({ type: 'negative', message: 'Error al asociar', icon: 'error' })
  } finally {
    saving.value = false
  }
}

function confirmDelete(row: Row) {
  deletingRow.value = row
  showDelete.value = true
}

async function doDelete() {
  if (!deletingRow.value) return
  deleting.value = true
  try {
    await api.delete(`/asociaciones/perfiles-epp/${deletingRow.value.id_perfil}/${deletingRow.value.id_epp}`)
    $q.notify({ type: 'positive', message: 'Asociación eliminada' })
    showDelete.value = false
    rows.value = rows.value.filter(r =>
      !(r.id_perfil === deletingRow.value!.id_perfil && r.id_epp === deletingRow.value!.id_epp)
    )
  } catch {
    $q.notify({ type: 'negative', message: 'Error al eliminar', icon: 'error' })
  } finally {
    deleting.value = false
  }
}

onMounted(() => { void Promise.all([loadData(), loadOptions()]) })
</script>

<style scoped>
.page-header { background: linear-gradient(135deg, #0F5A52 0%, #26A69A 100%); }
.asociar-btn { background: linear-gradient(135deg, #0F5A52 0%, #26A69A 100%); color: white; }
.teal-header th { background: #00695C; color: white; font-weight: 700; text-transform: uppercase; font-size: 11px; }
</style>
