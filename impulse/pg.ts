import { Pool, PoolClient, PoolConfig, QueryResult, QueryResultRow } from 'pg';

export interface PGOptions extends PoolConfig {}

type PrimitiveValue = string | number | boolean | null;
type WhereValue = PrimitiveValue | PrimitiveValue[];
type WhereClause = Record<string, WhereValue>;
type QueryParams = PrimitiveValue[];

export interface SelectOptions {
	limit?: number;
	offset?: number;
	orderBy?: string;
	order?: 'ASC' | 'DESC';
}

export class PGTable<T extends Record<string, PrimitiveValue>> {
	public readonly db: PGDatabaseManager;
	public readonly name: string;
	public readonly primaryKey: string;

	private get quoted(): string {
		return `"${this.name}"`;
	}

	constructor(db: PGDatabaseManager, name: string, primaryKey: string = 'id') {
		this.db = db;
		this.name = name;
		this.primaryKey = primaryKey;
	}

	protected buildWhere(
		where: WhereClause,
		startIndex: number = 1
	): { clause: string; values: QueryParams; nextIndex: number } {
		const keys = Object.keys(where);
		if (keys.length === 0) return { clause: '', values: [], nextIndex: startIndex };

		const clauses: string[] = [];
		const values: QueryParams = [];
		let idx = startIndex;

		for (const key of keys) {
			const value = where[key];
			if (Array.isArray(value)) {
				if (value.length === 0) {
					clauses.push('FALSE');
				} else {
					const placeholders = value.map(() => `$${idx++}`).join(', ');
					clauses.push(`"${key}" IN (${placeholders})`);
					values.push(...value);
				}
			} else if (value === null) {
				clauses.push(`"${key}" IS NULL`);
			} else {
				clauses.push(`"${key}" = $${idx++}`);
				values.push(value);
			}
		}

		return { clause: `WHERE ${clauses.join(' AND ')}`, values, nextIndex: idx };
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

		return this.db.queryRows<T>(query, params);
	}

	async selectOne(where: WhereClause = {}, columns: string[] = []): Promise<T | null> {
		const rows = await this.select(where, columns, { limit: 1 });
		return rows[0] ?? null;
	}

	async findById(id: PrimitiveValue, columns: string[] = []): Promise<T | null> {
		return this.selectOne({ [this.primaryKey]: id }, columns);
	}

	async insert(data: Partial<T>, returning: string = '*'): Promise<T | null> {
		const keys = Object.keys(data) as (keyof T & string)[];
		if (keys.length === 0) throw new Error(`PGTable.insert(): data object is empty for table "${this.name}".`);

		const values: QueryParams = keys.map(k => data[k] as PrimitiveValue);
		const cols = keys.map(k => `"${k}"`).join(', ');
		const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');

		const query = `INSERT INTO ${this.quoted} (${cols}) VALUES (${placeholders}) RETURNING ${returning}`;
		const res = await this.db.query<T>(query, values);
		return res.rows[0] ?? null;
	}

	async insertMany(dataArray: Partial<T>[], returning: string = '*'): Promise<T[]> {
		if (dataArray.length === 0) return [];

		const keySet = new Set<string>();
		for (const row of dataArray) Object.keys(row).forEach(k => keySet.add(k));
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
		const res = await this.db.query<T>(query, values);
		return res.rows;
	}

	async upsert(
		data: Partial<T>,
		conflictKeys: string[] = [this.primaryKey],
		returning: string = '*'
	): Promise<T | null> {
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

		const res = await this.db.query<T>(query, values);
		return res.rows[0] ?? null;
	}

	async update(data: Partial<T>, where: WhereClause): Promise<number> {
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
		const res = await this.db.execute(query, values);
		return res.rowCount ?? 0;
	}

	async updateById(id: PrimitiveValue, data: Partial<T>): Promise<number> {
		return this.update(data, { [this.primaryKey]: id });
	}

	async delete(where: WhereClause): Promise<number> {
		if (Object.keys(where).length === 0) {
			throw new Error(`PGTable.delete(): where clause is required. Use truncate() to clear the table.`);
		}
		const { clause, values } = this.buildWhere(where);
		const query = `DELETE FROM ${this.quoted} ${clause}`;
		const res = await this.db.execute(query, values);
		return res.rowCount ?? 0;
	}

	async deleteById(id: PrimitiveValue): Promise<number> {
		return this.delete({ [this.primaryKey]: id });
	}

	async truncate(cascade: boolean = false): Promise<void> {
		const query = `TRUNCATE ${this.quoted}${cascade ? ' CASCADE' : ''}`;
		await this.db.execute(query);
	}

	async count(where: WhereClause = {}): Promise<number> {
		const { clause, values } = this.buildWhere(where);
		const query = `SELECT COUNT(*) AS count FROM ${this.quoted} ${clause}`.trim();
		const row = await this.db.queryOne<{ count: string }>(query, values);
		return row ? parseInt(row.count, 10) : 0;
	}

	async exists(where: WhereClause): Promise<boolean> {
		return (await this.count(where)) > 0;
	}
}

export class PGDatabaseManager {
	public readonly pool: Pool;
	public isReady: boolean = false;
	private readonly tables = new Map<string, PGTable<Record<string, PrimitiveValue>>>();
	private healthCheckTimer?: ReturnType<typeof setInterval>;

	constructor(options?: PGOptions) {
		const baseConfig: PoolConfig = process.env.DATABASE_URL
			? { connectionString: process.env.DATABASE_URL }
			: {
				host: process.env.PGHOST ?? '/var/run/postgresql',
				port: process.env.PGPORT ? parseInt(process.env.PGPORT, 10) : 5432,
				user: process.env.PGUSER ?? process.env.USER,
				database: process.env.PGDATABASE ?? 'postgres',
				password: process.env.PGPASSWORD,
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
			this.isReady = false;
		});

		void this.checkConnection();
		this.healthCheckTimer = setInterval(() => {
			if (!this.isReady) void this.checkConnection();
		}, 30_000);
		this.healthCheckTimer.unref();
	}

	async checkConnection(): Promise<boolean> {
		try {
			await this.pool.query('SELECT 1');
			if (!this.isReady) console.info('[PGDatabaseManager] PostgreSQL connection restored.');
			this.isReady = true;
			return true;
		} catch {
			if (this.isReady) console.warn('[PGDatabaseManager] PostgreSQL connection lost. Queries will be no-ops until reconnected.');
			this.isReady = false;
			return false;
		}
	}

	private emptyResult<R extends QueryResultRow>(): QueryResult<R> {
		return { rows: [], rowCount: 0, command: '', oid: 0, fields: [] } as unknown as QueryResult<R>;
	}

	getTable<T extends Record<string, PrimitiveValue>>(name: string, primaryKey: string = 'id'): PGTable<T> {
		if (!this.tables.has(name)) {
			this.tables.set(name, new PGTable<T>(this, name, primaryKey));
		}
		return this.tables.get(name) as PGTable<T>;
	}

	// Silent-fail: returns empty results instead of throwing when PostgreSQL is unreachable.
	// Keeps the server alive during startup, restarts, and hotpatches — queries resume automatically once isReady flips back.
	// Only connection errors are swallowed; real query errors (bad SQL, constraint violations) still throw.
	async query<R extends QueryResultRow = QueryResultRow>(
		text: string,
		params?: QueryParams
	): Promise<QueryResult<R>> {
		if (!this.isReady) return this.emptyResult<R>();
		try {
			return await this.pool.query<R>(text, params);
		} catch (err) {
			if (err instanceof Error && (err.message.includes('ECONNREFUSED') || err.message.includes('connect'))) {
				this.isReady = false;
				return this.emptyResult<R>();
			}
			throw err;
		}
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

	async transaction<TResult>(callback: (client: PoolClient) => Promise<TResult>): Promise<TResult | undefined> {
		if (!this.isReady) return undefined;
		let client: PoolClient;
		try {
			client = await this.pool.connect();
		} catch (err) {
			if (err instanceof Error && (err.message.includes('ECONNREFUSED') || err.message.includes('connect'))) {
				this.isReady = false;
				return undefined;
			}
			throw err;
		}
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
		if (this.healthCheckTimer) clearInterval(this.healthCheckTimer);
		await this.pool.end();
		this.isReady = false;
	}
}

export const PG = new PGDatabaseManager();
