import type { ImportedTemplateData, TemplateCollectionWithTemplatesWithoutIds as TemplateData } from '~/components/pages/templates/(shared)/types'
import pkg from 'file-saver'
import JSZip from 'jszip'

const { saveAs } = pkg

export async function downloadTemplateZip(collection: TemplateData) {
  const zip = new JSZip()

  collection.templates.forEach((template) => {
    zip.file(template.file_name, template.text?.trim() || '')
  })

  await zip.generateAsync({ type: 'blob' }).then((content) => {
    saveAs(content, `${collection.name.replaceAll(' ', '-')}-template.zip`)
  })
}

/**
 * Returns a click handler that downloads the template as a zip file.
 *
 * @param {TemplateData} collection The collection to download.
 * @returns {(event: MouseEvent) => Promise<void>} A click handler that downloads the template.
 */
export function downloadTemplateHandler(collection: TemplateData): (event: MouseEvent) => Promise<void> {
  return async (event: MouseEvent) => {
    event.preventDefault()
    await downloadTemplateZip(collection)
  }
}

export async function uploadTemplateZip(file: File) {
  try {
    if (!file.type && !file.name.endsWith('.zip')) {
      throw new Error('File must be a ZIP file')
    }

    const zip = new JSZip()
    const contents = await zip.loadAsync(file)
    const collectionName = file.name.replace('-template.zip', '').replaceAll('-', ' ')

    const templates = await Promise.all(
      Object.keys(contents.files).map(async (fileName) => {
        // Skip directories
        if (contents.files[fileName].dir) {
          return null
        }

        const text = await contents.files[fileName].async('text')
        return {
          file_name: fileName,
          text: text.trim(),
          title: fileName,
          language: 'text',
          extension: fileName.split('.').pop() || 'txt',
        }
      }),
    )

    // Filter out null values (directories)
    const validTemplates = templates.filter(t => t !== null)

    return {
      name: collectionName,
      templates: validTemplates,
    }
  } catch (error) {
    console.error('Error reading ZIP file:', error)
    throw new Error('Failed to read template ZIP file')
  }
}

/**
 * Returns a change handler for file input that reads a ZIP file and returns template data.
 *
 * @param {(data: TemplateData) => void} onUpload Callback function to handle the parsed template data
 * @returns {(event: Event) => Promise<void>} A change handler for file input
 */
export function uploadTemplateHandler(
  onUpload: (data: ImportedTemplateData) => void,
): (event: Event) => Promise<void> {
  return async (event: Event) => {
    const input = event.target as HTMLInputElement
    if (!input.files?.length) {
      return
    }

    try {
      const file = input.files[0]
      const templateData = await uploadTemplateZip(file)
      onUpload(templateData)
    } catch (error) {
      console.error('Upload failed:', error)
      throw error
    }
  }
}
