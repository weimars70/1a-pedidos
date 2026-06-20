<template>
  <MaestroCrud
    title="Usuarios del Sistema"
    icon="manage_accounts"
    endpoint="/seguridad/usuarios"
    :columns="columns"
    :default-form="defaultForm"
    section="Seguridad"
    pk-field="login"
    @form-init="onFormInit"
  >
    <template #form="{ row, editing }">
      <div class="q-gutter-y-md">
        <q-input v-model="row.login" label="Usuario (login)" outlined dense color="primary"
          :disable="editing"
          :rules="[v => !!v || 'Requerido']" />
        <q-input v-model="row.name" label="Nombre completo" outlined dense color="primary" />
        <q-input v-model="row.email" label="Email" outlined dense color="primary" type="email" />
        <q-select v-model="row.active" label="Estado" outlined dense color="primary"
          :options="[{ label: 'Activo', value: 'S' }, { label: 'Inactivo', value: 'N' }]"
          emit-value map-options />
        <q-input v-model="row.sucursal" label="Sucursal" outlined dense color="primary" type="number" />
        <q-input v-model="row.pswd" label="Contraseña (dejar vacío para no cambiar)" outlined dense color="primary"
          type="password"
          :rules="editing ? [] : [v => !!v || 'Requerida al crear']" />
      </div>
    </template>
  </MaestroCrud>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import MaestroCrud from 'src/components/MaestroCrud.vue'

const columns = reactive([
  { name: 'login', label: 'Usuario', field: 'login', sortable: true, visible: true, align: 'left' as const },
  { name: 'name', label: 'Nombre', field: 'name', sortable: true, visible: true, align: 'left' as const },
  { name: 'email', label: 'Email', field: 'email', sortable: true, visible: true, align: 'left' as const },
  { name: 'active', label: 'Estado', field: 'active', sortable: true, visible: true, align: 'center' as const },
  { name: 'sucursal', label: 'Sucursal', field: 'sucursal', sortable: false, visible: true, align: 'center' as const },
])
const defaultForm = { login: '', name: '', email: '', active: 'S', sucursal: 1, pswd: '' }

function onFormInit(formData: Record<string, unknown>) {
  // Clear password field when opening edit form
  formData.pswd = ''
}
</script>
