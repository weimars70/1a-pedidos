<template>
  <q-page class="maestro-page q-pa-lg">
    <div class="page-header q-mb-lg">
      <div class="page-title-area">
        <q-icon name="sync" color="primary" size="28px" class="q-mr-sm" />
        <h5 class="q-ma-none text-weight-bold text-grey-9">Sincronizar Aplicaciones</h5>
      </div>
      <q-breadcrumbs class="text-caption q-mt-xs" active-color="primary">
        <q-breadcrumbs-el label="Inicio" to="/app/inicio" />
        <q-breadcrumbs-el label="Seguridad" />
        <q-breadcrumbs-el label="Sincronizar Aplicaciones" />
      </q-breadcrumbs>
    </div>

    <q-card flat bordered style="max-width: 480px; margin: 40px auto">
      <q-card-section class="text-center q-pa-xl">
        <q-icon name="sync" color="primary" size="56px" class="q-mb-md" />
        <div class="text-h6 q-mb-sm">Sincronizar Aplicaciones</div>
        <div class="text-body2 text-grey-6 q-mb-xl">
          ¿Desea sincronizar las aplicaciones?
        </div>
        <div class="text-caption text-grey-5 q-mb-lg">
          Esta acción actualizará la lista de aplicaciones disponibles en el sistema.
        </div>
        <q-btn
          unelevated
          no-caps
          icon="check"
          label="Aceptar"
          color="primary"
          size="lg"
          :loading="loading"
          @click="sincronizar"
        />
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useQuasar } from 'quasar'
import { api } from 'src/boot/axios'

const $q = useQuasar()
const loading = ref(false)

async function sincronizar() {
  loading.value = true
  try {
    const { data } = await api.post('/seguridad/sincronizar')
    $q.notify({
      type: 'positive',
      message: `Sincronización completada: ${data.total} aplicaciones actualizadas`,
      icon: 'check_circle',
    })
  } catch {
    $q.notify({ type: 'negative', message: 'Error al sincronizar aplicaciones' })
  } finally { loading.value = false }
}
</script>

<style lang="scss" scoped>
.maestro-page { max-width: 1400px; margin: 0 auto; }
.page-header {
  background: white; border-radius: 12px; padding: 20px 24px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
}
.page-title-area { display: flex; align-items: center; margin-bottom: 4px; }
</style>
