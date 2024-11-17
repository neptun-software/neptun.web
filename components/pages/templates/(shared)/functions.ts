import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import type { TemplateData } from '~/lib/(templates)/templates';

export async function downloadTemplateZip(template: TemplateData) {
  const zip = new JSZip();

  template.code.forEach((codeFile) => {
    zip.file(codeFile.fileName, codeFile.code.trim());
  });

  await zip.generateAsync({ type: 'blob' }).then((content) => {
    saveAs(content, `${template.name.replaceAll(' ', '-')}-template.zip`);
  });
}

/**
 * Returns a click handler that downloads the template as a zip file.
 *
 * @param {TemplateData} template The template to download.
 * @returns {(event: MouseEvent) => Promise<void>} A click handler that downloads the template.
 */
export function downloadTemplateHandler(template: TemplateData): (event: MouseEvent) => Promise<void> {
  return async (event: MouseEvent) => {
    event.preventDefault();
    await downloadTemplateZip(template);
  };
}
