import fs from 'fs';
import path from 'path';

// Simple JSON-based database for development
// In production, you can switch to a real database

interface Session {
    id: string;
    created_at: number;
    last_active: number;
    user_agent?: string;
    ip_hash?: string;
}

interface Meme {
    id: string;
    session_id?: string;
    parent_id?: string;
    template_id: string;
    caption: string;
    alt_text?: string;
    image_url: string;
    language: string;
    tone: string;
    created_at: number;
    generation_time_ms?: number;
}

interface Evolution {
    id: number;
    parent_meme_id: string;
    child_meme_id: string;
    mutation_type?: string;
    feedback?: string;
    created_at: number;
}

interface Analytics {
    id: number;
    event_type: string;
    meme_id?: string;
    session_id?: string;
    metadata?: string;
    created_at: number;
}

interface Database {
    sessions: Session[];
    memes: Meme[];
    evolutions: Evolution[];
    analytics: Analytics[];
}

let db: Database | null = null;
const dbPath = path.join(process.cwd(), 'data', 'evomeme.json');

/**
 * Initialize the database
 */
export async function initDatabase(): Promise<Database> {
    if (db) return db;

    const dbDir = path.dirname(dbPath);

    // Ensure data directory exists
    if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
    }

    // Load existing database or create new one
    if (fs.existsSync(dbPath)) {
        const data = fs.readFileSync(dbPath, 'utf-8');
        db = JSON.parse(data);
    } else {
        db = {
            sessions: [],
            memes: [],
            evolutions: [],
            analytics: [],
        };
        saveDatabase();
    }

    return db as Database;
}

/**
 * Save database to disk
 */
export function saveDatabase(): void {
    if (!db) return;
    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
}

/**
 * Get database instance
 */
export async function getDatabase(): Promise<Database> {
    if (!db) {
        await initDatabase();
    }
    return db!;
}

/**
 * Execute a query and return results
 */
export async function query<T = any>(
    sql: string,
    params: any[] = []
): Promise<T[]> {
    const database = await getDatabase();

    // Simple SQL parsing for basic queries
    const lowerSql = sql.toLowerCase().trim();

    if (lowerSql.startsWith('select')) {
        // Parse SELECT queries
        if (lowerSql.includes('from memes')) {
            let results = [...database.memes] as any[];

            // Handle WHERE clause
            if (lowerSql.includes('where id =')) {
                const id = params[0];
                results = results.filter((m) => m.id === id);
            } else if (lowerSql.includes('where parent_id =')) {
                const parentId = params[0];
                results = results.filter((m) => m.parent_id === parentId);
            }

            return results as T[];
        }

        if (lowerSql.includes('from analytics')) {
            return [...database.analytics] as T[];
        }

        if (lowerSql.includes('from sessions')) {
            return [...database.sessions] as T[];
        }

        if (lowerSql.includes('from evolutions')) {
            return [...database.evolutions] as T[];
        }
    }

    return [];
}

/**
 * Execute a query without returning results
 */
export async function exec(sql: string, params: any[] = []): Promise<void> {
    const database = await getDatabase();
    const lowerSql = sql.toLowerCase().trim();

    if (lowerSql.startsWith('insert into memes')) {
        const meme: Meme = {
            id: params[0],
            session_id: params[1],
            parent_id: params[2],
            template_id: params[3],
            caption: params[4],
            image_url: params[5],
            language: params[6] || 'en',
            tone: params[7] || 'funny',
            created_at: params[8],
            generation_time_ms: params[9],
        };
        database.memes.push(meme);
        saveDatabase();
    } else if (lowerSql.startsWith('insert into evolutions')) {
        const evolution: Evolution = {
            id: database.evolutions.length + 1,
            parent_meme_id: params[0],
            child_meme_id: params[1],
            mutation_type: params[2],
            feedback: params[3],
            created_at: params[4],
        };
        database.evolutions.push(evolution);
        saveDatabase();
    } else if (lowerSql.startsWith('insert into analytics')) {
        const analytic: Analytics = {
            id: database.analytics.length + 1,
            event_type: params[0],
            meme_id: params[1],
            session_id: params[2],
            metadata: params[3],
            created_at: params[4],
        };
        database.analytics.push(analytic);
        saveDatabase();
    } else if (lowerSql.startsWith('insert into sessions')) {
        const session: Session = {
            id: params[0],
            created_at: params[1],
            last_active: params[2],
            user_agent: params[3],
            ip_hash: params[4],
        };
        database.sessions.push(session);
        saveDatabase();
    }
}

/**
 * Insert and return the last inserted ID
 */
export async function insert(sql: string, params: any[] = []): Promise<number> {
    await exec(sql, params);
    const database = await getDatabase();

    if (sql.toLowerCase().includes('evolutions')) {
        return database.evolutions.length;
    }
    if (sql.toLowerCase().includes('analytics')) {
        return database.analytics.length;
    }

    return 0;
}

/**
 * Close database connection
 */
export function closeDatabase(): void {
    if (db) {
        saveDatabase();
        db = null;
    }
}

// Auto-save database every 30 seconds
if (typeof window === 'undefined') {
    setInterval(() => {
        if (db) saveDatabase();
    }, 30000);
}

// Save on process exit
if (typeof process !== 'undefined') {
    process.on('exit', closeDatabase);
    process.on('SIGINT', () => {
        closeDatabase();
        process.exit(0);
    });
}
