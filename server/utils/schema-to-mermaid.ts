import { readdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

async function convertToMermaid() {
  try {
    const schemaDir = './backup/schema'
    console.log('\n=== Starting Mermaid Conversion ===')

    const files = await readdir(schemaDir)
    console.log('Found files in schema directory:', files)

    const latestSql = files
      .filter(f => f.endsWith('.sql'))
      .sort()
      .reverse()[0]

    if (!latestSql) {
      console.error('❌ No SQL-File found')
      return
    }

    console.log('📄 Processing SQL file:', latestSql)
    const sqlContent = await readFile(path.join(schemaDir, latestSql), 'utf-8')
    console.log('📝 SQL content length:', sqlContent.length, 'characters')

    const tableRegex = /CREATE TABLE (?:public\.)?["']?(\w+)["']?\s*\(([\s\S]*?)\);/g
    let mermaid = 'erDiagram\n'
    const relationships = new Set()

    let tableCount = 0
    console.log('\n🔍 Scanning for tables...')
    for (const match of sqlContent.matchAll(tableRegex)) {
      const tableName = match[1].replace(/"/g, '')
      const columns = match[2].split(',\n').map(col => col.trim())
      tableCount++
      console.log(`📊 Found table: ${tableName} with ${columns.length} columns`)

      mermaid += `    ${tableName} {\n`

      for (const col of columns) {
        if (col.startsWith('CONSTRAINT') || col.startsWith('PRIMARY KEY')) {
          console.log(`  ⏩ Skipping constraint in ${tableName}: ${col.slice(0, 50)}...`)
          continue
        }

        const [colName, ...colType] = col.split(' ')
        const cleanedType = colType.join(' ')
          .replace(/public\./g, '')
          .replace(/DEFAULT '[^']*'/g, '')
          .replace(/DEFAULT "[^"]*"/g, '')
          .replace(/DEFAULT \w+\(\)/g, '')
          .replace(/DEFAULT \w+/g, '')
          .replace(/::[^,)]+/g, '')
          .replace(/\(\)/g, '')
          .trim()

        const formattedCol = `        ${cleanedType.replace(/\s+/g, '_')} ${colName.replace(/"/g, '')}`
        mermaid += `${formattedCol}\n`
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

    const mermaidFile = latestSql.replace('.sql', '.mermaid')
    const mermaidPath = path.join(schemaDir, mermaidFile)

    console.log('\n💾 Writing Mermaid file...')
    await writeFile(mermaidPath, mermaid)
    console.log(`✅ Mermaid file created: ${mermaidPath}`)

    // Verify file was written
    const stats = await readFile(mermaidPath, 'utf-8')
    console.log(`📊 Mermaid file size: ${stats.length} characters`)
    console.log('\n=== Mermaid Conversion Complete ===\n')

    return mermaidPath
  } catch (error) {
    console.error('\n❌ Conversion to Mermaid failed:', error)
    throw error
  }
}

void (async () => {
  try {
    const filePath = await convertToMermaid()
    console.log('🎉 Process completed successfully:', filePath)
    process.exit(0)
  } catch (error) {
    console.error('💥 Process failed:', error)
    process.exit(1)
  }
})()
