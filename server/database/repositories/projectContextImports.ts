import type { ContextImportToCreate, ReadContextImport, ReadProject } from '../../../lib/types/database.tables/schema'
import { and, eq } from 'drizzle-orm'
import { neptun_context_import } from '../../../lib/types/database.tables/schema'

export async function createContextImport(import_entry: ContextImportToCreate) {
  const created = await db
    .insert(neptun_context_import)
    .values(import_entry)
    .returning()
    .catch((err) => {
      if (LOG_BACKEND) {
        console.error('Failed to create context import:', err)
      }
      return null
    })

  if (!created) {
    return null
  }
  return created[0]
}

export async function readContextImportsByProjectId(project_id: ReadProject['id']) {
  const imports = await db
    .select()
    .from(neptun_context_import)
    .where(eq(neptun_context_import.project_id, project_id))
    .catch((err) => {
      if (LOG_BACKEND) {
        console.error('Failed to read context imports by project:', err)
      }
      return null
    })

  if (!imports) {
    return null
  }
  return imports
}

export async function readContextImportsByProjectAndSourceType(
  project_id: ReadProject['id'],
  source_type: ReadContextImport['source_type'],
) {
  const imports = await db
    .select()
    .from(neptun_context_import)
    .where(
      and(
        eq(neptun_context_import.project_id, project_id),
        eq(neptun_context_import.source_type, source_type),
      ),
    )
    .catch((err) => {
      if (LOG_BACKEND) {
        console.error('Failed to read context imports by project and source type:', err)
      }
      return null
    })

  if (!imports) {
    return null
  }
  return imports
}

export async function readContextImport(
  project_id: ReadProject['id'],
  import_id: ReadContextImport['id'],
) {
  const import_entry = await db
    .select()
    .from(neptun_context_import)
    .where(
      and(
        eq(neptun_context_import.project_id, project_id),
        eq(neptun_context_import.id, import_id),
      ),
    )
    .limit(1)
    .catch((err) => {
      if (LOG_BACKEND) {
        console.error('Failed to read context import:', err)
      }
      return null
    })

  if (!import_entry) {
    return null
  }
  return import_entry[0]
}

export async function updateContextImport(
  import_id: ReadContextImport['id'],
  updates: Partial<Omit<ReadContextImport, 'id' | 'created_at' | 'updated_at'>>,
) {
  const updated = await db
    .update(neptun_context_import)
    .set(updates)
    .where(eq(neptun_context_import.id, import_id))
    .returning()
    .catch((err) => {
      if (LOG_BACKEND) {
        console.error('Failed to update context import:', err)
      }
      return null
    })

  if (!updated) {
    return null
  }
  return updated[0]
}

export async function deleteContextImport(import_id: ReadContextImport['id']) {
  return db
    .delete(neptun_context_import)
    .where(eq(neptun_context_import.id, import_id))
    .catch((err) => {
      if (LOG_BACKEND) {
        console.error('Failed to delete context import:', err)
      }
      return false
    })
}
