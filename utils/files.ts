export async function downloadAsFile(
  data: any,
  fileName: string,
  type: string = 'application/json',
) {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type,
  })

  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.style.display = 'none'
  a.href = url
  a.download = `${fileName}.${type.split('/')[1]}`
  document.body.appendChild(a)
  a.click()
  window.URL.revokeObjectURL(url)
  document.body.removeChild(a)
}
