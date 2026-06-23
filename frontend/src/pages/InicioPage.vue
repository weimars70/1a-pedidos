<template>
  <q-page class="inicio-page q-pa-lg">
    <!-- Welcome bar -->
    <div class="welcome-bar q-mb-lg">
      <div class="welcome-content">
        <div class="welcome-text">
          <h5 class="q-ma-none text-weight-bold">Panel de Control</h5>
          <p class="q-ma-none text-grey-6 text-caption">Uno-A Aseo Integrado S.A. — Sistema de Gestión Empresarial</p>
        </div>
        <div class="welcome-date">
          <q-icon name="calendar_today" color="primary" size="16px" class="q-mr-xs" />
          <span class="text-caption text-grey-6">{{ today }}</span>
        </div>
      </div>
    </div>

    <!-- Module cards -->
    <div class="modules-grid">
      <div
        v-for="mod in modules"
        :key="mod.to"
        class="module-card"
        @click="$router.push(mod.to)"
      >
        <div class="module-icon-wrap" :style="{ background: mod.color }">
          <q-icon :name="mod.icon" size="32px" color="white" />
        </div>
        <div class="module-info">
          <div class="module-title">{{ mod.title }}</div>
          <div class="module-desc">{{ mod.desc }}</div>
        </div>
        <q-icon name="arrow_forward_ios" size="14px" class="module-arrow text-grey-4" />
      </div>
    </div>

    <!-- Maestros quick access -->
    <div class="section-title q-mt-xl q-mb-md">
      <q-icon name="tune" color="primary" size="20px" class="q-mr-sm" />
      <span class="text-weight-bold text-grey-8">Acceso rápido — Maestros</span>
    </div>
    <div class="maestros-grid">
      <q-card
        v-for="item in maestrosMenu"
        :key="item.to"
        flat
        bordered
        class="maestro-card cursor-pointer"
        @click="$router.push(item.to)"
      >
        <q-card-section class="row items-center no-wrap q-pa-md">
          <q-icon :name="item.icon" color="primary" size="22px" class="q-mr-sm" />
          <span class="text-body2 text-grey-8">{{ item.label }}</span>
          <q-space />
          <q-icon name="chevron_right" color="grey-4" size="18px" />
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const today = computed(() => {
  return new Date().toLocaleDateString('es-CO', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
})

const modules = [
  { title: 'Maestros', desc: 'Tablas de configuración base', to: '/app/maestros/causales', icon: 'tune', color: '#1B7A6E' },
  { title: 'Cesantías', desc: 'Gestión de cesantías', to: '/app/cesantias', icon: 'account_balance', color: '#2979FF' },
  { title: 'Asociaciones', desc: 'Administrar asociaciones', to: '/app/asociaciones', icon: 'group_work', color: '#7B1FA2' },
  { title: 'Contratos', desc: 'Control de contratos', to: '/app/contratos', icon: 'description', color: '#E65100' },
  { title: 'Pedidos', desc: 'Gestión de pedidos', to: '/app/pedidos', icon: 'shopping_cart', color: '#00838F' },
  { title: 'Seguridad', desc: 'Usuarios y permisos', to: '/app/seguridad', icon: 'security', color: '#424242' },
]

const maestrosMenu = [
  { label: 'Causales Terminación Contratos', to: '/app/maestros/causales', icon: 'cancel' },
  { label: 'Cuadrillas Especiales', to: '/app/maestros/cuadrillas', icon: 'groups' },
  { label: 'Empleados', to: '/app/maestros/empleados', icon: 'badge' },
  { label: 'Implemento Maquinaria Equipos', to: '/app/maestros/implementos', icon: 'construction' },
  { label: 'Listado Clientes', to: '/app/maestros/clientes', icon: 'people' },
  { label: 'Maquinaria / Equipos', to: '/app/maestros/maquinaria', icon: 'precision_manufacturing' },
  { label: 'Perfiles Empleado', to: '/app/maestros/perfiles', icon: 'person_pin' },
  { label: 'Tipo Equipo', to: '/app/maestros/tipo-equipo', icon: 'category' },
  { label: 'Tipo Servicio', to: '/app/maestros/tipo-servicio', icon: 'design_services' },
]
</script>

<style lang="scss" scoped>
.inicio-page { width: 100%; }

.welcome-bar {
  background: white;
  border-radius: 12px;
  padding: 20px 24px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.08);
}
.welcome-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.welcome-date {
  display: flex;
  align-items: center;
}

/* Module cards */
.modules-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}
.module-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  cursor: pointer;
  box-shadow: 0 1px 4px rgba(0,0,0,0.08);
  transition: all 0.2s ease;
  border: 1px solid transparent;

  &:hover {
    border-color: #1B7A6E;
    box-shadow: 0 4px 16px rgba(27,122,110,0.15);
    transform: translateY(-2px);
  }
}
.module-icon-wrap {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.module-title {
  font-weight: 700;
  font-size: 15px;
  color: #1a1a2e;
  margin-bottom: 2px;
}
.module-desc {
  font-size: 12px;
  color: #9e9e9e;
}
.module-arrow { margin-left: auto; }

/* Maestros grid */
.section-title {
  display: flex;
  align-items: center;
}
.maestros-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 10px;
}
.maestro-card {
  border-radius: 8px !important;
  transition: all 0.15s ease;
  &:hover {
    background: #f0faf8 !important;
    border-color: #1B7A6E !important;
  }
}
</style>
