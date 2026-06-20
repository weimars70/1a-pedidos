import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class DatabaseInitService implements OnApplicationBootstrap {
  private readonly logger = new Logger(DatabaseInitService.name);

  constructor(private readonly db: DataSource) {}

  async onApplicationBootstrap() {
    await this.createTables();
    await this.syncSequences();
  }

  private async createTables() {
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS contratos (
        id SERIAL PRIMARY KEY,
        tipo VARCHAR(50) NOT NULL,
        n_perfil VARCHAR(100),
        fecha DATE,
        fecha_inicio DATE,
        fecha_terminacion DATE,
        nit VARCHAR(30),
        nombre_cliente VARCHAR(200),
        personas INTEGER DEFAULT 1,
        coordinador VARCHAR(100),
        observaciones TEXT,
        usuario INTEGER,
        activo BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    this.logger.log('Table contratos ensured');

    await this.db.query(`
      CREATE TABLE IF NOT EXISTS soporte (
        id SERIAL PRIMARY KEY,
        fecha_hora TIMESTAMP DEFAULT NOW(),
        novedad TEXT,
        estado VARCHAR(50) DEFAULT 'Abierto'
      )
    `);

    await this.db.query(`
      CREATE TABLE IF NOT EXISTS soporte_seguimiento (
        id SERIAL PRIMARY KEY,
        soporte_id INTEGER REFERENCES soporte(id) ON DELETE CASCADE,
        fecha TIMESTAMP DEFAULT NOW(),
        descripcion TEXT,
        usuario VARCHAR(100)
      )
    `);

    await this.db.query(`
      CREATE TABLE IF NOT EXISTS sec_grupos (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL,
        descripcion TEXT
      )
    `);

    await this.db.query(`
      CREATE TABLE IF NOT EXISTS sec_aplicaciones (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(200) NOT NULL,
        descripcion TEXT,
        url VARCHAR(500),
        icono VARCHAR(100),
        activo BOOLEAN DEFAULT true
      )
    `);

    await this.db.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_sec_aplicaciones_url ON sec_aplicaciones(url)
    `);

    await this.db.query(`
      CREATE TABLE IF NOT EXISTS sec_grupos_aplicaciones (
        id SERIAL PRIMARY KEY,
        grupo_id INTEGER REFERENCES sec_grupos(id) ON DELETE CASCADE,
        aplicacion_id INTEGER REFERENCES sec_aplicaciones(id) ON DELETE CASCADE,
        UNIQUE(grupo_id, aplicacion_id)
      )
    `);

    this.logger.log('Seguridad tables ensured');
  }

  private async syncSequences() {
    const targets: [string, string][] = [
      ['causal_terminacion_contrato', 'id'],
      ['cuadrillas_especiales',       'id'],
      ['perfiles',                    'id'],
      ['tipo_equipo',                 'id'],
      ['tipo_servicio',               'id'],
      ['empleados',                   'codigo'],
      ['clientes',                    'codigo'],
      ['equipos',                     'codigo'],
      ['implementos',                 'codigo'],
    ];

    for (const [table, col] of targets) {
      try {
        await this.ensureSequence(table, col);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        this.logger.warn(`syncSequences: error on ${table}.${col} — ${msg}`);
      }
    }

    this.logger.log('PK sequences synced');
  }

  private async ensureSequence(table: string, col: string) {
    const [row] = await this.db.query<{ seq: string | null }[]>(
      `SELECT pg_get_serial_sequence($1, $2) AS seq`,
      [table, col],
    );

    // Calculate safe next value:
    // Use max of "sequential-looking" codes (< 100 million) to avoid
    // treating legacy cedula numbers stored in PK columns as the series.
    // Fall back to COUNT(*) so we at least don't collide with row count.
    const [stats] = await this.db.query<{ safe_max: number; total: number }[]>(`
      SELECT
        COALESCE(MAX("${col}") FILTER (WHERE "${col}" < 100000000), 0)::int AS safe_max,
        COUNT(*)::int AS total
      FROM "${table}"
    `);

    const nextVal = Math.max(Number(stats.safe_max), Number(stats.total)) + 1;

    if (row.seq) {
      // Sequence exists — advance it to the safe next value
      await this.db.query(`SELECT setval($1, $2)`, [row.seq, nextVal]);
      this.logger.log(`Reset sequence ${row.seq} → ${nextVal}`);
    } else {
      // No sequence — create one and attach it as the column default
      const seqName = `${table}_${col}_seq`;

      await this.db.query(
        `CREATE SEQUENCE IF NOT EXISTS "${seqName}" START WITH ${nextVal}`,
      );
      // If sequence already existed (CREATE IF NOT EXISTS was a no-op), still advance it
      await this.db.query(`SELECT setval('"${seqName}"', ${nextVal})`);
      await this.db.query(
        `ALTER TABLE "${table}" ALTER COLUMN "${col}" SET DEFAULT nextval('"${seqName}"')`,
      );
      await this.db.query(
        `ALTER SEQUENCE "${seqName}" OWNED BY "${table}"."${col}"`,
      );

      this.logger.log(`Created sequence ${seqName} → ${nextVal} for ${table}.${col}`);
    }
  }
}
