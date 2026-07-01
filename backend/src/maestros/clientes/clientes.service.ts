import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Cliente } from './cliente.entity';

// El sector real vive en la tabla puente cliente_sector (codigo_cliente -> sector),
// igual que la vista de producción view_clientes. La columna clientes.codigo_sector
// está desactualizada para la mayoría de clientes, por eso se usa cliente_sector.
const SELECT_CLIENTE = `
  SELECT
    c.codigo AS id, c.id AS codigo, c.ident, c.nombre, c.ciudad_codigo,
    ci.nombre AS ciudad_nombre,
    c.direccion, c.telefono, c.correo, c.contacto,
    c.centro_costos, c.tope_credito,
    c.cod_supervisor, e.nombre AS supervisor_nombre,
    cs.sector AS codigo_sector, s.nombre AS sector_nombre,
    c.observaciones, c.activo,
    c.fecha AS fecha_inicio_servicio
  FROM clientes c
  LEFT JOIN ciudades ci ON ci.codigo = c.ciudad_codigo
  LEFT JOIN empleados e ON e.codigo = c.cod_supervisor
  LEFT JOIN cliente_sector cs ON cs.codigo_cliente = c.codigo
  LEFT JOIN sectores s ON s.codigo = cs.sector
`;

@Injectable()
export class ClientesService {
  constructor(
    @InjectRepository(Cliente) private readonly repo: Repository<Cliente>,
    private readonly db: DataSource,
  ) {}

  findAll() {
    const q = `${SELECT_CLIENTE} WHERE c.activo IS DISTINCT FROM false ORDER BY c.nombre`;
    return this.db.query(q);
  }

  async findOne(id: number) {
    const q = `${SELECT_CLIENTE} WHERE c.codigo = $1`;
    const rows = await this.db.query(q, [id]);
    if (!rows[0]) throw new NotFoundException(`Cliente ${id} no encontrado`);
    return rows[0];
  }

  async create(data: Partial<Cliente>) {
    const { id: _id, codigo_sector, ...rest } = data as Record<string, unknown>;
    void _id;
    const saved = await this.repo.save(this.repo.create(rest as Partial<Cliente>));
    if (codigo_sector !== undefined) {
      await this.syncSector(saved.id, Number(codigo_sector) || 0);
    }
    return this.findOne(saved.id);
  }

  async update(id: number, data: Partial<Cliente>) {
    // El sector se persiste en la tabla puente cliente_sector, no en clientes.codigo_sector.
    // Se extrae del payload y se sincroniza por separado.
    const { codigo_sector, ...rest } = data as Record<string, unknown>;
    if (Object.keys(rest).length > 0) {
      await this.repo.update(id, rest as Partial<Cliente>);
    }
    if (codigo_sector !== undefined) {
      await this.syncSector(id, Number(codigo_sector) || 0);
    }
    return this.findOne(id);
  }

  /** Mantiene cliente_sector 1:1 con el cliente. sector<=0 elimina la relación. */
  private async syncSector(codigoCliente: number, sector: number) {
    if (!sector || sector <= 0) {
      await this.db.query(
        `DELETE FROM cliente_sector WHERE codigo_cliente = $1`,
        [codigoCliente],
      );
      return;
    }
    const res: unknown[] = await this.db.query(
      `UPDATE cliente_sector SET sector = $2, r_ufechahora = NOW()
       WHERE codigo_cliente = $1`,
      [codigoCliente, sector],
    );
    // node-postgres devuelve [rows, rowCount]; usamos un SELECT de control por portabilidad
    const exists = await this.db.query(
      `SELECT 1 FROM cliente_sector WHERE codigo_cliente = $1 LIMIT 1`,
      [codigoCliente],
    );
    void res;
    if (!exists.length) {
      await this.db.query(
        `INSERT INTO cliente_sector (codigo_cliente, sector, r_ifechahora, r_ufechahora, usuario)
         VALUES ($1, $2, NOW(), NOW(), 1)`,
        [codigoCliente, sector],
      );
    }
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.repo.update(id, { activo: false } as Partial<Cliente>);
  }

  // ── Options ──
  getCiudadesOptions() {
    return this.db.query(`SELECT codigo AS value, nombre AS label FROM ciudades ORDER BY nombre`);
  }

  getSectoresOptions() {
    return this.db.query(`SELECT codigo AS value, nombre AS label FROM sectores ORDER BY nombre`);
  }

  getContactosTipoOptions() {
    return this.db.query(`SELECT codigo AS value, nombre AS label FROM contactos_tipo ORDER BY nombre`);
  }

  // ── Contactos ──
  getContactos(clienteId: number) {
    return this.db.query(
      `SELECT cc.id, cc.id_cliente, cc.cargo, ct.nombre AS cargo_nombre,
              cc.nombre, cc.telefono, cc.direccion, cc.correo, cc.comentario
       FROM contactos_cliente cc
       LEFT JOIN contactos_tipo ct ON ct.codigo = cc.cargo
       WHERE cc.id_cliente = $1 ORDER BY cc.id`,
      [clienteId],
    );
  }

  async addContacto(clienteId: number, data: {
    cargo?: number; nombre: string; telefono?: string;
    direccion?: string; correo?: string; comentario?: string;
  }) {
    const result = await this.db.query(
      `INSERT INTO contactos_cliente (id_cliente, cargo, nombre, telefono, direccion, correo, comentario, usuario)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 1) RETURNING id`,
      [clienteId, data.cargo ?? null, data.nombre, data.telefono ?? null,
       data.direccion ?? null, data.correo ?? null, data.comentario ?? null],
    );
    return this.db.query(
      `SELECT cc.id, cc.id_cliente, cc.cargo, ct.nombre AS cargo_nombre,
              cc.nombre, cc.telefono, cc.direccion, cc.correo, cc.comentario
       FROM contactos_cliente cc
       LEFT JOIN contactos_tipo ct ON ct.codigo = cc.cargo
       WHERE cc.id = $1`,
      [result[0].id],
    ).then(r => r[0]);
  }

  async removeContacto(clienteId: number, contactId: number) {
    await this.db.query(
      `DELETE FROM contactos_cliente WHERE id = $1 AND id_cliente = $2`,
      [contactId, clienteId],
    );
  }
}
