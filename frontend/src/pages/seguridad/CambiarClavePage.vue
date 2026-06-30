<template>
  <q-page class="maestro-page q-pa-lg">
    <div class="page-header q-mb-lg">
      <div class="page-title-area">
        <q-icon name="lock" color="primary" size="28px" class="q-mr-sm" />
        <h5 class="q-ma-none text-weight-bold text-grey-9">Cambiar Contraseña</h5>
      </div>
    </div>
    <q-card flat bordered style="max-width: 440px; margin: 40px auto">
      <q-card-section class="q-pa-lg">
        <q-form @submit.prevent="cambiarClave">
          <div class="row items-center justify-between q-mb-lg">
            <span class="text-subtitle1 text-weight-bold">Cambiar Contraseña</span>
            <q-btn type="submit" unelevated no-caps icon="check" label="Aceptar" color="primary"
              :loading="loading" />
          </div>
          <q-separator class="q-mb-lg" />
          <div class="q-gutter-y-md">
          <q-input
            v-model="form.contrasenaAnterior"
            label="Contraseña anterior"
            outlined dense color="primary"
            :type="showOld ? 'text' : 'password'"
          >
            <template #append>
              <q-icon :name="showOld ? 'visibility_off' : 'visibility'" class="cursor-pointer"
                @click="showOld = !showOld" />
            </template>
          </q-input>
          <q-input
            v-model="form.contrasena"
            label="Contraseña *"
            outlined dense color="primary"
            :type="showNew ? 'text' : 'password'"
            :rules="[v => !!v || 'Requerida']"
          >
            <template #append>
              <q-icon :name="showNew ? 'visibility_off' : 'visibility'" class="cursor-pointer"
                @click="showNew = !showNew" />
            </template>
          </q-input>
          <q-input
            v-model="form.confirmar"
            label="Confirmar la contraseña *"
            outlined dense color="primary"
            :type="showConfirm ? 'text' : 'password'"
            :rules="[v => !!v || 'Requerida', v => v === form.contrasena || 'Las contraseñas no coinciden']"
          >
            <template #append>
              <q-icon :name="showConfirm ? 'visibility_off' : 'visibility'" class="cursor-pointer"
                @click="showConfirm = !showConfirm" />
            </template>
          </q-input>
        </div>
        </q-form>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useQuasar } from 'quasar'
import { api } from 'src/boot/axios'

const $q = useQuasar()
const loading = ref(false)
const showOld = ref(false)
const showNew = ref(false)
const showConfirm = ref(false)

const form = reactive({
  contrasenaAnterior: '',
  contrasena: '',
  confirmar: '',
})

async function cambiarClave() {
  if (!form.contrasenaAnterior || !form.contrasena || !form.confirmar) {
    $q.notify({ type: 'warning', message: 'Complete todos los campos' })
    return
  }
  if (form.contrasena !== form.confirmar) {
    $q.notify({ type: 'warning', message: 'Las contraseñas no coinciden' })
    return
  }
  loading.value = true
  try {
    await api.post('/auth/cambiar-clave', {
      contrasenaAnterior: form.contrasenaAnterior,
      contrasena: form.contrasena,
    })
    $q.notify({ type: 'positive', message: 'Contraseña actualizada correctamente', icon: 'check_circle' })
    form.contrasenaAnterior = ''
    form.contrasena = ''
    form.confirmar = ''
  } catch (e: unknown) {
    const err = e as { response?: { data?: { message?: string } } }
    $q.notify({ type: 'negative', message: err.response?.data?.message ?? 'Error al cambiar contraseña' })
  } finally { loading.value = false }
}
</script>

<style lang="scss" scoped>
.maestro-page { width: 100%; }
</style>
