import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import type { TemplateData } from '~/lib/(templates)/templates';

export function downloadTemplateZip(template: TemplateData) {
    const zip = new JSZip();

    template.code.forEach(codeFile => {
        zip.file(codeFile.fileName, codeFile.code.trim());
    });

    zip.generateAsync({ type: "blob" }).then(content => {
        saveAs(content, `${template.name.replaceAll(' ', '-')}-template.zip`);
    });
}
