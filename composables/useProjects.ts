import type { GetProject, ProjectToCreate } from '~/lib/types/database.tables/schema'
import { convertStringsToDates } from '~/utils/formatters'

export function useProjects() {
  const activeProject = useState<GetProject | undefined>('active-project', () => undefined)
  const projectsList = useState<GetProject[]>('projects-list', () => [])

  const isFetchingProject = useState<boolean>('project-fetching', () => false)
  const isFetchingProjects = useState<boolean>('projects-fetching', () => false)
  const isCreatingProject = useState<boolean>('project-creating', () => false)
  const isUpdatingProject = useState<boolean>('project-updating', () => false)
  const isDeletingProject = useState<boolean>('project-deleting', () => false)

  async function fetchProject(projectId: number) {
    if (!projectId) {
      return
    }

    try {
      isFetchingProject.value = true
      const { user } = useUserSession()
      const response = await $fetch<GetProject>(`/api/users/${user.value?.id}/projects/${projectId}`)
      activeProject.value = convertStringsToDates(response)
    } catch (error) {
      console.error('Failed to load project:', error)
      throw error
    } finally {
      isFetchingProject.value = false
    }
  }

  async function fetchProjects() {
    try {
      isFetchingProjects.value = true
      const { user } = useUserSession()
      const response = await $fetch<GetProject[]>(`/api/users/${user.value?.id}/projects`)
      projectsList.value = response.map(project => convertStringsToDates(project))
    } catch (error) {
      console.error('Failed to load projects:', error)
      throw error
    } finally {
      isFetchingProjects.value = false
    }
  }

  async function createProject(project: ProjectToCreate) {
    try {
      isCreatingProject.value = true
      const { user } = useUserSession()
      const response = await $fetch<GetProject>(`/api/users/${user.value?.id}/projects`, {
        method: 'POST',
        body: project,
      })

      projectsList.value = [...projectsList.value, convertStringsToDates(response)]

      return response.id
    } catch (error) {
      console.error('Failed to create project:', error)
      throw error
    } finally {
      isCreatingProject.value = false
    }
  }

  async function updateProject(projectId: number, updates: Partial<GetProject>) {
    try {
      isUpdatingProject.value = true
      const { user } = useUserSession()

      const response = await $fetch<GetProject>(`/api/users/${user.value?.id}/projects/${projectId}`, {
        method: 'PATCH',
        body: updates,
      })

      const index = projectsList.value.findIndex(p => p.id === projectId)
      if (index !== -1) {
        projectsList.value[index] = convertStringsToDates(response)
      }

      if (activeProject.value && activeProject.value.id === projectId) {
        activeProject.value = convertStringsToDates(response)
      }

      return response
    } catch (error) {
      console.error('Failed to update project:', error)
      throw error
    } finally {
      isUpdatingProject.value = false
    }
  }

  async function deleteProject(projectId: number) {
    try {
      isDeletingProject.value = true
      const { user } = useUserSession()

      await $fetch(`/api/users/${user.value?.id}/projects/${projectId}`, {
        method: 'DELETE',
      })

      projectsList.value = projectsList.value.filter(p => p.id !== projectId)

      if (activeProject.value && activeProject.value.id === projectId) {
        activeProject.value = undefined
      }

      return true
    } catch (error) {
      console.error('Failed to delete project:', error)
      throw error
    } finally {
      isDeletingProject.value = false
    }
  }

  function clearProject() {
    activeProject.value = undefined
  }

  return {
    activeProject,
    projectsList,
    isFetchingProject,
    isFetchingProjects,
    isCreatingProject,
    isUpdatingProject,
    isDeletingProject,
    fetchProject,
    fetchProjects,
    createProject,
    updateProject,
    deleteProject,
    clearProject,
  }
}
