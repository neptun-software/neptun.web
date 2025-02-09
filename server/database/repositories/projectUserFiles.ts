import type { ReadProject, ReadUserFile } from '../../../lib/types/database.tables/schema'
import { and, eq } from 'drizzle-orm'
import { project_user_file } from '../../../lib/types/database.tables/schema'

export async function createProjectUserFile(
  project_id: ReadProject['id'],
  user_file_id: ReadUserFile['id'],
) {
  const created = await db
    .insert(project_user_file)
    .values({
      project_id,
      user_file_id,
    })
    .returning()
    .catch((err) => {
      if (LOG_BACKEND) {
        console.error('Failed to create project user file:', err)
      }
      return null
    })

  if (!created) {
    return null
  }
  return created[0]
}

export async function readAllProjectUserFiles(project_id: ReadProject['id']) {
  const files = await db
    .select()
    .from(project_user_file)
    .where(eq(project_user_file.project_id, project_id))
    .catch((err) => {
      if (LOG_BACKEND) {
        console.error('Failed to read project user files:', err)
      }
      return null
    })

  if (!files) {
    return null
  }
  return files
}

export async function readProjectUserFile(
  project_id: ReadProject['id'],
  user_file_id: ReadUserFile['id'],
) {
  const file = await db
    .select()
    .from(project_user_file)
    .where(
      and(
        eq(project_user_file.project_id, project_id),
        eq(project_user_file.user_file_id, user_file_id),
      ),
    )
    .limit(1)
    .catch((err) => {
      if (LOG_BACKEND) {
        console.error('Failed to read project user file:', err)
      }
      return null
    })

  if (!file) {
    return null
  }
  return file[0]
}

export async function deleteProjectUserFile(
  project_id: ReadProject['id'],
  user_file_id: ReadUserFile['id'],
) {
  return db
    .delete(project_user_file)
    .where(
      and(
        eq(project_user_file.project_id, project_id),
        eq(project_user_file.user_file_id, user_file_id),
      ),
    )
    .catch((err) => {
      if (LOG_BACKEND) {
        console.error('Failed to delete project user file:', err)
      }
      return false
    })
}
