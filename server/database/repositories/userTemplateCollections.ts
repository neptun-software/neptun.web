import { eq } from 'drizzle-orm'
import {
  neptun_user_template_collection,
} from '~/lib/types/database.tables/schema'

// TODO: createTemplateCollection, updateTemplateCollection, deleteTemplateCollection

export async function readTemplateCollection(share_uuid: string) {
  const collection = await db.query.neptun_user_template_collection.findFirst({
    where: eq(neptun_user_template_collection.share_uuid, share_uuid),
    with: {
      templates: {
        with: {
          neptun_user_file: true,
        },
        columns: {
          id: true,
          description: true,
          file_name: true,
          created_at: true,
          updated_at: true,
        },
      },
    },
    columns: {
      id: true,
      name: true,
      description: true,
      is_shared: true,
      created_at: true,
      updated_at: true,
    },
  })

  if (!collection || !collection.templates) {
    return null
  }

  // Transform the data to include file information
  return {
    ...collection,
    templates: collection.templates
      .map(template => ({
        ...template,
        title: template.neptun_user_file?.title,
        text: template.neptun_user_file?.text,
        language: template.neptun_user_file?.language || 'text',
        extension: template.neptun_user_file?.extension || 'txt',
      })),
  }
}
