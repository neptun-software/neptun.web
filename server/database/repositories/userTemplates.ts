import { eq } from 'drizzle-orm'
import {
  neptun_user_file,
  neptun_user_template,
  type TemplateToCreate,
} from '~/lib/types/database.tables/schema'

export async function createTemplate(template: TemplateToCreate) {
  return db.transaction(async (tx) => {
    const [userFile] = await tx
      .insert(neptun_user_file)
      .values({
        title: template.file_name,
        text: '',
        language: 'text',
        extension: 'txt',
        neptun_user_id: template.neptun_user_id,
      })
      .returning()

    const [createdTemplate] = await tx
      .insert(neptun_user_template)
      .values({
        ...template,
        user_file_id: userFile.id,
      })
      .returning()

    return createdTemplate
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
