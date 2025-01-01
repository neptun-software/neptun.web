import { exec } from 'node:child_process'
import { copyFile, mkdir } from 'node:fs/promises'
import path from 'node:path'

// https://www.postgresql.org/docs/current/app-pgdump.html
// https://www.postgresql.org/docs/current/app-pg-dumpall.html
const timestamp = new Date().toISOString().replace(/[:.]/g, '-')

async function backupDatabase() {
  try {
    console.log('\n=== Starting Database Backup ===')
    console.log('📁 Working directory:', process.cwd())

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

    console.log('\n⚙️  Database Configuration:')
    console.log(`  • Host: ${url.hostname}`)
    console.log(`  • Port: ${port}`)
    console.log(`  • Database: ${database}`)
    console.log(`  • Username: ${username}`)
    console.log(`  • Password: ${password ? '********' : 'not set'}`)

    const filepath = path.join(backupDir, `${timestamp}.sql`)
    const schemaFilepath = path.join(backupDir, 'schema.sql')
    const schemaOnlyFlag = isSchemaOnly ? '--schema-only' : ''

    console.log('\n📋 Preparing backup files:')
    console.log(`  • Timestamp file: ${path.relative('.', filepath)}`)
    console.log(`  • Schema file: ${path.relative('.', schemaFilepath)}`)

    console.log('\n🚀 Preparing pg_dump command...')
    const command = `pg_dump -h ${url.hostname} -p ${port} -U ${username} -d ${database} ${schemaOnlyFlag} -F p > "${filepath}"`
    console.log('📝 Command:', command.replace(password || '', '********'))

    console.log('\n⏳ Executing backup...')

    // Wrap exec in a Promise
    await new Promise((resolve, reject) => {
      exec(command, { env: { PGPASSWORD: password } }, (error, stdout, stderr) => {
        if (error) {
          console.error('\n❌ Backup failed!')
          console.error('Error details:', error)
          reject(error)
          return
        }
        if (stderr) {
          console.warn('⚠️  Warnings:', stderr)
        }
        if (stdout) {
          console.log('📝 Output:', stdout)
        }

        console.log(`\n✅ ${isSchemaOnly ? 'Schema' : 'Data'}-Backup successful!`)
        console.log('📄 Backup files created:')
        console.log(`  • Timestamp file: ${path.relative('.', filepath)}`)

        void copyFile(filepath, schemaFilepath)
          .then(() => {
            console.log(`  • Schema file: ${path.relative('.', schemaFilepath)}`)
            console.log('\n=== Backup Process Complete ===\n')
            resolve(true)
          })
          .catch((copyError) => {
            console.error('❌ Failed to copy file:', copyError)
            reject(copyError)
          })
      })
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
    console.log('🎉 Process completed successfully')
    process.exit(0)
  } catch (error) {
    console.error('💥 Backup process failed:', error)
    process.exit(1)
  }
})()
