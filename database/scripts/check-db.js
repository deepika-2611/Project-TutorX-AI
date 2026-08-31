import pg from 'pg'
import { loadEnvFile } from '../../config/env.js'

loadEnvFile()

if (!process.env.DATABASE_URL) {
  console.log({ connected: false, reason: 'DATABASE_URL missing' })
  process.exit(1)
}

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.PGSSL === 'true' ? { rejectUnauthorized: false } : undefined,
})

try {
  const result = await pool.query(
    'select current_database() as db, current_user as usr, version() as version',
  )
  console.log({
    connected: true,
    database: result.rows[0].db,
    user: result.rows[0].usr,
    version: result.rows[0].version.split(' ').slice(0, 2).join(' '),
  })
} catch (error) {
  console.log({
    connected: false,
    name: error.name,
    code: error.code,
    errno: error.errno,
    message: error.message,
    detail: error.detail,
    hint: error.hint,
  })
  process.exitCode = 1
} finally {
  await pool.end().catch(() => undefined)
}
