import { exec } from 'node:child_process'
import { copyFile, readdir, unlink, writeFile } from 'node:fs/promises'
import path from 'node:path'

async function convertToPng() {
  const schemaDir = './backup/schema'
  console.log('\n=== Starting PNG Conversion ===')
  console.log('📁 Working directory:', schemaDir)

  const files = await readdir(schemaDir)
  console.log('📋 Found files:', files)

  const latestMermaid = files
    .filter(f => f.endsWith('.mermaid') && f !== 'schema.mermaid')
    .sort((a, b) => {
      const timestampA = a.split('.')[0]
      const timestampB = b.split('.')[0]
      return timestampB.localeCompare(timestampA)
    })[0]

  if (!latestMermaid) {
    console.error('❌ No Mermaid-File found')
    process.exit(1)
  }

  console.log('\n📄 Using Mermaid file:', latestMermaid)

  const inputFile = path.join(schemaDir, latestMermaid)
  const timestampPngFile = inputFile.replace('.mermaid', '.png')
  const schemaPngFile = path.join(schemaDir, 'schema.png')
  const configFile = path.join(schemaDir, 'mermaid.json')

  // 16K resolution with high-quality scaling
  const config = {
    theme: 'default',
    backgroundColor: 'transparent',
    width: 15360, // 16K width
    height: 8640, // 16K height
    scale: 10, // High scale factor for crisp text and smooth lines
    cssFile: path.join(process.cwd(), 'server/utils/mermaid-theme.css'),
  }

  console.log('\n⚙️  Mermaid Configuration:')
  console.log(`  • Theme: ${config.theme}`)
  console.log(`  • Resolution: ${config.width}x${config.height}`)
  console.log(`  • Scale: ${config.scale}`)
  console.log(`  • CSS File: ${config.cssFile}`)

  console.log('\n📋 Preparing output files:')
  console.log(`  • Input file: ${path.relative('.', inputFile)}`)
  console.log(`  • Timestamp PNG: ${path.relative('.', timestampPngFile)}`)
  console.log(`  • Schema PNG: ${path.relative('.', schemaPngFile)}`)
  console.log(`  • Config file: ${path.relative('.', configFile)}`)

  console.log('\n💾 Writing config file...')
  await writeFile(configFile, JSON.stringify(config))
  console.log('✅ Config file created:', configFile)

  console.log('\n🚀 Preparing mermaid-cli command...')
  const command = `npx -p @mermaid-js/mermaid-cli mmdc \
    -i ${inputFile} \
    -o ${timestampPngFile} \
    -c ${configFile} \
    -b transparent \
    --scale ${config.scale}`

  console.log('📝 Command:', command)
  console.log('\n⏳ Converting to PNG...')

  // Wrap exec in a Promise
  await new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (stdout) {
        console.log('📝 Output:', stdout)
      }
      if (stderr) {
        console.warn('⚠️  Warnings:', stderr)
      }

      const cleanup = async () => {
        console.log('\n🧹 Cleaning up config file...')

        return unlink(configFile)
          .then(() => {
            console.log('✅ Config file deleted')
          })
          .catch((unlinkError) => {
            console.error('❌ Failed to delete config file:', unlinkError)
          })
      }

      if (error) {
        void cleanup().then(() => {
          console.error('\n❌ PNG-Conversion failed:', error)
          reject(error)
        })
        return
      }

      console.log('\n📋 Creating schema.png...')
      void copyFile(timestampPngFile, schemaPngFile)
        .then(async () => {
          console.log('✅ Schema PNG created')
          return cleanup()
        })
        .then(() => {
          console.log('\n✅ PNG files created successfully:')
          console.log(`  • Timestamp file: ${path.relative('.', timestampPngFile)}`)
          console.log(`  • Schema file: ${path.relative('.', schemaPngFile)}`)
          console.log('\n=== PNG Conversion Complete ===\n')
          resolve(true)
        })
        .catch((err) => {
          console.error('❌ Failed to create schema.png:', err)
          reject(err)
        })
    })
  })

  return {
    timestampPngFile: path.relative('.', timestampPngFile),
    schemaPngFile: path.relative('.', schemaPngFile),
  }
}

void (async () => {
  try {
    const result = await convertToPng()
    console.log('🎉 Process completed successfully:')
    console.log(`  • Timestamp file: ${result.timestampPngFile}`)
    console.log(`  • Schema file: ${result.schemaPngFile}`)
    process.exit(0)
  } catch (error) {
    console.error('💥 Process failed:', error)
    process.exit(1)
  }
})()
