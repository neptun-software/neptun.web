import { eq } from 'drizzle-orm'
import {
  neptun_user_file,
  neptun_user_template,
  type TemplateToCreate,
  type UserFileToCreate,
} from '~/lib/types/database.tables/schema'

export async function createTemplate(template: TemplateToCreate & { file: UserFileToCreate }) {
  return db.transaction(async (tx) => {
    // Transform escaped HTML entities back to original characters
    const unescapedText = template.file.text
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')

    // Create the user file first with unescaped text
    const [userFile] = await tx
      .insert(neptun_user_file)
      .values({
        title: template.file.title || template.file_name,
        text: unescapedText, // Use unescaped text
        language: template.file.language || 'text',
        extension: template.file.extension || 'txt',
        neptun_user_id: template.neptun_user_id,
      })
      .returning()

    // Then create the template with the file reference
    const [createdTemplate] = await tx
      .insert(neptun_user_template)
      .values({
        description: template.description,
        file_name: template.file_name,
        neptun_user_id: template.neptun_user_id,
        template_collection_id: template.template_collection_id,
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

export async function readTemplate(id: number) {
  const template = await db.query.neptun_user_template.findFirst({
    where: eq(neptun_user_template.id, id),
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
  id: number,
  data: Partial<TemplateToCreate> & {
    file?: Partial<UserFileToCreate>
  },
) {
  return db.transaction(async (tx) => {
    // Fetch the template first to get the user_file_id
    const [template] = await tx
      .select()
      .from(neptun_user_template)
      .where(eq(neptun_user_template.id, id))

    if (!template) {
      throw new Error('Template not found')
    }

    // Update template
    const [updatedTemplate] = await tx
      .update(neptun_user_template)
      .set({
        description: data.description,
        file_name: data.file_name,
        updated_at: new Date(),
      })
      .where(eq(neptun_user_template.id, id))
      .returning()

    // Update associated file if file data is provided
    if (data.file && template.user_file_id) {
      const [updatedFile] = await tx
        .update(neptun_user_file)
        .set({
          title: data.file.title,
          text: data.file.text,
          language: data.file.language,
          extension: data.file.extension,
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

export async function deleteTemplate(id: number) {
  await db
    .delete(neptun_user_template)
    .where(eq(neptun_user_template.id, id))
}
