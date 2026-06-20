import { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('pages/LoginPage.vue')
  },
  {
    path: '/app',
    component: () => import('layouts/MainLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      { path: '', redirect: '/app/inicio' },
      { path: 'inicio', component: () => import('pages/InicioPage.vue') },
      // Maestros
      { path: 'maestros/causales', component: () => import('pages/maestros/CausalesPage.vue') },
      { path: 'maestros/cuadrillas', component: () => import('pages/maestros/CuadrillasPage.vue') },
      { path: 'maestros/empleados', component: () => import('pages/maestros/EmpleadosPage.vue') },
      { path: 'maestros/implementos', component: () => import('pages/maestros/ImplementosPage.vue') },
      { path: 'maestros/clientes', component: () => import('pages/maestros/ClientesPage.vue') },
      { path: 'maestros/maquinaria', component: () => import('pages/maestros/MaquinariaPage.vue') },
      { path: 'maestros/perfiles', component: () => import('pages/maestros/PerfilesPage.vue') },
      { path: 'maestros/tipo-equipo', component: () => import('pages/maestros/TipoEquipoPage.vue') },
      { path: 'maestros/tipo-servicio', component: () => import('pages/maestros/TipoServicioPage.vue') },
      // Módulos futuros (placeholders)
      { path: 'cesantias', component: () => import('pages/CesantiasPage.vue') },
      // Asociaciones
      { path: 'asociaciones/empleados-perfil', component: () => import('pages/asociaciones/EmpleadosPerfilPage.vue') },
      { path: 'asociaciones/supernumerarios', component: () => import('pages/asociaciones/SupernumerariosPage.vue') },
      { path: 'asociaciones/perfiles-capacitacion', component: () => import('pages/asociaciones/PerfilesCapacitacionPage.vue') },
      { path: 'asociaciones/cuadrillas', component: () => import('pages/asociaciones/CuadrillasPage.vue') },
      { path: 'asociaciones/cuadrillas-plantillas', component: () => import('pages/asociaciones/CuadrillasEspecialesPlantillasPage.vue') },
      { path: 'asociaciones/perfiles-epp', component: () => import('pages/asociaciones/PerfilesEPPPage.vue') },
      { path: 'asociaciones/tipo-equipo-implementos', component: () => import('pages/asociaciones/TipoEquipoImplementosPage.vue') },
      { path: 'asociaciones/asociacion-supernumerarios', component: () => import('pages/asociaciones/AsociacionSupernumerariosPage.vue') },
      { path: 'asociaciones/asociacion-perfil-capacitacion', component: () => import('pages/asociaciones/AsociacionPerfilCapacitacionPage.vue') },
      { path: 'asociaciones/asociar-perfil-epp', component: () => import('pages/asociaciones/AsociarPerfilEppPage.vue') },
      { path: 'asociaciones/asociar-tipo-equipo-implemento', component: () => import('pages/asociaciones/AsociarTipoEquipoImplementoPage.vue') },
      { path: 'contratos', component: () => import('pages/contratos/ContratosPage.vue') },
      { path: 'contratos/terminados', component: () => import('pages/contratos/ContratosTerminadosPage.vue') },
      { path: 'pedidos', component: () => import('pages/pedidos/ListadoPedidosPage.vue') },
      { path: 'pedidos/personal', component: () => import('pages/pedidos/PedidosPersonalPage.vue') },
      { path: 'pedidos/personal-programados', component: () => import('pages/pedidos/PedidosPersonalProgramadosPage.vue') },
      { path: 'pedidos/anulados', component: () => import('pages/pedidos/PedidosAnuladosPage.vue') },
      { path: 'pedidos/facturados', component: () => import('pages/pedidos/PedidosFacturadosPage.vue') },
      { path: 'pedidos/a-facturar', component: () => import('pages/pedidos/PedidosAFacturarPage.vue') },
      { path: 'pedidos/epp', component: () => import('pages/pedidos/PedidosEppPage.vue') },
      { path: 'pedidos/epp-dotacion', component: () => import('pages/pedidos/PedidosEppDotacionPage.vue') },
      { path: 'pedidos/epp-dotacion-procesado', component: () => import('pages/pedidos/PedidosEppDotacionProcesadoPage.vue') },
      { path: 'pedidos/empleados', component: () => import('pages/pedidos/PedidosEmpleadosPage.vue') },
      { path: 'pedidos/areas', component: () => import('pages/pedidos/PedidosAreasPage.vue') },
      { path: 'pedidos/enviados-coordinador', component: () => import('pages/pedidos/PedidosEnviadosCoordinadorPage.vue') },
      { path: 'pedidos/especiales', component: () => import('pages/pedidos/ListadoPedidosEspecialesPage.vue') },
      { path: 'pedidos/especiales-programados', component: () => import('pages/pedidos/PedidosEspecialesProgramadosPage.vue') },
      { path: 'pedidos/especiales-areas', component: () => import('pages/pedidos/PedidosEspecialesAreasPage.vue') },
      { path: 'pedidos/supervision', component: () => import('pages/pedidos/PedidosPersonalReportePage.vue') },
      { path: 'pedidos/enviar-coordinador', component: () => import('pages/pedidos/EnviarPedidoCoordinadorPage.vue') },
      { path: 'pedidos/registrar', component: () => import('pages/pedidos/RegistraPedidosPage.vue') },
      { path: 'pedidos/registrar-especiales', component: () => import('pages/pedidos/RegistrarPedidosEspecialesPage.vue') },
      // Seguridad
      { path: 'seguridad/usuarios', component: () => import('pages/seguridad/UsuariosPage.vue') },
      { path: 'seguridad/soporte', component: () => import('pages/seguridad/SoportePage.vue') },
      { path: 'seguridad/aplicaciones', component: () => import('pages/seguridad/AplicacionesPage.vue') },
      { path: 'seguridad/grupos', component: () => import('pages/seguridad/GruposPage.vue') },
      { path: 'seguridad/grupos-aplicaciones', component: () => import('pages/seguridad/GruposAplicacionesPage.vue') },
      { path: 'seguridad/sincronizar', component: () => import('pages/seguridad/SincronizarAplicacionesPage.vue') },
      { path: 'seguridad/cambiar-clave', component: () => import('pages/seguridad/CambiarClavePage.vue') },
    ]
  },
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue')
  }
]

export default routes
