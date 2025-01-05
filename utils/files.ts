export async function downloadAsFile(
  data: any,
  fileName: string,
  type: string,
  extension: string,
) {
  const fileType = type ?? 'text/plain'
  const fileExtension = extension ?? 'txt'
  const fileContent = type === 'application/json'
    ? JSON.stringify(data, null, 2)
    : data
  const blob = new Blob([fileContent], {
    type: fileType,
  })

  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.style.display = 'none'
  link.href = url
  link.download = `${fileName}.${fileExtension}`
  document.body.appendChild(link)
  link.click()
  window.URL.revokeObjectURL(url)
  document.body.removeChild(link)
}
