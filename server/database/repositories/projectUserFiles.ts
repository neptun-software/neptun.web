import type { ReadProject, ReadUserFile } from '../../../lib/types/database.tables/schema'
import { and, eq } from 'drizzle-orm'
import { neptun_user_file, project_user_file } from '../../../lib/types/database.tables/schema'

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

  const file = await db
    .select()
    .from(neptun_user_file)
    .where(eq(neptun_user_file.id, user_file_id))
    .limit(1)
    .catch((err) => {
      if (LOG_BACKEND) {
        console.error('Failed to read user file:', err)
      }
      return null
    })

  if (!file) {
    return null
  }
  return file[0]
}

export async function readAllProjectUserFiles(project_id: ReadProject['id']) {
  const files = await db
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
    .from(project_user_file)
    .innerJoin(
      neptun_user_file,
      eq(project_user_file.user_file_id, neptun_user_file.id),
    )
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
    .from(project_user_file)
    .innerJoin(
      neptun_user_file,
      eq(project_user_file.user_file_id, neptun_user_file.id),
    )
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
