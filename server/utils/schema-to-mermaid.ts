import { readdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

async function convertToMermaid() {
  try {
    const schemaDir = './backup/schema'
    const files = await readdir(schemaDir)
    const latestSql = files
      .filter(f => f.endsWith('.sql'))
      .sort()
      .reverse()[0]

    if (!latestSql) {
      console.error('No SQL-File found')
      return
    }

    const sqlContent = await readFile(path.join(schemaDir, latestSql), 'utf-8')

    const tableRegex = /CREATE TABLE ([^(]+)\s*\(([\s\S]*?)\);/g
    let mermaid = 'erDiagram\n'

    const relationships = new Set()

    for (const match of sqlContent.matchAll(tableRegex)) {
      const tableName = match[1].replace(/.*\./, '').trim().replace(/"/g, '')
      const columns = match[2].split(',\n').map(col => col.trim())

      mermaid += `    ${tableName} {\n`

      for (const col of columns) {
        if (col.startsWith('CONSTRAINT') || col.startsWith('PRIMARY KEY'))
          continue

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

    const alterTableRegex = /ALTER TABLE[^;]+ADD CONSTRAINT[^;]+FOREIGN KEY[^;]+REFERENCES[^;]+;/g
    const alterMatches = sqlContent.match(alterTableRegex) || []

    for (const alter of alterMatches) {
      const fromTable = alter.match(/ALTER TABLE[^.]+\.(\S+)/)?.[1]?.replace(/"/g, '')
      const toTable = alter.match(/REFERENCES[^.]+\.([^\s(]+)/)?.[1]?.replace(/"/g, '')

      const onDelete = alter.match(/ON DELETE (\w+)/)?.[1]?.toLowerCase() || 'no action'

      if (fromTable && toTable) {
        let relation = '||--o{'
        if (onDelete === 'cascade') {
          relation = '}o--||'
        }

        relationships.add(`    ${fromTable} ${relation} ${toTable} : "references"\n`)
      }
    }

    mermaid += `\n${Array.from(relationships).join('')}`

    const mermaidFile = latestSql.replace('.sql', '.mermaid')
    await writeFile(path.join(schemaDir, mermaidFile), mermaid)

    console.log(`Mermaid-File created: ${mermaidFile}`)
  }
  catch (error) {
    console.error('Conversion to Mermaid failed:', error)
  }
}

(async () => {
  await convertToMermaid()
})()
