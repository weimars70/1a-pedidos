<template>
  <q-page class="maestro-page q-pa-lg">

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
.maestro-page { width: 100%; }

</style>
