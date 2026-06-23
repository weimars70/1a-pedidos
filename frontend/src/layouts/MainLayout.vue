<template>
  <q-layout view="hHh Lpr lff">
    <!-- Header -->
    <q-header class="main-header">
      <q-toolbar class="header-toolbar">
        <!-- Brand -->
        <div class="brand-area">
          <div class="brand-logo">
            <span class="brand-u">U</span><span class="brand-no">NO</span><span class="brand-dash">-A</span>
          </div>
          <span class="brand-sub">ASEO INTEGRADO</span>
        </div>

        <!-- Navigation -->
        <nav class="main-nav">
          <q-btn flat no-caps class="nav-item" :class="{ active: isActive('/app/inicio') }" @click="navigate('/app/inicio', 'Inicio', 'dashboard')">
            <q-icon name="dashboard" size="16px" class="q-mr-xs" />
            Inicio
          </q-btn>

          <!-- Cesantías -->
          <q-btn flat no-caps class="nav-item" :class="{ active: isActive('/app/cesantias') }">
            <q-icon name="account_balance" size="16px" class="q-mr-xs" />
            Cesantías
            <q-icon name="arrow_drop_down" size="18px" />
            <q-menu class="nav-menu" anchor="bottom left" self="top left" :offset="[0, 4]" style="max-height: calc(100vh - 80px); overflow-y: auto;">
              <q-list dense>
                <q-item clickable v-close-popup @click="navigate('/app/cesantias', 'Cesantías', 'account_balance')">
                  <q-item-section>Cesantías</q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-btn>

          <!-- Maestros -->
          <q-btn flat no-caps class="nav-item" :class="{ active: isInMaestros }">
            <q-icon name="tune" size="16px" class="q-mr-xs" />
            Maestros
            <q-icon name="arrow_drop_down" size="18px" />
            <q-menu class="nav-menu" anchor="bottom left" self="top left" :offset="[0, 4]" style="max-height: calc(100vh - 80px); overflow-y: auto;">
              <q-list dense style="min-width: 240px">
                <q-item
                  v-for="item in maestrosMenu" :key="item.to"
                  clickable v-close-popup
                  @click="navigate(item.to, item.label, item.icon)"
                  :class="{ 'menu-item-active': isTabActive(item.to) }"
                >
                  <q-item-section avatar><q-icon :name="item.icon" size="18px" color="primary" /></q-item-section>
                  <q-item-section>{{ item.label }}</q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-btn>

          <!-- Asociaciones -->
          <q-btn flat no-caps class="nav-item" :class="{ active: isInAsociaciones }">
            <q-icon name="group_work" size="16px" class="q-mr-xs" />
            Asociaciones
            <q-icon name="arrow_drop_down" size="18px" />
            <q-menu class="nav-menu" anchor="bottom left" self="top left" :offset="[0, 4]" style="max-height: calc(100vh - 80px); overflow-y: auto;">
              <q-list dense style="min-width: 240px">
                <q-item
                  v-for="item in asociacionesMenu" :key="item.to"
                  clickable v-close-popup
                  @click="navigate(item.to, item.label, item.icon)"
                  :class="{ 'menu-item-active': isTabActive(item.to) }"
                >
                  <q-item-section avatar><q-icon :name="item.icon" size="18px" color="primary" /></q-item-section>
                  <q-item-section>{{ item.label }}</q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-btn>

          <!-- Contratos -->
          <q-btn flat no-caps class="nav-item" :class="{ active: isInContratos }">
            <q-icon name="description" size="16px" class="q-mr-xs" />
            Contratos
            <q-icon name="arrow_drop_down" size="18px" />
            <q-menu class="nav-menu" anchor="bottom left" self="top left" :offset="[0, 4]" style="max-height: calc(100vh - 80px); overflow-y: auto;">
              <q-list dense style="min-width: 240px">
                <q-item
                  v-for="item in contratosMenu" :key="item.to"
                  clickable v-close-popup
                  @click="navigate(item.to, item.label, item.icon)"
                  :class="{ 'menu-item-active': isTabActive(item.to) }"
                >
                  <q-item-section avatar><q-icon :name="item.icon" size="18px" color="primary" /></q-item-section>
                  <q-item-section>{{ item.label }}</q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-btn>

          <!-- Pedidos -->
          <q-btn flat no-caps class="nav-item" :class="{ active: isInPedidos }">
            <q-icon name="shopping_cart" size="16px" class="q-mr-xs" />
            Pedidos
            <q-icon name="arrow_drop_down" size="18px" />
            <q-menu class="nav-menu" anchor="bottom left" self="top left" :offset="[0, 4]" style="max-height: calc(100vh - 80px); overflow-y: auto;">
              <q-list dense style="min-width: 240px">
                <q-item
                  v-for="item in pedidosMenu" :key="item.route"
                  clickable v-close-popup
                  @click="navigate(item.route, item.label, item.icon)"
                  :class="{ 'menu-item-active': isTabActive(item.route) }"
                >
                  <q-item-section avatar><q-icon :name="item.icon" size="18px" color="primary" /></q-item-section>
                  <q-item-section>{{ item.label }}</q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-btn>

          <!-- Seguridad -->
          <q-btn flat no-caps class="nav-item" :class="{ active: isInSeguridad }">
            <q-icon name="security" size="16px" class="q-mr-xs" />
            Seguridad
            <q-icon name="arrow_drop_down" size="18px" />
            <q-menu class="nav-menu" anchor="bottom left" self="top left" :offset="[0, 4]" style="max-height: calc(100vh - 80px); overflow-y: auto;">
              <q-list dense style="min-width: 220px">
                <q-item
                  v-for="item in seguridadMenu" :key="item.to"
                  clickable v-close-popup
                  @click="item.action ? item.action() : navigate(item.to, item.label, item.icon)"
                  :class="{ 'menu-item-active': isTabActive(item.to) }"
                >
                  <q-item-section avatar><q-icon :name="item.icon" size="18px" color="primary" /></q-item-section>
                  <q-item-section>{{ item.label }}</q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-btn>
        </nav>

        <q-space />

        <!-- User info -->
        <div class="user-area">
          <div class="user-info">
            <span class="user-label">Bienvenido:</span>
            <span class="user-name">{{ authStore.user?.usuario }}</span>
          </div>
          <div class="user-divider"></div>
          <div class="user-info">
            <span class="user-label">Sucursal:</span>
            <span class="user-name">Uno-A Aseo Integrado S.A.</span>
          </div>
          <div class="user-divider"></div>
          <span class="system-name">LAVORO UNOA</span>
          <q-btn flat round dense icon="logout" class="logout-btn q-ml-sm" @click="logout">
            <q-tooltip>Cerrar sesión</q-tooltip>
          </q-btn>
        </div>
      </q-toolbar>

      <!-- Tab Bar -->
      <div class="tab-bar" v-if="tabsStore.tabs.length > 0">
        <div class="tab-bar-inner">
          <div
            v-for="tab in tabsStore.tabs"
            :key="tab.id"
            class="app-tab"
            :class="{ 'app-tab--active': tab.id === tabsStore.activeTabId }"
            @click="selectTab(tab.id)"
          >
            <q-icon :name="tab.icon" size="13px" class="tab-icon" />
            <span class="tab-label">{{ tab.label }}</span>
            <button class="tab-close" @click.stop="closeTab(tab.id)" title="Cerrar">
              <q-icon name="close" size="12px" />
            </button>
          </div>
        </div>
        <button class="tab-close-all" @click="tabsStore.closeAllTabs()" title="Cerrar todas">
          <q-icon name="close" size="14px" />
          <span>Todas</span>
        </button>
      </div>
    </q-header>

    <!-- Page content -->
    <q-page-container class="page-container">
      <router-view v-slot="{ Component }">
        <transition name="page-fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from 'src/stores/auth'
import { useTabsStore } from 'src/stores/tabs'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const tabsStore = useTabsStore()

// ── Menus ──────────────────────────────────────────────────────────────────
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

const asociacionesMenu = [
  { label: 'Asociacion Empleados Perfil', icon: 'badge', to: '/app/asociaciones/empleados-perfil' },
  { label: 'Listado Supernumerarios Auxiliares', icon: 'people', to: '/app/asociaciones/supernumerarios' },
  { label: 'Asociacion supernumerarios auxiliares', icon: 'people_outline', to: '/app/asociaciones/asociacion-supernumerarios' },
  { label: 'Listado Perfil Capacitacion', icon: 'school', to: '/app/asociaciones/perfiles-capacitacion' },
  { label: 'Asociacion perfil capacitacion', icon: 'model_training', to: '/app/asociaciones/asociacion-perfil-capacitacion' },
  { label: 'Listado Cuadrillas Especiales', icon: 'groups', to: '/app/asociaciones/cuadrillas' },
  { label: 'Crear plantillas cuadrillas especiales', icon: 'group_work', to: '/app/asociaciones/cuadrillas-plantillas' },
  { label: 'Listado Perfil EPP', icon: 'security', to: '/app/asociaciones/perfiles-epp' },
  { label: 'Asociar Perfil EPP', icon: 'shield', to: '/app/asociaciones/asociar-perfil-epp' },
  { label: 'Listado tipo equipo implementos', icon: 'construction', to: '/app/asociaciones/tipo-equipo-implementos' },
  { label: 'Asociar Tipo Equipo Implemento', icon: 'handyman', to: '/app/asociaciones/asociar-tipo-equipo-implemento' },
]

const contratosMenu = [
  { label: 'Listado de Contratos', to: '/app/contratos', icon: 'description' },
  { label: 'Nuevo registro de Terminación Contrato', to: '/app/contratos/registrar-terminacion', icon: 'assignment_late' },
  { label: 'Nuevo registro de Disminución Contrato', to: '/app/contratos/registrar-disminucion', icon: 'trending_down' },
  { label: 'Contratos Terminados', to: '/app/contratos/terminados', icon: 'assignment_turned_in' },
]

const pedidosMenu = [
  { label: 'Pedidos Áreas',                    route: '/app/pedidos/areas',                  icon: 'map' },
  { label: 'Pedidos EPP Dotación',             route: '/app/pedidos/epp-dotacion',            icon: 'health_and_safety' },
  { label: 'Pedidos EPP Dotación Procesado',   route: '/app/pedidos/epp-dotacion-procesado',  icon: 'verified' },
  { label: 'Pedidos Empleados',                route: '/app/pedidos/empleados',               icon: 'badge' },
  { label: 'Registrar Pedidos',                route: '/app/pedidos/registrar',               icon: 'add_shopping_cart' },
  { label: 'Pedidos EPP',                      route: '/app/pedidos/epp',                     icon: 'shield' },
  { label: 'Registrar Pedidos Especiales',     route: '/app/pedidos/registrar-especiales',    icon: 'post_add' },
  { label: 'Listado Pedidos Especiales',       route: '/app/pedidos/especiales',              icon: 'list_alt' },
  { label: 'Pedidos Especiales Programados',   route: '/app/pedidos/especiales-programados',  icon: 'event_note' },
  { label: 'Pedidos Especiales Áreas',         route: '/app/pedidos/especiales-areas',        icon: 'map' },
  { label: 'Pedidos Personal',                 route: '/app/pedidos/personal',                icon: 'people' },
  { label: 'Pedidos Personal Programados',     route: '/app/pedidos/personal-programados',    icon: 'event' },
  { label: 'Reporte Supervisión',              route: '/app/pedidos/supervision',             icon: 'supervisor_account' },
  { label: 'Pedidos a Facturar',               route: '/app/pedidos/a-facturar',              icon: 'pending_actions' },
  { label: 'Pedidos Facturados',               route: '/app/pedidos/facturados',              icon: 'receipt' },
  { label: 'Pedidos Anulados',                 route: '/app/pedidos/anulados',                icon: 'cancel' },
  { label: 'Enviar Pedido Coordinador',        route: '/app/pedidos/enviar-coordinador',      icon: 'send' },
  { label: 'Pedidos Enviados Coordinador',     route: '/app/pedidos/enviados-coordinador',    icon: 'outbox' },
  { label: 'Listado Pedidos',                  route: '/app/pedidos',                         icon: 'shopping_cart' },
]

const seguridadMenu = [
  { label: 'Usuarios',                  to: '/app/seguridad/usuarios',            icon: 'manage_accounts', action: undefined as (() => void) | undefined },
  { label: 'Soporte',                   to: '/app/seguridad/soporte',             icon: 'support_agent',   action: undefined as (() => void) | undefined },
  { label: 'Aplicaciones',              to: '/app/seguridad/aplicaciones',        icon: 'apps',            action: undefined as (() => void) | undefined },
  { label: 'Grupos',                    to: '/app/seguridad/grupos',              icon: 'group',           action: undefined as (() => void) | undefined },
  { label: 'Grupos Aplicaciones',       to: '/app/seguridad/grupos-aplicaciones', icon: 'admin_panel_settings', action: undefined as (() => void) | undefined },
  { label: 'Sincronizar Aplicaciones',  to: '/app/seguridad/sincronizar',         icon: 'sync',            action: undefined as (() => void) | undefined },
  { label: 'Cambiar Clave',             to: '/app/seguridad/cambiar-clave',       icon: 'lock',            action: undefined as (() => void) | undefined },
  { label: 'Cerrar Sesión',             to: '',                                   icon: 'logout',          action: () => logout() },
]

// ── Active helpers ──────────────────────────────────────────────────────────
const isInMaestros    = computed(() => route.path.startsWith('/app/maestros'))
const isInAsociaciones = computed(() => route.path.startsWith('/app/asociaciones'))
const isInContratos   = computed(() => route.path.startsWith('/app/contratos'))
const isInPedidos     = computed(() => route.path.startsWith('/app/pedidos'))
const isInSeguridad   = computed(() => route.path.startsWith('/app/seguridad'))

function isActive(path: string) { return route.path === path }
function isTabActive(path: string) { return tabsStore.tabs.some(t => t.route === path) }

// ── Navigation ──────────────────────────────────────────────────────────────
function navigate(path: string, label: string, icon: string) {
  tabsStore.openTab(path, label, icon)
  void router.push(path)
}

function selectTab(tabId: string) {
  const tab = tabsStore.tabs.find(t => t.id === tabId)
  if (!tab) return
  tabsStore.setActiveTab(tabId)
  void router.push(tab.route)
}

function closeTab(tabId: string) {
  const wasActive = tabsStore.activeTabId === tabId
  tabsStore.closeTab(tabId)

  // Si había otra pestaña activa después del cierre, navegar a ella
  if (wasActive && tabsStore.activeTab) {
    void router.push(tabsStore.activeTab.route)
  } else if (tabsStore.tabs.length === 0) {
    void router.push('/app/inicio')
  }
}

function logout() {
  authStore.logout()
  tabsStore.closeAllTabs()
  void router.push('/')
}

// Cuando el router cambia manualmente (botón atrás, etc.), sincronizar pestaña activa
watch(() => route.path, (newPath) => {
  const match = tabsStore.tabs.find(t => t.route === newPath)
  if (match && match.id !== tabsStore.activeTabId) {
    tabsStore.setActiveTab(match.id)
  }
})
</script>

<style lang="scss" scoped>
$teal-dark   : #0F5A52;
$teal-mid    : #1B7A6E;
$teal-light  : #26A69A;

/* ── Header ── */
.main-header {
  background: $teal-dark;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.3);
}

.header-toolbar {
  padding: 0 16px;
  min-height: 52px;
  gap: 0;
}

/* Brand */
.brand-area {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-right: 24px;
  padding-right: 24px;
  border-right: 1px solid rgba(255,255,255,0.2);
}

.brand-logo {
  font-size: 22px;
  font-weight: 900;
  line-height: 1;
  .brand-u   { color: #fff; }
  .brand-no  { color: rgba(255,255,255,0.85); }
  .brand-dash { color: $teal-light; }
}

.brand-sub {
  font-size: 9px;
  font-weight: 600;
  letter-spacing: 1.5px;
  color: rgba(255,255,255,0.6);
  text-transform: uppercase;
  line-height: 1.2;
  max-width: 60px;
}

/* Nav */
.main-nav {
  display: flex;
  align-items: center;
  gap: 2px;
}

.nav-item {
  color: rgba(255, 255, 255, 0.85) !important;
  font-size: 13px;
  font-weight: 500;
  padding: 6px 12px;
  border-radius: 6px;
  transition: all 0.2s ease;
  letter-spacing: 0.3px;

  &:hover {
    color: white !important;
    background: rgba(255, 255, 255, 0.12) !important;
  }

  &.active {
    color: white !important;
    background: rgba(255, 255, 255, 0.18) !important;
    font-weight: 600;
  }
}

/* User area */
.user-area {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 12px;
}

.user-info {
  display: flex;
  flex-direction: column;
  line-height: 1.3;
}

.user-label {
  font-size: 10px;
  color: rgba(255,255,255,0.55);
  letter-spacing: 0.5px;
}

.user-name {
  font-size: 12px;
  font-weight: 600;
  color: rgba(255,255,255,0.95);
}

.user-divider {
  width: 1px;
  height: 28px;
  background: rgba(255,255,255,0.2);
}

.system-name {
  font-size: 11px;
  font-weight: 700;
  color: $teal-light;
  letter-spacing: 1px;
  background: rgba(255,255,255,0.08);
  padding: 4px 10px;
  border-radius: 4px;
}

.logout-btn {
  color: rgba(255,255,255,0.7) !important;
  &:hover { color: white !important; }
}

/* ── Tab Bar ── */
.tab-bar {
  background: darken($teal-dark, 4%);
  border-top: 1px solid rgba(255,255,255,0.08);
  display: flex;
  align-items: stretch;
  min-height: 34px;
  overflow: hidden;
}

.tab-bar-inner {
  display: flex;
  align-items: stretch;
  flex: 1;
  overflow-x: auto;
  overflow-y: hidden;
  scrollbar-width: thin;
  scrollbar-color: rgba(255,255,255,0.2) transparent;

  &::-webkit-scrollbar { height: 3px; }
  &::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.25); border-radius: 2px; }
  &::-webkit-scrollbar-track { background: transparent; }
}

.app-tab {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 0 10px 0 12px;
  min-width: 130px;
  max-width: 200px;
  cursor: pointer;
  border-right: 1px solid rgba(255,255,255,0.07);
  background: transparent;
  color: rgba(255,255,255,0.55);
  transition: background 0.15s, color 0.15s;
  user-select: none;
  position: relative;

  &:hover {
    background: rgba(255,255,255,0.08);
    color: rgba(255,255,255,0.85);

    .tab-close { opacity: 1; }
  }

  &--active {
    background: rgba(255,255,255,0.14);
    color: #fff;
    font-weight: 600;

    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 2px;
      background: $teal-light;
    }

    .tab-close { opacity: 1; }
  }
}

.tab-icon {
  flex-shrink: 0;
  opacity: 0.8;
}

.tab-label {
  font-size: 12px;
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.tab-close {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: none;
  background: transparent;
  color: inherit;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.15s, background 0.15s;
  padding: 0;

  &:hover {
    background: rgba(255,255,255,0.2);
    opacity: 1 !important;
  }
}

.tab-close-all {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 0 12px;
  border: none;
  border-left: 1px solid rgba(255,255,255,0.1);
  background: transparent;
  color: rgba(255,255,255,0.4);
  font-size: 11px;
  cursor: pointer;
  transition: color 0.15s, background 0.15s;
  white-space: nowrap;
  flex-shrink: 0;

  &:hover {
    color: rgba(255,255,255,0.8);
    background: rgba(255,255,255,0.08);
  }
}

/* Page container */
.page-container {
  background: #F0F4F8;
  min-height: calc(100vh - 52px);
}

/* Page transitions */
.page-fade-enter-active,
.page-fade-leave-active { transition: opacity 0.18s ease; }
.page-fade-enter-from,
.page-fade-leave-to { opacity: 0; }
</style>
