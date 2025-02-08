import type { ContextFileToCreate, ReadContextFile, ReadProject } from '../../../lib/types/database.tables/schema'
import { and, eq } from 'drizzle-orm'
import { neptun_context_file } from '../../../lib/types/database.tables/schema'

export async function createContextFile(file_entry: ContextFileToCreate) {
  const created = await db
    .insert(neptun_context_file)
    .values(file_entry)
    .returning()
    .catch((err) => {
      if (LOG_BACKEND) {
        console.error('Failed to create context file:', err)
      }
      return null
    })

  if (!created) {
    return null
  }
  return created[0]
}

export async function readContextFilesByProjectId(project_id: ReadProject['id']) {
  const files = await db
    .select()
    .from(neptun_context_file)
    .where(eq(neptun_context_file.project_id, project_id))
    .catch((err) => {
      if (LOG_BACKEND) {
        console.error('Failed to read context files by project:', err)
      }
      return null
    })

  if (!files) {
    return null
  }
  return files
}

export async function readContextFilesByProjectAndCategory(
  project_id: ReadProject['id'],
  category: ReadContextFile['category'],
) {
  const files = await db
    .select()
    .from(neptun_context_file)
    .where(
      and(
        eq(neptun_context_file.project_id, project_id),
        eq(neptun_context_file.category, category || 'unknown'),
      ),
    )
    .catch((err) => {
      if (LOG_BACKEND) {
        console.error('Failed to read context files by project and category:', err)
      }
      return null
    })

  if (!files) {
    return null
  }
  return files
}

export async function readContextFilesByProjectAndType(
  project_id: ReadProject['id'],
  file_type: ReadContextFile['file_type'],
) {
  const files = await db
    .select()
    .from(neptun_context_file)
    .where(
      and(
        eq(neptun_context_file.project_id, project_id),
        eq(neptun_context_file.file_type, file_type),
      ),
    )
    .catch((err) => {
      if (LOG_BACKEND) {
        console.error('Failed to read context files by project and type:', err)
      }
      return null
    })

  if (!files) {
    return null
  }
  return files
}

export async function readContextFile(
  project_id: ReadProject['id'],
  file_id: ReadContextFile['id'],
) {
  const file = await db
    .select()
    .from(neptun_context_file)
    .where(
      and(
        eq(neptun_context_file.project_id, project_id),
        eq(neptun_context_file.id, file_id),
      ),
    )
    .limit(1)
    .catch((err) => {
      if (LOG_BACKEND) {
        console.error('Failed to read context file:', err)
      }
      return null
    })

  if (!file) {
    return null
  }
  return file[0]
}

export async function updateContextFile(
  file_id: ReadContextFile['id'],
  updates: Partial<Omit<ReadContextFile, 'id' | 'created_at' | 'updated_at'>>,
) {
  const updated = await db
    .update(neptun_context_file)
    .set(updates)
    .where(eq(neptun_context_file.id, file_id))
    .returning()
    .catch((err) => {
      if (LOG_BACKEND) {
        console.error('Failed to update context file:', err)
      }
      return null
    })

  if (!updated) {
    return null
  }
  return updated[0]
}

export async function deleteContextFile(file_id: ReadContextFile['id']) {
  return db
    .delete(neptun_context_file)
    .where(eq(neptun_context_file.id, file_id))
    .catch((err) => {
      if (LOG_BACKEND) {
        console.error('Failed to delete context file:', err)
      }
      return false
    })
}
