<template>
  <q-page class="maestro-page q-pa-lg">
    <div class="page-header q-mb-lg">
      <div class="page-title-area">
        <q-icon name="admin_panel_settings" color="primary" size="28px" class="q-mr-sm" />
        <h5 class="q-ma-none text-weight-bold text-grey-9">Grupos Aplicaciones</h5>
      </div>
      <q-breadcrumbs class="text-caption q-mt-xs" active-color="primary">
        <q-breadcrumbs-el label="Inicio" to="/app/inicio" />
        <q-breadcrumbs-el label="Seguridad" />
        <q-breadcrumbs-el label="Grupos Aplicaciones" />
      </q-breadcrumbs>
    </div>

    <!-- Group selector -->
    <q-card flat bordered class="q-mb-lg">
      <q-card-section>
        <div class="row items-center q-gutter-md">
          <q-select
            v-model="selectedGrupoId"
            label="Grupos"
            outlined
            dense
            color="primary"
            style="min-width: 240px"
            :options="gruposOptions"
            emit-value
            map-options
          />
          <q-btn
            unelevated
            no-caps
            icon="search"
            label="ok"
            color="primary"
            :loading="loadingApps"
            @click="loadApps"
          />
        </div>
      </q-card-section>
    </q-card>

    <!-- Applications list -->
    <q-card v-if="aplicaciones.length > 0" flat bordered>
      <q-card-section class="row items-center justify-between">
        <span class="text-subtitle2 text-weight-bold">
          Aplicaciones para: {{ selectedGrupoNombre }}
        </span>
        <q-btn unelevated no-caps label="Guardar cambios" color="primary" icon="save"
          :loading="saving" @click="saveChanges" />
      </q-card-section>
      <q-separator />
      <q-list separator>
        <q-item v-for="app in aplicaciones" :key="app.id" dense>
          <q-item-section avatar>
            <q-checkbox v-model="app.asignada" color="primary" />
          </q-item-section>
          <q-item-section avatar>
            <q-icon :name="app.icono || 'apps'" color="primary" size="20px" />
          </q-item-section>
          <q-item-section>
            <q-item-label>{{ app.nombre }}</q-item-label>
            <q-item-label caption>{{ app.url }}</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-card>

    <div v-else-if="loadingApps === false && selectedGrupoId && searched" class="text-grey-5 text-center q-py-xl">
      <q-icon name="apps" size="48px" class="q-mb-sm" />
      <div>Seleccione un grupo y haga click en "ok"</div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { api } from 'src/boot/axios'

interface Grupo { id: number; nombre: string }
interface AppConAsignacion { id: number; nombre: string; url: string; icono: string; asignada: boolean }

const $q = useQuasar()

const grupos = ref<Grupo[]>([])
const selectedGrupoId = ref<number | null>(null)
const aplicaciones = ref<AppConAsignacion[]>([])
const loadingApps = ref(false)
const saving = ref(false)
const searched = ref(false)

const gruposOptions = computed(() => grupos.value.map(g => ({ label: g.nombre, value: g.id })))
const selectedGrupoNombre = computed(() => grupos.value.find(g => g.id === selectedGrupoId.value)?.nombre ?? '')

async function loadGrupos() {
  try {
    const { data } = await api.get('/seguridad/grupos')
    grupos.value = data
  } catch {
    $q.notify({ type: 'negative', message: 'Error al cargar grupos' })
  }
}

async function loadApps() {
  if (!selectedGrupoId.value) {
    $q.notify({ type: 'warning', message: 'Seleccione un grupo' })
    return
  }
  loadingApps.value = true
  searched.value = true
  try {
    const { data } = await api.get(`/seguridad/grupos/${selectedGrupoId.value}/aplicaciones`)
    aplicaciones.value = data
  } catch {
    $q.notify({ type: 'negative', message: 'Error al cargar aplicaciones' })
  } finally { loadingApps.value = false }
}

async function saveChanges() {
  if (!selectedGrupoId.value) return
  saving.value = true
  try {
    for (const app of aplicaciones.value) {
      if (app.asignada) {
        await api.post('/seguridad/grupos-aplicaciones', {
          grupoId: selectedGrupoId.value,
          aplicacionId: app.id,
        }).catch(() => { /* ignore conflict - already assigned */ })
      } else {
        await api.delete('/seguridad/grupos-aplicaciones/remove', {
          data: { grupoId: selectedGrupoId.value, aplicacionId: app.id }
        }).catch(() => { /* ignore not found */ })
      }
    }
    $q.notify({ type: 'positive', message: 'Cambios guardados', icon: 'check_circle' })
  } catch {
    $q.notify({ type: 'negative', message: 'Error al guardar cambios' })
  } finally { saving.value = false }
}

onMounted(loadGrupos)
</script>

<style lang="scss" scoped>
.maestro-page { max-width: 1400px; margin: 0 auto; }
.page-header {
  background: white; border-radius: 12px; padding: 20px 24px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
}
.page-title-area { display: flex; align-items: center; margin-bottom: 4px; }
</style>
