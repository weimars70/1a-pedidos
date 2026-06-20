import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

const MODULOS = [
  { nombre: 'Inicio', url: '/app/inicio', icono: 'dashboard' },
  { nombre: 'Cesantías', url: '/app/cesantias', icono: 'account_balance' },
  { nombre: 'Maestros - Causales', url: '/app/maestros/causales', icono: 'cancel' },
  { nombre: 'Maestros - Cuadrillas', url: '/app/maestros/cuadrillas', icono: 'groups' },
  { nombre: 'Maestros - Empleados', url: '/app/maestros/empleados', icono: 'badge' },
  { nombre: 'Maestros - Implementos', url: '/app/maestros/implementos', icono: 'construction' },
  { nombre: 'Maestros - Clientes', url: '/app/maestros/clientes', icono: 'people' },
  { nombre: 'Maestros - Maquinaria', url: '/app/maestros/maquinaria', icono: 'precision_manufacturing' },
  { nombre: 'Maestros - Perfiles', url: '/app/maestros/perfiles', icono: 'person_pin' },
  { nombre: 'Maestros - Tipo Equipo', url: '/app/maestros/tipo-equipo', icono: 'category' },
  { nombre: 'Maestros - Tipo Servicio', url: '/app/maestros/tipo-servicio', icono: 'design_services' },
  { nombre: 'Asociaciones - Empleados Perfil', url: '/app/asociaciones/empleados-perfil', icono: 'badge' },
  { nombre: 'Asociaciones - Supernumerarios', url: '/app/asociaciones/supernumerarios', icono: 'people' },
  { nombre: 'Contratos', url: '/app/contratos', icono: 'description' },
  { nombre: 'Pedidos', url: '/app/pedidos', icono: 'shopping_cart' },
  { nombre: 'Seguridad - Usuarios', url: '/app/seguridad/usuarios', icono: 'manage_accounts' },
  { nombre: 'Seguridad - Soporte', url: '/app/seguridad/soporte', icono: 'support_agent' },
  { nombre: 'Seguridad - Aplicaciones', url: '/app/seguridad/aplicaciones', icono: 'apps' },
  { nombre: 'Seguridad - Grupos', url: '/app/seguridad/grupos', icono: 'group' },
];

@Injectable()
export class SincronizarService {
  constructor(private readonly db: DataSource) {}

  async sincronizar() {
    for (const app of MODULOS) {
      await this.db.query(
        `INSERT INTO sec_aplicaciones (nombre, url, icono, activo)
         VALUES ($1, $2, $3, true)
         ON CONFLICT (url) DO UPDATE SET nombre = $1, icono = $3, activo = true`,
        [app.nombre, app.url, app.icono],
      );
    }
    return { message: 'Aplicaciones sincronizadas', total: MODULOS.length };
  }
}
