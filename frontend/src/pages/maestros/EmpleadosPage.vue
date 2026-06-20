<template>
  <MaestroCrud
    title="Empleados"
    icon="badge"
    endpoint="/maestros/empleados"
    :columns="columns"
    :default-form="defaultForm"
  >
    <template #form="{ row }">
      <div class="q-gutter-y-md">
        <q-input v-model="row.nombre" label="Nombre completo" outlined dense color="primary"
          :rules="[(v) => !!v || 'Requerido']" />
        <div class="row q-col-gutter-md">
          <div class="col-5">
            <q-select
              v-model="row.tipoident"
              :options="['CC','CE','PA','TI','RC','NIT']"
              label="Tipo identificación"
              outlined dense color="primary"
            />
          </div>
          <div class="col-7">
            <q-input v-model="row.ident" label="Identificación" outlined dense color="primary" />
          </div>
        </div>
        <div class="row q-col-gutter-md">
          <div class="col-6">
            <q-select
              v-model="row.sexo"
              :options="[{value:1,label:'Masculino'},{value:2,label:'Femenino'}]"
              option-value="value" option-label="label" emit-value map-options
              label="Sexo" outlined dense color="primary" clearable
            />
          </div>
          <div class="col-6">
            <q-input v-model="row.direccion" label="Dirección" outlined dense color="primary" />
          </div>
        </div>
        <div class="row q-col-gutter-md">
          <div class="col-6">
            <q-input v-model="row.telefono" label="Teléfono" outlined dense color="primary" />
          </div>
          <div class="col-6">
            <q-input v-model="row.movil" label="Móvil" outlined dense color="primary" />
          </div>
        </div>
        <q-input v-model="row.email" label="Email" outlined dense color="primary" type="email" />
        <div class="row q-col-gutter-md">
          <div class="col-6">
            <q-toggle v-model="row.activo" label="Activo" color="primary" />
          </div>
          <div class="col-6">
            <q-toggle v-model="row.personal_interno" label="Personal interno" color="teal-8" />
          </div>
        </div>
      </div>
    </template>
  </MaestroCrud>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import MaestroCrud from 'src/components/MaestroCrud.vue'

const columns = reactive([
  { name: 'id', label: 'Cód.', field: 'id', sortable: true, visible: true, align: 'left' as const },
  { name: 'tipoident', label: 'T.ID', field: 'tipoident', sortable: true, visible: true, align: 'left' as const },
  { name: 'ident', label: 'Identificación', field: 'ident', sortable: true, visible: true, align: 'left' as const },
  { name: 'nombre', label: 'Nombre', field: 'nombre', sortable: true, visible: true, align: 'left' as const },
  { name: 'telefono', label: 'Teléfono', field: 'telefono', sortable: false, visible: true, align: 'left' as const },
  { name: 'movil', label: 'Móvil', field: 'movil', sortable: false, visible: false, align: 'left' as const },
  { name: 'email', label: 'Email', field: 'email', sortable: false, visible: true, align: 'left' as const },
  { name: 'sexo', label: 'Sexo', field: (row: Record<string, unknown>) => row.sexo === 1 ? 'M' : row.sexo === 2 ? 'F' : '', sortable: false, visible: true, align: 'left' as const },
  { name: 'personal_interno', label: 'Int.', field: (row: Record<string, unknown>) => row.personal_interno ? 'Sí' : 'No', sortable: false, visible: true, align: 'left' as const },
  { name: 'activo', label: 'Activo', field: (row: Record<string, unknown>) => row.activo ? 'Sí' : 'No', sortable: false, visible: true, align: 'left' as const },
])
const defaultForm = { nombre: '', ident: '', tipoident: 'CC', sexo: null, telefono: '', movil: '', email: '', direccion: '', activo: true, personal_interno: false }
</script>
