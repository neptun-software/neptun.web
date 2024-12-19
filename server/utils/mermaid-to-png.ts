import { exec } from 'node:child_process'
import { readdir, unlink, writeFile } from 'node:fs/promises'
import path from 'node:path'

async function convertToPng() {
  try {
    const schemaDir = './backup/schema'
    const files = await readdir(schemaDir)
    const latestMermaid = files
      .filter(f => f.endsWith('.mermaid'))
      .sort()
      .reverse()[0]

    if (!latestMermaid) {
      console.error('No Mermaid-File found')
      return
    }

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

    await writeFile(configFile, JSON.stringify(config))

    const command = `npx -p @mermaid-js/mermaid-cli mmdc \
      -i ${inputFile} \
      -o ${outputFile} \
      -c ${configFile} \
      -b transparent \
      --scale ${config.scale}`

    exec(command, async (error) => {
      // Delete the config file
      try {
        await unlink(configFile)
      }
      catch (unlinkError) {
        console.error('Failed to delete config file:', unlinkError)
      }

      if (error) {
        console.error('PNG-Conversion failed:', error)
        return
      }
      console.log(`PNG-File created: ${outputFile}`)
    })
  }
  catch (error) {
    console.error('Conversion failed:', error)
  }
}

(async () => {
  await convertToPng()
})()
