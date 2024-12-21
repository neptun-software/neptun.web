import { eq } from 'drizzle-orm'
import { neptun_user_template_collection } from '~/lib/types/database.tables/schema'

// TODO: createTemplateCollection, updateTemplateCollection, deleteTemplateCollection

export async function readTemplateCollection(share_uuid: string) {
  const collection = await db.query.neptun_user_template_collection.findFirst({
    where: eq(neptun_user_template_collection.share_uuid, share_uuid),
    with: {
      templates: {
        columns: {
          id: true,
          title: true,
          description: true,
          file_name: true,
          language: true,
          extension: true,
          content: true,
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

  if (!collection) {
    return null
  }

  return collection
}
