import { readdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

async function convertToMermaid() {
  const schemaDir = './backup/schema'
  console.log('\n=== Starting Mermaid Conversion ===')
  console.log('📁 Working directory:', schemaDir)

  const files = await readdir(schemaDir)
  console.log('📋 Found files in directory:', files)

  const sqlFiles = files
    .filter(f => f.endsWith('.sql') && f !== 'schema.sql')
    .sort((a, b) => {
      const timestampA = a.split('.')[0]
      const timestampB = b.split('.')[0]
      return timestampB.localeCompare(timestampA)
    })

  const latestSql = sqlFiles[0]

  if (!latestSql) {
    console.error('❌ No SQL-File found')
    process.exit(1)
  }

  console.log('\n📄 Processing SQL file:', latestSql)
  const sqlContent = await readFile(path.join(schemaDir, latestSql), 'utf-8')
  console.log('📝 SQL content length:', sqlContent.length, 'characters')

  console.log('\n⚙️  Conversion Configuration:')
  console.log('  • Input: SQL Schema')
  console.log('  • Output: Mermaid ER Diagram')
  console.log('  • Format: Entity Relationship')

  const tableRegex = /CREATE TABLE (?:public\.)?["']?(\w+)["']?\s*\(([\s\S]*?)\);/g
  let mermaid = 'erDiagram\n'
  const relationships = new Set()

  let tableCount = 0
  console.log('\n🔍 Scanning for tables...')
  for (const match of sqlContent.matchAll(tableRegex)) {
    const tableName = match[1].replace(/"/g, '')
    const columns = match[2]
      .split('\n')
      .map(line => line.trim())
      .filter(line => line && !line.startsWith('CONSTRAINT') && !line.startsWith('PRIMARY KEY'))
      .map(line => line.replace(/,$/, ''))
    tableCount++
    console.log(`📊 Found table: ${tableName} with ${columns.length} columns`)

    mermaid += `    ${tableName} {\n`

    for (const col of columns) {
      const [colName, ...colTypeParts] = col.split(/\s+/)
      const cleanedType = colTypeParts.join(' ')
        .replace(/public\./g, '')
        .replace(/DEFAULT '[^']*'/g, '')
        .replace(/DEFAULT "[^"]*"/g, '')
        .replace(/DEFAULT \w+\(\)/g, '')
        .replace(/DEFAULT \w+/g, '')
        .replace(/::[^,)]+/g, '')
        .replace(/\(\)/g, '')
        .replace(/NOT NULL/g, 'NOT_NULL')
        .trim()

      const formattedName = colName.replace(/"/g, '').trim()
      const formattedType = cleanedType
        .split(/[\s,]+/)
        .filter(Boolean)
        .map(part => part.trim())
        .filter(part => part !== '')
        .join('_')
      mermaid += `        ${formattedName} ${formattedType}\n`
    }
    mermaid += '    }\n'
  }

  console.log(`\n✅ Found ${tableCount} tables`)

  console.log('\n🔍 Scanning for relationships...')
  const alterTableRegex = /ALTER TABLE ONLY public\.(\w+)\s+ADD CONSTRAINT [^)]+ FOREIGN KEY[^)]+\) REFERENCES public\.(\w+)\([^)]+\)(?: ON DELETE (\w+))?/g
  const alterMatches = sqlContent.matchAll(alterTableRegex)

  let relationCount = 0
  for (const match of alterMatches) {
    const fromTable = match[1]
    const toTable = match[2]
    const onDelete = (match[3] || '').toLowerCase()
    relationCount++

    if (fromTable && toTable) {
      let relation = '||--o{'
      if (onDelete === 'cascade') {
        relation = '}o--||'
      }
      console.log(`🔗 Found relationship: ${fromTable} ${relation} ${toTable} (ON DELETE ${onDelete || 'no action'})`)
      relationships.add(`    ${fromTable} ${relation} ${toTable} : "references"\n`)
    }
  }

  console.log(`\n✅ Found ${relationCount} relationships`)

  mermaid += `\n${Array.from(relationships).join('')}`

  const timestamp = latestSql.split('.')[0]
  console.log('\n📁 Creating output files:')
  console.log(`   • Source SQL: ${latestSql}`)
  console.log(`   • Timestamp: ${timestamp}`)

  const timestampMermaidFile = `${timestamp}.mermaid`
  const timestampMermaidPath = path.join(schemaDir, timestampMermaidFile)
  const schemaMermaidPath = path.join(schemaDir, 'schema.mermaid')

  console.log('\n💾 Writing Mermaid files...')
  await writeFile(timestampMermaidPath, mermaid)
  await writeFile(schemaMermaidPath, mermaid)
  console.log('✅ Mermaid files created:')
  console.log(`   • Timestamp file: ${path.relative('.', timestampMermaidPath)}`)
  console.log(`   • Schema file: ${path.relative('.', schemaMermaidPath)}`)
  console.log('\n=== Mermaid Conversion Complete ===\n')

  return {
    timestampMermaidPath: path.relative('.', timestampMermaidPath),
    schemaMermaidPath: path.relative('.', schemaMermaidPath),
  }
}

void (async () => {
  try {
    const result = await convertToMermaid()
    console.log('🎉 Process completed successfully:')
    console.log(`   • Timestamp file: ${result.timestampMermaidPath}`)
    console.log(`   • Schema file: ${result.schemaMermaidPath}`)
    process.exit(0)
  } catch (error) {
    console.error('💥 Process failed:', error)
    process.exit(1)
  }
})()
