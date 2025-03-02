import type { GetProject, ProjectToCreate, ReadProject, ReadUser } from '../../../lib/types/database.tables/schema'
import { and, eq } from 'drizzle-orm'
import { neptun_user_project } from '../../../lib/types/database.tables/schema'

export async function createProject(user_id: ReadUser['id'], project: ProjectToCreate) {
  const createdProject = await db
    .insert(neptun_user_project)
    .values({ ...project, neptun_user_id: user_id })
    .returning()
    .catch((err) => {
      if (LOG_BACKEND) {
        console.error('Failed to create project:', err)
      }
      return null
    })

  if (!createdProject) {
    return null
  }
  return createdProject[0]
}

export async function readProject(
  user_id: ReadUser['id'],
  project_id: ReadProject['id'],
) {
  const project = await db
    .select()
    .from(neptun_user_project)
    .where(
      and(
        eq(neptun_user_project.id, project_id),
        eq(neptun_user_project.neptun_user_id, user_id),
      ),
    )
    .limit(1)
    .catch((err) => {
      if (LOG_BACKEND) {
        console.error('Failed to read project:', err)
      }
      return null
    })

  if (!project) {
    return null
  }
  return project[0]
}

export async function readAllProjects(user_id: ReadUser['id']) {
  const projects = await db
    .select()
    .from(neptun_user_project)
    .where(eq(neptun_user_project.neptun_user_id, user_id))
    .catch((err) => {
      if (LOG_BACKEND) {
        console.error('Failed to read all projects:', err)
      }
      return null
    })

  if (!projects) {
    return null
  }
  return projects
}

export async function readProjectsByTypeAndLanguage(
  user_id: ReadUser['id'],
  project_type: ReadProject['type'],
  main_language: ReadProject['main_language'],
) {
  const projects = await db
    .select()
    .from(neptun_user_project)
    .where(
      and(
        eq(neptun_user_project.neptun_user_id, user_id),
        eq(neptun_user_project.type, project_type),
        eq(neptun_user_project.main_language, main_language),
      ),
    )
    .catch((err) => {
      if (LOG_BACKEND) {
        console.error('Failed to read projects by type and language:', err)
      }
      return null
    })

  if (!projects) {
    return null
  }
  return projects
}

export async function updateProject(
  user_id: ReadUser['id'],
  project_id: ReadProject['id'],
  updates: Partial<Omit<GetProject, 'id' | 'created_at' | 'updated_at'>>,
) {
  const updatedProject = await db
    .update(neptun_user_project)
    .set(updates)
    .where(
      and(
        eq(neptun_user_project.id, project_id),
        eq(neptun_user_project.neptun_user_id, user_id),
      ),
    )
    .returning()
    .catch((err) => {
      if (LOG_BACKEND) {
        console.error('Failed to update project:', err)
      }
      return null
    })

  if (!updatedProject) {
    return null
  }
  return updatedProject[0]
}

export async function deleteProject(
  user_id: ReadUser['id'],
  project_id: ReadProject['id'],
) {
  return db
    .delete(neptun_user_project)
    .where(
      and(
        eq(neptun_user_project.id, project_id),
        eq(neptun_user_project.neptun_user_id, user_id),
      ),
    )
    .catch((err) => {
      if (LOG_BACKEND) {
        console.error('Failed to delete project:', err)
      }
      return false
    })
}
