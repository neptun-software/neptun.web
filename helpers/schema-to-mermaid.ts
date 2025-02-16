import { readdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

async function convertToMermaid(): Promise<{ timestampMermaidPath: string, schemaMermaidPath: string }> {
  const schemaDir = './backup/schema'
  console.log('\n=== Starting Mermaid Conversion ===')
  console.log('📁 Working directory:', schemaDir)

  const files = await readdir(schemaDir)
  console.log('📋 Found files in directory:', files)

  const sqlFiles = files
    .filter((f: string) => f.endsWith('.sql') && f !== 'schema.sql')
    .sort((a: string, b: string) => {
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
  const sqlPath = path.join(schemaDir, latestSql)
  const sqlContent = await readFile(sqlPath, 'utf-8')
  console.log('📝 SQL content length:', sqlContent.length, 'characters')

  console.log('\n⚙️  Conversion Configuration:')
  console.log('  • Input: SQL Schema')
  console.log('  • Output: Mermaid ER Diagram')
  console.log('  • Format: Entity Relationship')

  const tableRegex = /CREATE TABLE (?:public\.)?["']?(\w+)["']?\s*\(([\s\S]*?)\);/g
  let mermaid = 'erDiagram\n\n'

  let tableCount = 0
  console.log('\n🔍 Scanning for tables...')
  const tables = new Set<string>()

  // first pass: collect all table names
  for (const match of sqlContent.matchAll(tableRegex)) {
    const tableName = match[1].replace(/"/g, '')
    tables.add(tableName)
  }

  // second pass: add table definitions
  for (const match of sqlContent.matchAll(tableRegex)) {
    const tableName = match[1].replace(/"/g, '')
    const columns = match[2]
      .split('\n')
      .map((line: string) => line.trim())
      .filter((line: string) => line && !line.startsWith('CONSTRAINT') && !line.startsWith('PRIMARY KEY'))
      .map((line: string) => line.replace(/,$/, ''))
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
        .map((part: string) => part.trim())
        .filter((part: string) => part !== '')
        .join('_')
      mermaid += `        ${formattedName} ${formattedType}\n`
    }
    mermaid += '    }\n'
  }

  console.log(`\n✅ Found ${tableCount} tables`)

  console.log('\n🔍 Scanning for relationships...')

  // add relationships from SQL schema
  console.log('\n🔍 Scanning SQL schema for relationships...')

  // collect all relationships to avoid duplicates and analyze table connections
  const relationMap = new Map<string, Set<string>>()
  const tableConnections = new Map<string, Set<string>>()

  // find all table definitions to understand their structure
  const columnRegex = /\s*["']?(\w+)["']?\s+(\w+)(?:\(.*?\))?\s*(?:NOT NULL)?/g
  const tableColumns = new Map<string, Set<string>>()

  for (const tableMatch of sqlContent.matchAll(tableRegex)) {
    const [, tableName, columnsContent] = tableMatch
    const columns = new Set<string>()

    for (const columnMatch of columnsContent.matchAll(columnRegex)) {
      const [, columnName] = columnMatch
      columns.add(columnName.replace(/"/g, ''))
    }

    tableColumns.set(tableName.replace(/"/g, ''), columns)
    console.log(`  Found table ${tableName} with ${columns.size} columns`)
  }

  // process relationships from table structure
  console.log('\n🔍 Processing relationships from table structure...')
  for (const [tableName, columns] of tableColumns.entries()) {
    // find tables that look like join tables or have multiple foreign keys
    const foreignKeyColumns = Array.from(columns).filter(col => col.endsWith('_id'))

    // check if this is a join table
    const isJoinTable = foreignKeyColumns.length >= 2 && Array.from(columns).every(col =>
      col === 'id'
      || col.endsWith('_id')
      || col === 'created_at'
      || col === 'updated_at',
    )

    if (foreignKeyColumns.length >= 1) {
      console.log(`  Processing table with foreign keys: ${tableName}`)

      // for each foreign key, try to find its target table
      for (const fromCol of foreignKeyColumns) {
        const inferredTable = fromCol.replace(/_id$/, '')
        if (tableColumns.has(inferredTable)) {
          console.log(`    Adding relationship: ${tableName} -> ${inferredTable} (${fromCol})`)
          addRelationship(relationMap, tableConnections, tableName, inferredTable, fromCol, 'id')

          // for join tables, always add reverse relationship to ensure proper connection
          if (isJoinTable) {
            console.log(`    Adding reverse relationship (join table): ${inferredTable} -> ${tableName}`)
            addRelationship(relationMap, tableConnections, inferredTable, tableName, 'id', fromCol)
          }
        }
      }
    }
  }

  // then process foreign key constraints to add any missing relationships
  console.log('\n🔍 Processing SQL foreign key constraints...')
  const foreignKeyRegex = /ALTER TABLE (?:ONLY )?(?:public\.)?["']?(\w+)["']?\s+ADD CONSTRAINT \w+ FOREIGN KEY \(([^)]+)\) REFERENCES (?:public\.)?["']?(\w+)["']?\s*\(([^)]+)\)/g

  let relationCount = 0

  for (const match of sqlContent.matchAll(foreignKeyRegex)) {
    const [, fromTable, fromColumns, toTable, toColumns] = match
    console.log(`  Found SQL relation: ${fromTable} -> ${toTable}`)

    // split columns in case there are multiple (for composite foreign keys)
    const fromColumnList = fromColumns.split(',').map(c => c.trim().replace(/"/g, ''))
    const toColumnList = toColumns.split(',').map(c => c.trim().replace(/"/g, ''))

    // add each column pair as a relationship
    for (let i = 0; i < fromColumnList.length; i++) {
      const fromColumn = fromColumnList[i]
      const toColumn = toColumnList[i]

      // add relationship if it doesn't exist yet
      const key = `${fromTable}:${toTable}`
      if (!relationMap.has(key)) {
        addRelationship(relationMap, tableConnections, fromTable, toTable, fromColumn, toColumn)
        relationCount++
      }
    }
  }

  // add relationships from TypeScript relations
  console.log('\n🔍 Scanning TypeScript relations for additional relationships...')
  const relationsPath = path.join(process.cwd(), 'lib', 'types', 'database.tables', 'relations.ts')
  const relationsContent = await readFile(relationsPath, 'utf-8')

  // match relations definitions
  const relationsRegex = /export const (\w+)Relations\s*=\s*relations\(\s*(\w+)\s*,\s*\(\{\s*([\s\S]*?)\s*\}\)\s*=>\s*\(\{([\s\S]*?)\}\s*\)\s*(?:,\s*)?\)/g
  const fieldRegex = /(\w+):\s*(one|many)\(\s*(\w+)\s*(?:,\s*\{\s*fields:\s*\[([^.\]]+)\.([^\]]+)\](?:\s*,\s*references:\s*\[([^.\]]+)\.([^\]]+)\])?\s*\}\s*(?:,\s*)?)?\)/g

  // process each relation definition
  console.log('\n🔍 Processing TypeScript relations...')
  for (const relationMatch of relationsContent.matchAll(relationsRegex)) {
    const [, relationName, tableName, relationTypes, fieldsContent] = relationMatch
    console.log(`  Found relation: ${relationName} for table ${tableName}`)

    // process each field in the relation
    for (const fieldMatch of fieldsContent.matchAll(fieldRegex)) {
      const [, fieldName, relType, targetTable, sourceTable, sourceField, refTable, refField] = fieldMatch
      console.log(`    Field: ${fieldName}, Type: ${relType}, Target: ${targetTable}`)

      // for implicit fields (no explicit field mapping)
      if (!sourceField) {
        // handle implicit field mapping based on field name and table name
        let impliedSourceField: string
        let impliedTargetField = 'id'

        // handle plural field names for many relations
        const singularTargetTable = targetTable.endsWith('s') ? targetTable.slice(0, -1) : targetTable

        if (fieldName.endsWith(singularTargetTable)) {
          impliedSourceField = `${fieldName}_id`
        } else {
          impliedSourceField = `${singularTargetTable.toLowerCase()}_id`
        }

        // add the relationship
        if (relType === 'one') {
          addRelationship(relationMap, tableConnections, tableName, targetTable, impliedSourceField, impliedTargetField)
        } else {
          // for many relationships, add both directions
          addRelationship(relationMap, tableConnections, targetTable, tableName, impliedTargetField, impliedSourceField)
        }
      } else {
        // for explicit fields
        addRelationship(relationMap, tableConnections, tableName, targetTable, sourceField, refField || 'id')
      }
      relationCount++
    }
  }

  // convert relationships to Mermaid format
  console.log(`\n✅ Found ${relationCount} relationships\n`)

  // sort relationships to put related tables closer together
  const sortedRelationships = Array.from(relationMap.entries()).sort((a, b) => {
    const [fromA] = a[0].split(':')
    const [fromB] = b[0].split(':')
    return fromA.localeCompare(fromB)
  })

  // add relationships to the diagram
  mermaid += '\n    %% Relationships\n'

  // track processed relationships to avoid duplicates
  const processedRelations = new Set<string>()

  for (const [key, columns] of sortedRelationships) {
    const [fromTable, toTable] = key.split(':')

    // skip if we've already processed this exact relationship
    if (processedRelations.has(key)) {
      continue
    }
    processedRelations.add(key)

    // check if there's a reverse relationship
    const reverseKey = `${toTable}:${fromTable}`
    const hasReverseRelation = relationMap.has(reverseKey)

    // check if this is a join table
    const isJoinTable = tableColumns.has(fromTable)
      && Array.from(tableColumns.get(fromTable)!).every(col =>
        col === 'id'
        || col.endsWith('_id')
        || col === 'created_at'
        || col === 'updated_at',
      )

    // determine relationship type based on columns and reverse relation
    let relation = '}o--||' // default: optional one-to-many

    if (isJoinTable) {
      relation = '}|--|{' // many-to-many for join tables
    } else if (hasReverseRelation && !processedRelations.has(reverseKey)) {
      // check if both sides have multiple columns
      const fromCols = relationMap.get(key)!
      const toCols = relationMap.get(reverseKey)!

      if (fromCols.size > 1 && toCols.size > 1) {
        relation = '}|--|{' // many-to-many
      } else {
        relation = '}|--||' // one-to-one
      }
    }

    mermaid += `    ${fromTable} ${relation} ${toTable} : "references"\n`
  }

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

function addRelationship(
  relationMap: Map<string, Set<string>>,
  tableConnections: Map<string, Set<string>>,
  fromTable: string,
  toTable: string,
  fromColumn: string,
  toColumn: string,
) {
  const key = `${fromTable}:${toTable}`
  if (!relationMap.has(key)) {
    relationMap.set(key, new Set())
  }
  relationMap.get(key)!.add(`${fromColumn}:${toColumn}`)

  // track table connections for both directions
  if (!tableConnections.has(fromTable)) {
    tableConnections.set(fromTable, new Set())
  }
  if (!tableConnections.has(toTable)) {
    tableConnections.set(toTable, new Set())
  }
  tableConnections.get(fromTable)!.add(toTable)
  tableConnections.get(toTable)!.add(fromTable)
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
