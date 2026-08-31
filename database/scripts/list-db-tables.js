import pg from 'pg'
import { loadEnvFile } from '../../config/env.js'

loadEnvFile()

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL is missing')
  process.exit(1)
}

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.PGSSL === 'true' ? { rejectUnauthorized: false } : undefined,
})

try {
  const tables = await pool.query(
    `select table_name
     from information_schema.tables
     where table_schema = 'public'
       and table_type = 'BASE TABLE'
     order by table_name`,
  )

  console.log(`Tables created: ${tables.rows.length}`)
  console.log('')

  for (const { table_name: tableName } of tables.rows) {
    const count = await pool.query(`select count(*)::int as count from ${pg.escapeIdentifier(tableName)}`)
    console.log(`${tableName}: ${count.rows[0].count} rows`)
  }
} catch (error) {
  console.error({
    connected: false,
    code: error.code,
    message: error.message,
    detail: error.detail,
    hint: error.hint,
  })
  process.exitCode = 1
} finally {
  await pool.end().catch(() => undefined)
}
