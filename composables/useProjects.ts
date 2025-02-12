import type { GetProject } from '~/lib/types/database.tables/schema'
import { convertStringsToDates } from '~/utils/formatters'

export function useProjects() {
  const activeProject = useState<GetProject | undefined>('active-project', () => undefined)
  const projectsList = useState<GetProject[]>('projects-list', () => [])
  const isLoading = useState<boolean>('projects-loading', () => false)

  async function fetchProject(projectId: number) {
    if (!projectId) return

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

  function clearProject() {
    activeProject.value = undefined
  }

  return {
    activeProject,
    projectsList,
    isLoading,
    fetchProject,
    fetchProjects,
    clearProject
  }
}
