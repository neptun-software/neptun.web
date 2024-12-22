import { exec } from 'node:child_process'
import { readdir, unlink, writeFile } from 'node:fs/promises'
import path from 'node:path'

async function convertToPng() {
  try {
    console.log('\n=== Starting PNG Conversion ===')

    const schemaDir = './backup/schema'
    console.log('📁 Working directory:', schemaDir)

    const files = await readdir(schemaDir)
    console.log('📋 Found files:', files)

    const latestMermaid = files
      .filter(f => f.endsWith('.mermaid'))
      .sort()
      .reverse()[0]

    if (!latestMermaid) {
      console.error('❌ No Mermaid-File found')
      return
    }

    console.log('📄 Using Mermaid file:', latestMermaid)

    const inputFile = path.join(schemaDir, latestMermaid)
    const outputFile = inputFile.replace('.mermaid', '.png')
    const configFile = path.join(schemaDir, 'mermaid.json')

    // 8K resolution
    const config = {
      theme: 'default',
      backgroundColor: 'transparent',
      width: 7680,
      height: 4320,
      scale: 4,
      cssFile: path.join(process.cwd(), 'server/utils/mermaid-theme.css'),
    }

    console.log('\n⚙️  Mermaid Configuration:')
    console.log(`  • Theme: ${config.theme}`)
    console.log(`  • Resolution: ${config.width}x${config.height}`)
    console.log(`  • Scale: ${config.scale}`)
    console.log(`  • CSS File: ${config.cssFile}`)

    console.log('\n💾 Writing config file...')
    await writeFile(configFile, JSON.stringify(config))
    console.log('✅ Config file created:', configFile)

    console.log('\n🚀 Preparing mermaid-cli command...')
    const command = `npx -p @mermaid-js/mermaid-cli mmdc \
      -i ${inputFile} \
      -o ${outputFile} \
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
          try {
            console.log('\n🧹 Cleaning up config file...')
            await unlink(configFile)
            console.log('✅ Config file deleted')
          } catch (unlinkError) {
            console.error('❌ Failed to delete config file:', unlinkError)
          }
        }

        void cleanup()

        if (error) {
          console.error('\n❌ PNG-Conversion failed:', error)
          reject(error)
          return
        }

        console.log('\n✅ PNG-File created successfully!')
        console.log('📄 Output file:', outputFile)
        console.log('\n=== PNG Conversion Complete ===\n')
        resolve(true)
      })
    })
  } catch (error) {
    console.error('\n💥 Conversion process failed with error:')
    console.error(error)
    throw error
  }
}

void (async () => {
  try {
    await convertToPng()
    console.log('🎉 PNG conversion process completed successfully')
    process.exit(0)
  } catch (error) {
    console.error('💥 PNG conversion process failed:', error)
    process.exit(1)
  }
})()
