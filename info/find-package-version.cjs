const { exec } = require('node:child_process')

// Example usage: pnpm run find-version @nuxt/devtools
const packageName = process.argv[2]

if (!packageName) {
  console.error('Please provide a package name.')
  process.exit(1)
}

exec('pnpm list --depth=1', (error, stdout, stderr) => {
  if (error) {
    console.error(`Error: ${error.message}`)
    return
  }

  if (stderr) {
    console.error(`Stderr: ${stderr}`)
    return
  }

  const result = stdout
    .split('\n')
    .filter(line => line.includes(packageName))

  if (result.length > 0) {
    console.info(result.join('\n'))
  }
  else {
    console.info(`Package ${packageName} not found.`)
  }
})
