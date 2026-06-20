<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated class="bg-primary text-white">
      <q-toolbar>
        <q-toolbar-title class="text-weight-bold">
          UNO-A Aseo Integrado S.A.
        </q-toolbar-title>
        <q-btn flat round dense icon="logout" @click="logout">
          <q-tooltip>Cerrar sesión</q-tooltip>
        </q-btn>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <q-page class="flex flex-center bg-grey-1">
        <div class="text-center q-pa-xl">
          <q-icon name="check_circle" color="positive" size="72px" />
          <h4 class="text-h5 text-weight-bold q-mt-md q-mb-sm">
            ¡Sesión iniciada correctamente!
          </h4>
          <p class="text-grey-6">
            Bienvenido, <strong>{{ authStore.user?.usuario }}</strong>.
            Los módulos del sistema están en construcción.
          </p>
        </div>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuthStore } from 'src/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

function logout() {
  authStore.logout()
  void router.push('/')
}
</script>
