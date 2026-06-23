import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Cliente } from './cliente.entity';

const SELECT_CLIENTE = `
  SELECT
    c.codigo AS id, c.id AS codigo, c.ident, c.nombre, c.ciudad_codigo,
    ci.nombre AS ciudad_nombre,
    c.direccion, c.telefono, c.correo, c.contacto,
    c.centro_costos, c.tope_credito,
    c.cod_supervisor, e.nombre AS supervisor_nombre,
    c.codigo_sector, s.nombre AS sector_nombre,
    c.observaciones, c.activo
  FROM clientes c
  LEFT JOIN ciudades ci ON ci.codigo = c.ciudad_codigo
  LEFT JOIN empleados e ON e.codigo = c.cod_supervisor
  LEFT JOIN sectores s ON s.codigo = c.codigo_sector
`;

@Injectable()
export class ClientesService {
  constructor(
    @InjectRepository(Cliente) private readonly repo: Repository<Cliente>,
    private readonly db: DataSource,
  ) {}

  findAll() {
    return this.db.query(`${SELECT_CLIENTE} WHERE c.activo IS DISTINCT FROM false ORDER BY c.nombre`);
  }

  async findOne(id: number) {
    const rows = await this.db.query(`${SELECT_CLIENTE} WHERE c.codigo = $1`, [id]);
    if (!rows[0]) throw new NotFoundException(`Cliente ${id} no encontrado`);
    return rows[0];
  }

  create(data: Partial<Cliente>) {
    const { id: _id, ...rest } = data as Record<string, unknown>;
    return this.repo.save(this.repo.create(rest as Partial<Cliente>));
  }

  async update(id: number, data: Partial<Cliente>) {
    await this.repo.update(id, data);
    return this.findOne(id);
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
