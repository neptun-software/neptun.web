import { exec } from 'node:child_process'
import { mkdir } from 'node:fs/promises'
import path from 'node:path'

// https://www.postgresql.org/docs/current/app-pgdump.html
// https://www.postgresql.org/docs/current/app-pg-dumpall.html
const timestamp = new Date().toISOString().replace(/[:.]/g, '-')

async function backupDatabase() {
  try {
    console.log('\n=== Starting Database Backup ===')

    const isSchemaOnly = process.argv.includes('--schema-only')
    const backupDir = isSchemaOnly ? './backup/schema' : './backup/data'
    console.log(`🎯 Backup Type: ${isSchemaOnly ? 'Schema Only' : 'Full Data'}`)
    console.log(`📁 Backup Directory: ${backupDir}`)

    await mkdir(backupDir, { recursive: true })
    console.log('✅ Backup directory created/verified')

    const connectionString = process.env.PRODUCTION_DATABASE_CONNECTION_STRING || 'postgresql://postgres:postgres@localhost:5432/postgres'
    console.log('🔌 Using database connection...')

    const url = new URL(connectionString)
    const [username, password] = url.username.includes(':')
      ? url.username.split(':')
      : [url.username, url.password]
    const database = url.pathname.slice(1)
    const port = url.port || '5432'

    console.log(`📊 Database Details:
    • Host: ${url.hostname}
    • Port: ${port}
    • Database: ${database}
    • Username: ${username}
    • Password: ${password ? '********' : 'not set'}`)

    const filepath = path.join(backupDir, `${timestamp}.sql`)
    const schemaOnlyFlag = isSchemaOnly ? '--schema-only' : ''

    console.log('\n🚀 Preparing pg_dump command...')
    const command = `pg_dump -h ${url.hostname} -p ${port} -U ${username} -d ${database} ${schemaOnlyFlag} -F p > ${filepath}`
    console.log('📝 Command:', command.replace(password || '', '********'))

    console.log('\n⏳ Executing backup...')
    exec(command, { env: { PGPASSWORD: password } }, (error) => {
      if (error) {
        console.error('\n❌ Backup failed!')
        console.error('Error details:', error)
        return
      }
      console.log(`\n✅ ${isSchemaOnly ? 'Schema' : 'Data'}-Backup successful!`)
      console.log(`📄 Backup file created: ${filepath}`)
      console.log('\n=== Backup Process Complete ===\n')
    })
  } catch (error) {
    console.error('\n💥 Backup process failed with error:')
    console.error(error)
    throw error
  }
}

void (async () => {
  try {
    await backupDatabase()
    console.log('🎉 Backup process initiated successfully')
    process.exit(0)
  } catch (error) {
    console.error('💥 Backup process failed:', error)
    process.exit(1)
  }
})()
