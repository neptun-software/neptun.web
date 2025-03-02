import type { GetProject, ProjectToCreate } from '~/lib/types/database.tables/schema'
import { convertStringsToDates } from '~/utils/formatters'

export function useProjects() {
  const activeProject = useState<GetProject | undefined>('active-project', () => undefined)
  const projectsList = useState<GetProject[]>('projects-list', () => [])
  const isLoading = useState<boolean>('projects-loading', () => false)

  async function fetchProject(projectId: number) {
    if (!projectId) {
      return
    }

    try {
      isLoading.value = true
      const { user } = useUserSession()
      const response = await $fetch<GetProject>(`/api/users/${user.value?.id}/projects/${projectId}`)
      activeProject.value = convertStringsToDates(response)
    } catch (error) {
      console.error('Failed to load project:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  async function fetchProjects() {
    try {
      isLoading.value = true
      const { user } = useUserSession()
      const response = await $fetch<GetProject[]>(`/api/users/${user.value?.id}/projects`)
      projectsList.value = response.map(project => convertStringsToDates(project))
    } catch (error) {
      console.error('Failed to load projects:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  async function createProject(project: ProjectToCreate) {
    try {
      isLoading.value = true
      const { user } = useUserSession()
      const response = await $fetch<GetProject>(`/api/users/${user.value?.id ?? -1}/projects`, {
        method: 'POST',
        body: project,
      })
      const newProject = convertStringsToDates(response)
      projectsList.value.push(newProject)
      return newProject
    } catch (error) {
      console.error('Failed to create project:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  async function updateProject(projectId: number, updates: Partial<GetProject>) {
    try {
      isLoading.value = true
      const { user } = useUserSession()
      const response = await $fetch<GetProject>(`/api/users/${user.value?.id}/projects/${projectId}`, {
        method: 'PATCH',
        body: updates,
      })
      const updatedProject = convertStringsToDates(response)

      // Update in lists if present
      const index = projectsList.value.findIndex(p => p.id === projectId)
      if (index !== -1) {
        projectsList.value[index] = updatedProject
      }

      // Update active project if it's the current one
      if (activeProject.value?.id === projectId) {
        activeProject.value = updatedProject
      }

      return updatedProject
    } catch (error) {
      console.error('Failed to update project:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  async function deleteProject(projectId: number) {
    try {
      isLoading.value = true
      const { user } = useUserSession()
      await $fetch(`/api/users/${user.value?.id}/projects/${projectId}`, {
        method: 'DELETE',
      })

      projectsList.value = projectsList.value.filter(p => p.id !== projectId)
      if (activeProject.value?.id === projectId) {
        activeProject.value = undefined
      }
    } catch (error) {
      console.error('Failed to delete project:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  function clearProject() {
    activeProject.value = undefined
  }

  return {
    activeProject,
    projectsList,
    isLoading,
    fetchProject,
    fetchProjects,
    createProject,
    updateProject,
    deleteProject,
    clearProject,
  }
}
