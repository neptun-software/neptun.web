import type { ReadUser } from '~/lib/types/database.tables/schema'
import { eq } from 'drizzle-orm'
import { neptun_user_file } from '~/lib/types/database.tables/schema'

export async function readAllUserFiles(user_id: ReadUser['id']) {
  const fetchedUserFiles = await db
    .select({
      id: neptun_user_file.id,
      title: neptun_user_file.title,
      text: neptun_user_file.text,
      language: neptun_user_file.language,
      extension: neptun_user_file.extension,
      created_at: neptun_user_file.created_at,
      updated_at: neptun_user_file.updated_at,
      neptun_user_id: neptun_user_file.neptun_user_id,
    })
    .from(neptun_user_file)
    .where(eq(neptun_user_file.neptun_user_id, user_id))
    .catch((err) => {
      if (LOG_BACKEND) {
        console.error('Failed to fetch user files from database', err)
      }
      return null
    })

  if (!fetchedUserFiles) {
    return null
  }

  return fetchedUserFiles
}
