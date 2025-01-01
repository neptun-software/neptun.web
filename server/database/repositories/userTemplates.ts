import { eq } from 'drizzle-orm'

import {
  neptun_user_file,
  neptun_user_template,
  type ReadTemplate,
  type TemplateToCreate,
  type UserFileToCreate,
} from '~/lib/types/database.tables/schema'

export async function createTemplate(template_entry: TemplateToCreate & { file: UserFileToCreate }) {
  return db.transaction(async (tx) => {
    // Transform escaped HTML entities back to original characters
    const unescapedText = template_entry.file.text
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')

    // Create the user file first with unescaped text
    const [userFile] = await tx
      .insert(neptun_user_file)
      .values({
        title: template_entry.file.title || template_entry.file_name,
        text: unescapedText, // Use unescaped text
        language: template_entry.file.language || 'text',
        extension: template_entry.file.extension || 'txt',
        neptun_user_id: template_entry.neptun_user_id,
      })
      .returning()

    // Then create the template with the file reference
    const [createdTemplate] = await tx
      .insert(neptun_user_template)
      .values({
        description: template_entry.description,
        file_name: template_entry.file_name,
        neptun_user_id: template_entry.neptun_user_id,
        template_collection_id: template_entry.template_collection_id,
        user_file_id: userFile.id,
      })
      .returning()

    return {
      ...createdTemplate,
      title: userFile.title,
      text: userFile.text,
      language: userFile.language,
      extension: userFile.extension,
    }
  }).catch((err) => {
    if (LOG_BACKEND) {
      console.error('Failed to create template in database', err)
    }
    return null
  })
}

export async function readTemplate(template_id: ReadTemplate['id']) {
  const template = await db.query.neptun_user_template.findFirst({
    where: eq(neptun_user_template.id, template_id),
    with: {
      neptun_user_file: true,
    },
    columns: {
      id: true,
      description: true,
      file_name: true,
      created_at: true,
      updated_at: true,
      neptun_user_id: true,
      template_collection_id: true,
      user_file_id: true,
    },
  })

  if (!template || !template.neptun_user_file) {
    return null
  }

  return {
    ...template,
    title: template.neptun_user_file.title,
    text: template.neptun_user_file.text,
    language: template.neptun_user_file.language,
    extension: template.neptun_user_file.extension,
  }
}

export async function updateTemplate(
  template_id: ReadTemplate['id'],
  template_entry: Partial<TemplateToCreate> & {
    file?: Partial<UserFileToCreate>
  },
) {
  return db.transaction(async (tx) => {
    // Fetch the template first to get the user_file_id
    const [template] = await tx
      .select()
      .from(neptun_user_template)
      .where(eq(neptun_user_template.id, template_id))

    if (!template) {
      throw new Error('Template not found')
    }

    // Update template
    const [updatedTemplate] = await tx
      .update(neptun_user_template)
      .set({
        description: template_entry.description,
        file_name: template_entry.file_name,
      })
      .where(eq(neptun_user_template.id, template_id))
      .returning()

    // Update associated file if file data is provided
    if (template_entry.file && template.user_file_id) {
      const [updatedFile] = await tx
        .update(neptun_user_file)
        .set({
          title: template_entry.file.title,
          text: template_entry.file.text,
          language: template_entry.file.language,
          extension: template_entry.file.extension,
        })
        .where(eq(neptun_user_file.id, template.user_file_id))
        .returning()

      return {
        ...updatedTemplate,
        title: updatedFile.title,
        text: updatedFile.text,
        language: updatedFile.language,
        extension: updatedFile.extension,
      }
    }

    return updatedTemplate
  })
}

export async function deleteTemplate(template_id: ReadTemplate['id']) {
  return db
    .delete(neptun_user_template)
    .where(eq(neptun_user_template.id, template_id))
    .then(() => true)
    .catch((err) => {
      if (LOG_BACKEND) {
        console.error('Failed to delete template from database', err)
      }
      return false
    })
}
