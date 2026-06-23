<template>
  <MaestroCrud
    title="Empleados"
    icon="badge"
    endpoint="/maestros/empleados"
    :columns="columns"
    :default-form="defaultForm"
    fetch-on-edit
    pk-field="id"
  >
    <template #form="{ row }">
      <div class="q-gutter-y-md">
        <!-- Fila 1: Codigo · Codigo Alterno · Tipoident · Ident · Nombre -->
        <div class="row q-col-gutter-md items-end">
          <div class="col-2">
            <q-input v-model="row.id" label="Codigo" outlined dense color="primary" readonly />
          </div>
          <div class="col-2">
            <q-input v-model="row.codigo_alterno" label="Codigo Alterno" outlined dense color="primary" />
          </div>
          <div class="col-2">
            <q-select
              v-model="row.tipoident"
              :options="tipoIdentOptions"
              label="Tipoident"
              outlined dense color="primary"
            />
          </div>
          <div class="col-2">
            <q-input v-model="row.ident" label="Ident" outlined dense color="primary" />
          </div>
          <div class="col-4">
            <q-input v-model="row.nombre" label="Nombre" outlined dense color="primary"
              :rules="[(v) => !!v || 'Requerido']" />
          </div>
        </div>

        <!-- Fila 2: Direccion · Telefono · Movil · Email -->
        <div class="row q-col-gutter-md">
          <div class="col-4">
            <q-input v-model="row.direccion" label="Direccion" outlined dense color="primary" />
          </div>
          <div class="col-3">
            <q-input v-model="row.telefono" label="Telefono" outlined dense color="primary" />
          </div>
          <div class="col-2">
            <q-input v-model="row.movil" label="Movil" outlined dense color="primary" />
          </div>
          <div class="col-3">
            <q-input v-model="row.email" label="Email" outlined dense color="primary" type="email" />
          </div>
        </div>

        <!-- Fila 3: Profesion · Ciudad · Activo · Personal Interno -->
        <div class="row q-col-gutter-md items-end">
          <div class="col-3">
            <q-select
              v-model="row.profesion_codigo"
              :options="profesiones"
              option-value="id"
              option-label="nombre"
              emit-value map-options
              label="Profesion Codigo"
              outlined dense color="primary"
              clearable
            />
          </div>
          <div class="col-4">
            <q-select
              v-model="row.ciudad_codigo"
              :options="ciudades"
              option-value="codigo"
              option-label="nombre"
              emit-value map-options
              label="Ciudad Codigo"
              outlined dense color="primary"
              clearable
              use-input
              input-debounce="200"
              @filter="filterCiudades"
            />
          </div>
          <div class="col-2">
            <q-select
              v-model="row.activo"
              :options="[{label:'SI', value:true},{label:'NO', value:false}]"
              option-value="value"
              option-label="label"
              emit-value map-options
              label="Activo"
              outlined dense color="primary"
            />
          </div>
          <div class="col-3">
            <q-select
              v-model="row.personal_interno"
              :options="[{label:'SI', value:true},{label:'NO', value:false}]"
              option-value="value"
              option-label="label"
              emit-value map-options
              label="Personal Interno"
              outlined dense color="primary"
            />
          </div>
        </div>

        <!-- Fila 4: Sexo · Perfil -->
        <div class="row q-col-gutter-md items-end">
          <div class="col-3">
            <q-select
              v-model="row.sexo"
              :options="sexoOpts"
              option-value="id"
              option-label="nombre"
              emit-value map-options
              label="Sexo"
              outlined dense color="primary"
              clearable
            />
          </div>
          <div class="col-4">
            <q-select
              v-model="row.perfil"
              :options="perfiles"
              option-value="id"
              option-label="nombre"
              emit-value map-options
              label="Perfil"
              outlined dense color="primary"
              clearable
            />
          </div>
        </div>

        <p class="text-caption text-negative q-ma-none">* Campos obligatorios</p>
      </div>
    </template>
  </MaestroCrud>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue'
import MaestroCrud from 'src/components/MaestroCrud.vue'
import { api } from 'src/boot/axios'

const tipoIdentOptions = ['CC', 'CE', 'PA', 'TI', 'RC', 'NIT']

const profesiones = ref<{ id: number; nombre: string }[]>([])
const ciudades    = ref<{ codigo: string; nombre: string }[]>([])
const ciudadesAll = ref<{ codigo: string; nombre: string }[]>([])
const perfiles    = ref<{ id: number; nombre: string }[]>([])
const sexoOpts    = ref<{ id: number; nombre: string }[]>([])

onMounted(async () => {
  const [p, c, pf, s] = await Promise.all([
    api.get('/lookup/profesiones'),
    api.get('/lookup/ciudades'),
    api.get('/lookup/perfiles'),
    api.get('/lookup/sexo'),
  ])
  profesiones.value  = p.data
  ciudadesAll.value  = c.data
  ciudades.value     = c.data
  perfiles.value     = pf.data
  sexoOpts.value     = s.data
})

function filterCiudades(val: string, update: (fn: () => void) => void) {
  update(() => {
    if (!val) {
      ciudades.value = ciudadesAll.value
    } else {
      const q = val.toLowerCase()
      ciudades.value = ciudadesAll.value.filter(c => c.nombre.toLowerCase().includes(q))
    }
  })
}

const columns = reactive([
  { name: 'ident',           label: 'Ident',         field: 'ident',           sortable: true,  visible: true,  align: 'left' as const },
  { name: 'nombre',          label: 'Nombre',         field: 'nombre',          sortable: true,  visible: true,  align: 'left' as const },
  { name: 'direccion',       label: 'Direccion',      field: 'direccion',       sortable: false, visible: true,  align: 'left' as const },
  { name: 'ciudad_nombre',   label: 'Ciudad nombre',  field: 'ciudad_nombre',   sortable: true,  visible: true,  align: 'left' as const },
  { name: 'telefono',        label: 'Teléfono',       field: 'telefono',        sortable: false, visible: true,  align: 'left' as const },
  { name: 'movil',           label: 'Móvil',          field: 'movil',           sortable: false, visible: true,  align: 'left' as const },
  { name: 'email',           label: 'Email',          field: 'email',           sortable: false, visible: true,  align: 'left' as const },
  { name: 'profesion_nombre',label: 'Profesion',      field: 'profesion_nombre',sortable: true,  visible: true,  align: 'left' as const },
  { name: 'perfil',          label: 'Perfil',         field: 'perfil',          sortable: true,  visible: true,  align: 'left' as const },
])

const defaultForm = {
  id: null, codigo_alterno: '', tipoident: 'CC', ident: '', nombre: '',
  direccion: '', telefono: '', movil: '', email: '',
  profesion_codigo: null, ciudad_codigo: null,
  activo: true, personal_interno: false,
  sexo: null, perfil: null,
}
</script>
