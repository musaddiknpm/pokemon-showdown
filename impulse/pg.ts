import { Pool, type PoolClient, type PoolConfig, type QueryResult, type QueryResultRow } from 'pg';

export interface PGOptions extends PoolConfig {}

export type PrimitiveValue = string | number | boolean | null;

export type WhereOperator = {
	eq?: PrimitiveValue,
	neq?: PrimitiveValue,
	gt?: number | string,
	gte?: number | string,
	lt?: number | string,
	lte?: number | string,
	like?: string,
	ilike?: string,
	in?: PrimitiveValue[],
	notIn?: PrimitiveValue[],
	isNull?: boolean,
};

export type WhereValue = PrimitiveValue | PrimitiveValue[] | WhereOperator;
export type WhereClause = Record<string, WhereValue>;
export type QueryParams = PrimitiveValue[];

export interface BaseOptions {
	trx?: PoolClient;
}

export interface SelectOptions extends BaseOptions {
	limit?: number;
	offset?: number;
	orderBy?: string;
	order?: 'ASC' | 'DESC';
	include?: string[];
}

export interface PaginateOptions extends SelectOptions {
	page?: number;
}

export interface PaginateResult<T> {
	data: T[];
	total: number;
	page: number;
	totalPages: number;
}

export type RelationType = 'hasMany' | 'belongsTo' | 'hasOne';

export interface Relation {
	type: RelationType;
	table: string;
	foreignKey: string;
	targetKey: string;
}

export class PGTable<T extends Record<string, any>> {
	readonly db: PGDatabaseManager;
	readonly name: string;
	readonly primaryKey: string;
	protected relations: Record<string, Relation> = {};

	private get quoted(): string {
		return `"${this.name}"`;
	}

	constructor(db: PGDatabaseManager, name: string, primaryKey = 'id') {
		this.db = db;
		this.name = name;
		this.primaryKey = primaryKey;
	}

	protected hasMany(name: string, options: { table: string, foreignKey: string, localKey?: string }) {
		this.relations[name] = { type: 'hasMany', table: options.table, foreignKey: options.foreignKey, targetKey: options.localKey || this.primaryKey };
	}

	protected hasOne(name: string, options: { table: string, foreignKey: string, localKey?: string }) {
		this.relations[name] = { type: 'hasOne', table: options.table, foreignKey: options.foreignKey, targetKey: options.localKey || this.primaryKey };
	}

	protected belongsTo(name: string, options: { table: string, foreignKey: string, targetKey?: string }) {
		this.relations[name] = { type: 'belongsTo', table: options.table, foreignKey: options.foreignKey, targetKey: options.targetKey || 'id' };
	}

	protected async beforeInsert(data: Partial<T>): Promise<Partial<T>> { return data; }
	protected async afterInsert(data: T): Promise<T> { return data; }
	protected async beforeUpdate(data: Partial<T>, where: WhereClause): Promise<Partial<T>> { return data; }
	protected async afterUpdate(where: WhereClause): Promise<void> {}
	protected async beforeDelete(where: WhereClause): Promise<void> {}
	protected async afterDelete(where: WhereClause): Promise<void> {}
	protected async afterSelect(data: T[]): Promise<T[]> { return data; }

	protected buildWhere(
		where: WhereClause,
		startIndex = 1
	): { clause: string, values: QueryParams, nextIndex: number } {
		const keys = Object.keys(where);
		if (keys.length === 0) return { clause: '', values: [], nextIndex: startIndex };

		const clauses: string[] = [];
		const values: QueryParams = [];
		let idx = startIndex;

		for (const key of keys) {
			const value = where[key];
			if (value === null) {
				clauses.push(`"${key}" IS NULL`);
			} else if (Array.isArray(value)) {
				if (value.length === 0) {
					clauses.push('FALSE');
				} else {
					const placeholders = value.map(() => `$${idx++}`).join(', ');
					clauses.push(`"${key}" IN (${placeholders})`);
					values.push(...value);
				}
			} else if (typeof value === 'object') {
				const opKeys = Object.keys(value) as (keyof WhereOperator)[];
				for (const op of opKeys) {
					const opVal = (value)[op];
					if (opVal === undefined) continue;

					switch (op) {
					case 'eq': clauses.push(`"${key}" = $${idx++}`); values.push(opVal as PrimitiveValue); break;
					case 'neq': clauses.push(`"${key}" != $${idx++}`); values.push(opVal as PrimitiveValue); break;
					case 'gt': clauses.push(`"${key}" > $${idx++}`); values.push(opVal as PrimitiveValue); break;
					case 'gte': clauses.push(`"${key}" >= $${idx++}`); values.push(opVal as PrimitiveValue); break;
					case 'lt': clauses.push(`"${key}" < $${idx++}`); values.push(opVal as PrimitiveValue); break;
					case 'lte': clauses.push(`"${key}" <= $${idx++}`); values.push(opVal as PrimitiveValue); break;
					case 'like': clauses.push(`"${key}" LIKE $${idx++}`); values.push(opVal as PrimitiveValue); break;
					case 'ilike': clauses.push(`"${key}" ILIKE $${idx++}`); values.push(opVal as PrimitiveValue); break;
					case 'in':
						if (Array.isArray(opVal) && opVal.length > 0) {
							const placeholders = opVal.map(() => `$${idx++}`).join(', ');
							clauses.push(`"${key}" IN (${placeholders})`);
							values.push(...opVal);
						} else {
							clauses.push('FALSE');
						}
						break;
					case 'notIn':
						if (Array.isArray(opVal) && opVal.length > 0) {
							const placeholders = opVal.map(() => `$${idx++}`).join(', ');
							clauses.push(`"${key}" NOT IN (${placeholders})`);
							values.push(...opVal);
						} else {
							clauses.push('TRUE');
						}
						break;
					case 'isNull':
						clauses.push(`"${key}" IS ${opVal ? 'NULL' : 'NOT NULL'}`);
						break;
					}
				}
			} else {
				clauses.push(`"${key}" = $${idx++}`);
				values.push(value);
			}
		}

		return { clause: clauses.length ? `WHERE ${clauses.join(' AND ')}` : '', values, nextIndex: idx };
	}

	protected async executeQuery<R extends QueryResultRow = QueryResultRow>(
		query: string,
		params?: QueryParams,
		trx?: PoolClient
	): Promise<QueryResult<R>> {
		if (trx) {
			return trx.query<R>(query, params);
		}
		return this.db.query<R>(query, params);
	}

	protected async executeQueryRows<R extends QueryResultRow = QueryResultRow>(
		query: string,
		params?: QueryParams,
		trx?: PoolClient
	): Promise<R[]> {
		return (await this.executeQuery<R>(query, params, trx)).rows;
	}

	private async loadRelations(rows: T[], include: string[], trx?: PoolClient): Promise<T[]> {
		if (!rows.length || !include.length) return rows;

		for (const relName of include) {
			const rel = this.relations[relName];
			if (!rel) throw new Error(`Relation ${relName} not defined on table "${this.name}".`);

			const relTable = this.db.getTable<any>(rel.table);

			if (rel.type === 'belongsTo') {
				const foreignKeys = Array.from(new Set(rows.map(r => r[rel.foreignKey] as PrimitiveValue).filter(v => v !== null && v !== undefined)));
				if (!foreignKeys.length) continue;

				const relatedRows = await relTable.select({ [rel.targetKey]: { in: foreignKeys } }, [], { trx });
				const mapped = new Map<PrimitiveValue, any>();
				for (const r of relatedRows) mapped.set(r[rel.targetKey] as PrimitiveValue, r);

				for (const row of rows) {
					(row as any)[relName] = mapped.get(row[rel.foreignKey] as PrimitiveValue) || null;
				}
			} else {
				const localKeys = Array.from(new Set(rows.map(r => r[rel.targetKey] as PrimitiveValue).filter(v => v !== null && v !== undefined)));
				if (!localKeys.length) {
					for (const row of rows) (row as any)[relName] = rel.type === 'hasMany' ? [] : null;
					continue;
				}

				const relatedRows = await relTable.select({ [rel.foreignKey]: { in: localKeys } }, [], { trx });

				if (rel.type === 'hasMany') {
					const grouped = new Map<PrimitiveValue, any[]>();
					for (const r of relatedRows) {
						const fk = r[rel.foreignKey] as PrimitiveValue;
						if (!grouped.has(fk)) grouped.set(fk, []);
						grouped.get(fk)!.push(r);
					}
					for (const row of rows) {
						(row as any)[relName] = grouped.get(row[rel.targetKey] as PrimitiveValue) || [];
					}
				} else {
					const mapped = new Map<PrimitiveValue, any>();
					for (const r of relatedRows) mapped.set(r[rel.foreignKey] as PrimitiveValue, r);
					for (const row of rows) {
						(row as any)[relName] = mapped.get(row[rel.targetKey] as PrimitiveValue) || null;
					}
				}
			}
		}
		return rows;
	}

	async select(
		where: WhereClause = {},
		columns: string[] = [],
		options?: SelectOptions
	): Promise<T[]> {
		const colList = columns.length > 0 ? columns.map(c => `"${c}"`).join(', ') : '*';
		const { clause, values, nextIndex } = this.buildWhere(where);
		let query = `SELECT ${colList} FROM ${this.quoted} ${clause}`.trim();

		let idx = nextIndex;
		const params: QueryParams = [...values];

		if (options?.orderBy) {
			query += ` ORDER BY "${options.orderBy}" ${options.order ?? 'ASC'}`;
		}
		if (options?.limit !== undefined) {
			query += ` LIMIT $${idx++}`;
			params.push(options.limit);
		}
		if (options?.offset !== undefined) {
			query += ` OFFSET $${idx++}`;
			params.push(options.offset);
		}

		let rows = await this.executeQueryRows<T>(query, params, options?.trx);
		if (options?.include) {
			rows = await this.loadRelations(rows, options.include, options.trx);
		}
		return this.afterSelect(rows);
	}

	async selectOne(where: WhereClause = {}, columns: string[] = [], options?: SelectOptions): Promise<T | null> {
		const rows = await this.select(where, columns, { ...options, limit: 1 });
		return rows[0] ?? null;
	}

	async findById(id: PrimitiveValue, columns: string[] = [], options?: SelectOptions): Promise<T | null> {
		return this.selectOne({ [this.primaryKey]: id }, columns, options);
	}

	async paginate(
		where: WhereClause = {},
		options: PaginateOptions = {}
	): Promise<PaginateResult<T>> {
		const page = Math.max(1, options.page ?? 1);
		const limit = Math.max(1, options.limit ?? 10);
		const offset = (page - 1) * limit;

		const total = await this.count(where, { trx: options.trx });
		const data = await this.select(where, [], { ...options, limit, offset });
		const totalPages = Math.ceil(total / limit);

		return { data, total, page, totalPages };
	}

	async insert(data: Partial<T>, returning = '*', options?: BaseOptions): Promise<T | null> {
		data = await this.beforeInsert(data);
		const keys = Object.keys(data) as (keyof T & string)[];
		if (keys.length === 0) throw new Error(`PGTable.insert(): data object is empty for table "${this.name}".`);

		const values: QueryParams = keys.map(k => data[k] as PrimitiveValue);
		const cols = keys.map(k => `"${k}"`).join(', ');
		const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');

		const query = `INSERT INTO ${this.quoted} (${cols}) VALUES (${placeholders}) RETURNING ${returning}`;
		const res = await this.executeQuery<T>(query, values, options?.trx);
		let row = res.rows[0] ?? null;
		if (row) row = await this.afterInsert(row);
		return row;
	}

	async insertMany(dataArray: Partial<T>[], returning = '*', options?: BaseOptions): Promise<T[]> {
		if (dataArray.length === 0) return [];
		dataArray = await Promise.all(dataArray.map(d => this.beforeInsert(d)));

		const keySet = new Set<string>();
		for (const row of dataArray) for (const k of Object.keys(row)) keySet.add(k);
		const keys = Array.from(keySet) as (keyof T & string)[];

		const values: QueryParams = [];
		const placeholders: string[] = [];
		let idx = 1;

		for (const data of dataArray) {
			const group: string[] = [];
			for (const key of keys) {
				group.push(`$${idx++}`);
				const v = data[key];
				values.push(v === undefined ? null : (v as PrimitiveValue));
			}
			placeholders.push(`(${group.join(', ')})`);
		}

		const cols = keys.map(k => `"${k}"`).join(', ');
		const query = `INSERT INTO ${this.quoted} (${cols}) VALUES ${placeholders.join(', ')} RETURNING ${returning}`;
		const res = await this.executeQuery<T>(query, values, options?.trx);
		return Promise.all(res.rows.map(r => this.afterInsert(r)));
	}

	async upsert(
		data: Partial<T>,
		conflictKeys: string[] = [this.primaryKey],
		returning = '*',
		options?: BaseOptions
	): Promise<T | null> {
		data = await this.beforeInsert(data); // Treated as insert for hooks initially
		const keys = Object.keys(data) as (keyof T & string)[];
		if (keys.length === 0) throw new Error(`PGTable.upsert(): data object is empty for table "${this.name}".`);

		const values: QueryParams = keys.map(k => data[k] as PrimitiveValue);
		const cols = keys.map(k => `"${k}"`).join(', ');
		const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
		const conflictCols = conflictKeys.map(k => `"${k}"`).join(', ');

		const updateKeys = keys.filter(k => !conflictKeys.includes(k));
		const updateClauses = updateKeys.map(k => `"${k}" = EXCLUDED."${k}"`).join(', ');

		let query = `INSERT INTO ${this.quoted} (${cols}) VALUES (${placeholders}) ON CONFLICT (${conflictCols})`;
		query += updateClauses ? ` DO UPDATE SET ${updateClauses}` : ` DO NOTHING`;
		query += ` RETURNING ${returning}`;

		const res = await this.executeQuery<T>(query, values, options?.trx);
		let row = res.rows[0] ?? null;
		if (row) row = await this.afterInsert(row);
		return row;
	}

	async update(data: Partial<T>, where: WhereClause, options?: BaseOptions): Promise<number> {
		data = await this.beforeUpdate(data, where);
		const keys = Object.keys(data) as (keyof T & string)[];
		if (keys.length === 0) return 0;
		if (Object.keys(where).length === 0) {
			throw new Error(`PGTable.update(): where clause is required. Use updateAll() to update every row.`);
		}

		const setClauses: string[] = [];
		const values: QueryParams = [];
		let idx = 1;

		for (const key of keys) {
			setClauses.push(`"${key}" = $${idx++}`);
			values.push(data[key] as PrimitiveValue);
		}

		const { clause: whereClause, values: whereValues } = this.buildWhere(where, idx);
		values.push(...whereValues);

		const query = `UPDATE ${this.quoted} SET ${setClauses.join(', ')} ${whereClause}`;
		const res = await this.executeQuery(query, values, options?.trx);
		if (res.rowCount && res.rowCount > 0) {
			await this.afterUpdate(where);
		}
		return res.rowCount ?? 0;
	}

	async updateById(id: PrimitiveValue, data: Partial<T>, options?: BaseOptions): Promise<number> {
		return this.update(data, { [this.primaryKey]: id }, options);
	}

	async delete(where: WhereClause, options?: BaseOptions): Promise<number> {
		if (Object.keys(where).length === 0) {
			throw new Error(`PGTable.delete(): where clause is required. Use truncate() to clear the table.`);
		}
		await this.beforeDelete(where);
		const { clause, values } = this.buildWhere(where);
		const query = `DELETE FROM ${this.quoted} ${clause}`;
		const res = await this.executeQuery(query, values, options?.trx);
		if (res.rowCount && res.rowCount > 0) {
			await this.afterDelete(where);
		}
		return res.rowCount ?? 0;
	}

	async deleteById(id: PrimitiveValue, options?: BaseOptions): Promise<number> {
		return this.delete({ [this.primaryKey]: id }, options);
	}

	async truncate(cascade = false, options?: BaseOptions): Promise<void> {
		const query = `TRUNCATE ${this.quoted}${cascade ? ' CASCADE' : ''}`;
		await this.executeQuery(query, [], options?.trx);
	}

	async count(where: WhereClause = {}, options?: BaseOptions): Promise<number> {
		const { clause, values } = this.buildWhere(where);
		const query = `SELECT COUNT(*) AS count FROM ${this.quoted} ${clause}`.trim();
		const row = (await this.executeQuery<{ count: string }>(query, values, options?.trx)).rows[0];
		return row ? parseInt(row.count, 10) : 0;
	}

	async exists(where: WhereClause, options?: BaseOptions): Promise<boolean> {
		return (await this.count(where, options)) > 0;
	}
}

export class PGDatabaseManager {
	readonly pool: Pool;
	private readonly tables = new Map<string, PGTable<Record<string, any>>>();

	constructor(options?: PGOptions) {
		const configHost = process.env.PGHOST || (global.Config as any)?.postgres?.host || (global.Config as any)?.pghost;
		const configUser = process.env.PGUSER || (global.Config as any)?.postgres?.user || (global.Config as any)?.pguser;
		const configDatabase = process.env.PGDATABASE || (global.Config as any)?.postgres?.database || (global.Config as any)?.pgdatabase;
		const configPassword = process.env.PGPASSWORD || (global.Config as any)?.postgres?.password || (global.Config as any)?.pgpassword;
		const configPort = process.env.PGPORT ? parseInt(process.env.PGPORT, 10) : ((global.Config as any)?.postgres?.port || 5432);

		const baseConfig: PoolConfig = process.env.DATABASE_URL ?
			{ connectionString: process.env.DATABASE_URL } :
			(global.Config as any)?.postgres?.connectionString ?
			{ connectionString: (global.Config as any).postgres.connectionString } :
			{
				host: configHost ?? '/var/run/postgresql',
				port: configPort,
				user: configUser ?? 'ubuntu',
				database: configDatabase ?? 'impulse-server',
				password: configPassword ?? undefined,
			};

		this.pool = new Pool({
			max: 20,
			idleTimeoutMillis: 30_000,
			connectionTimeoutMillis: 2_000,
			...baseConfig,
			...options,
		});

		this.pool.on('error', (err: Error) => {
			console.error('[PGDatabaseManager] Unexpected error on idle client:', err.message);
		});
	}

	async checkConnection(): Promise<boolean> {
		await this.pool.query('SELECT 1');
		return true;
	}

	async safeInit(moduleName: string, initQuery: string): Promise<boolean> {
		let attempts = 0;
		while (attempts < 2) {
			try {
				await this.checkConnection();
				break;
			} catch (err) {
				attempts++;
				if (attempts >= 2) {
					const msg = `[${moduleName}] PostgreSQL database connection unavailable (${(err as Error).message}).`;
					(global as any).Monitor ? (global as any).Monitor.warn(msg) : console.warn(msg);
					return false;
				}
				await new Promise(resolve => setTimeout(resolve, 1000));
			}
		}
		if (!initQuery) return true;
		try {
			await this.query(initQuery);
			return true;
		} catch (err) {
			const msg = `[${moduleName}] Failed to initialize PostgreSQL tables: ${(err as Error).message}`;
			(global as any).Monitor ? (global as any).Monitor.warn(msg) : console.warn(msg);
			return false;
		}
	}

	getTable<T extends Record<string, any>>(name: string, primaryKey = 'id'): PGTable<T> {
		if (!this.tables.has(name)) {
			this.tables.set(name, new PGTable<T>(this, name, primaryKey));
		}
		return this.tables.get(name) as PGTable<T>;
	}

	async query<R extends QueryResultRow = QueryResultRow>(
		text: string,
		params?: QueryParams
	): Promise<QueryResult<R>> {
		return await this.pool.query<R>(text, params);
	}

	async queryRows<R extends QueryResultRow = QueryResultRow>(text: string, params?: QueryParams): Promise<R[]> {
		return (await this.query<R>(text, params)).rows;
	}

	async queryOne<R extends QueryResultRow = QueryResultRow>(text: string, params?: QueryParams): Promise<R | null> {
		return (await this.query<R>(text, params)).rows[0] ?? null;
	}

	async execute(text: string, params?: QueryParams): Promise<QueryResult> {
		return this.query(text, params);
	}

	async transaction<TResult>(callback: (client: PoolClient) => Promise<TResult>): Promise<TResult> {
		const client = await this.pool.connect();
		try {
			await client.query('BEGIN');
			const result = await callback(client);
			await client.query('COMMIT');
			return result;
		} catch (err) {
			await client.query('ROLLBACK');
			throw err;
		} finally {
			client.release();
		}
	}

	async destroy(): Promise<void> {
		await this.pool.end();
	}
}

export const PG = new PGDatabaseManager();
