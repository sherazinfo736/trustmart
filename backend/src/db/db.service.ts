import { Injectable, Logger } from '@nestjs/common';
import { DatabaseSync } from 'node:sqlite';
import * as fs from 'node:fs';
import * as path from 'node:path';

/**
 * Thin persistence layer over Node's built-in `node:sqlite` module.
 *
 * WHY NOT PRISMA: Prisma's `generate` step downloads a native query-engine
 * binary from binaries.prisma.sh at install/generate time. That domain is not
 * reachable from this environment's network policy, so `prisma generate`
 * fails here. `node:sqlite` ships inside Node itself (stable since Node 22.5),
 * so there is zero external binary dependency.
 *
 * FOR PRODUCTION: swap this service's internals for a real Postgres client
 * (e.g. `pg` or re-introduce Prisma once you have unrestricted network
 * access to pull its engine binary) — every table below was designed to be
 * directly portable to Postgres (see schema.sql comments). The rest of the
 * codebase talks to this service through plain methods, not raw SQL calls
 * scattered around, so that swap only touches this one file.
 */
@Injectable()
export class DbService {
  private readonly logger = new Logger(DbService.name);
  db!: DatabaseSync;

  constructor() {
    const dbPath = path.join(process.cwd(), 'trustmart.db');
    this.db = new DatabaseSync(dbPath);
    this.db.exec('PRAGMA foreign_keys = ON;');
    const candidates = [
      path.join(__dirname, 'schema.sql'),
      path.join(process.cwd(), 'src', 'db', 'schema.sql'),
      path.join(process.cwd(), 'dist', 'db', 'schema.sql'),
    ];
    const schemaPath = candidates.find((p) => fs.existsSync(p));
    if (!schemaPath) throw new Error('schema.sql not found in any expected location');
    const schema = fs.readFileSync(schemaPath, 'utf-8');
    this.db.exec(schema);
    this.logger.log(`SQLite database ready at ${dbPath}`);
  }

  run(sql: string, params: unknown[] = []) {
    const stmt = this.db.prepare(sql);
    return stmt.run(...(params as any[]));
  }

  get<T = any>(sql: string, params: unknown[] = []): T | undefined {
    const stmt = this.db.prepare(sql);
    return stmt.get(...(params as any[])) as T | undefined;
  }

  all<T = any>(sql: string, params: unknown[] = []): T[] {
    const stmt = this.db.prepare(sql);
    return stmt.all(...(params as any[])) as T[];
  }

  isEmpty(): boolean {
    const row = this.get<{ c: number }>('SELECT COUNT(*) as c FROM users');
    return !row || row.c === 0;
  }
}
