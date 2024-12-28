import type { TemplateCollectionWithTemplatesWithoutIds as TemplateData } from '~/components/pages/templates/(shared)/types'
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
