import { exec } from 'node:child_process'
import { mkdir } from 'node:fs/promises'
import path from 'node:path'

// https://www.postgresql.org/docs/current/app-pgdump.html
// https://www.postgresql.org/docs/current/app-pg-dumpall.html
const timestamp = new Date().toISOString().replace(/[:.]/g, '-')

async function backupDatabase() {
  try {
    const isSchemaOnly = process.argv.includes('--schema-only')
    const backupDir = isSchemaOnly ? './backup/schema' : './backup/data'

    await mkdir(backupDir, { recursive: true })

    const connectionString = process.env.PRODUCTION_DATABASE_CONNECTION_STRING || 'postgresql://postgres:postgres@localhost:5432/postgres'

    const url = new URL(connectionString)
    const [username, password] = url.username.includes(':')
      ? url.username.split(':')
      : [url.username, url.password]
    const database = url.pathname.slice(1)
    const port = url.port || '5432'

    const filepath = path.join(backupDir, `${timestamp}.sql`)
    const schemaOnlyFlag = isSchemaOnly ? '--schema-only' : ''
    const command = `pg_dump -h ${url.hostname} -p ${port} -U ${username} -d ${database} ${schemaOnlyFlag} -F p > ${filepath}`

    exec(command, { env: { PGPASSWORD: password } }, (error) => {
      if (error) {
        console.error(`${isSchemaOnly ? 'Schema' : 'Data'}-Backup failed:`, error)
        return
      }
      console.log(`${isSchemaOnly ? 'Schema' : 'Data'}-Backup was successful: ${filepath}`)
    })
  } catch (error) {
    console.error('Backup-Process failed:', error)
  }
}

void (async () => {
  try {
    await backupDatabase()
    process.exit(0)
  } catch (error) {
    console.error('Backup process failed:', error)
    process.exit(1)
  }
})()
