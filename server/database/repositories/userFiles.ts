import { eq } from 'drizzle-orm'
import { neptun_user_file, type UserFileToCreate } from '~/lib/types/database.tables/schema'

export async function createUserFile(file: UserFileToCreate) {
  const [createdFile] = await db
    .insert(neptun_user_file)
    .values(file)
    .returning()
    .catch((err) => {
      if (LOG_BACKEND) {
        console.error('Failed to create user file in database', err)
      }
      return []
    })

  return createdFile || null
}

export async function readUserFile(id: number) {
  const file = await db
    .query
    .neptun_user_file
    .findFirst({
      where: eq(neptun_user_file.id, id),
    })
    .catch((err) => {
      if (LOG_BACKEND) {
        console.error(
          'Failed to read user file from database',
          err,
        )
      }
      return null
    })

  return file || null
}
