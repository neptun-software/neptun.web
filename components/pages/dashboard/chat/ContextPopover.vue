<script setup lang="ts">
import type { GetGithubAppInstallationRepository } from '~/lib/types/database.tables/schema'
import type { ConfigFile } from '~/server/api/github/(shared)/file'
import { AtSign } from 'lucide-vue-next'

const emit = defineEmits<{
  (e: 'contextAdded', context: string): void
}>()
const { $toast } = useNuxtApp()
const { user } = useUserSession()
const { console } = useLogger()
const { activeProject } = useProjects()

interface RepositoryContext {
  repository: string
  config_files: ConfigFile[]
}

type Repository = GetGithubAppInstallationRepository & {
  github_account_id: number
  github_account_name: string | null
}

const isLoading = ref(false)
const isLoadingRepos = ref(false)
const repositoryUrl = ref('')
const selectedProjectId = ref('')
const linkedRepositories = ref<Repository[]>([])
const isPublicRepo = ref(false)
const repoOwner = ref('')
const repoName = ref('')
const selectedRepo = ref<Repository | null>(null)

watch(selectedProjectId, (newId) => {
  if (!newId) {
    selectedRepo.value = null
    return
  }
  selectedRepo.value = linkedRepositories.value.find(repo => String(repo.id) === newId) || null
})

watch(repositoryUrl, (url) => {
  if (!url) {
    return
  }

  try {
    const parsedUrl = new URL(url)
    if (parsedUrl.hostname === 'github.com') {
      const pathParts = parsedUrl.pathname.split('/').filter(Boolean)
      if (pathParts.length >= 2) {
        repoOwner.value = pathParts[0]
        repoName.value = pathParts[1]
      }
    }
  } catch (error) {
    console.error('Invalid GitHub repository URL:', error)
  }
})

const isOpen = ref(false)

watch(isOpen, async (newValue) => {
  if (newValue && user.value?.id && activeProject.value) {
    await fetchLinkedRepositories()
  }
})

async function fetchLinkedRepositories() {
  if (!user.value?.id || !activeProject.value) {
    console.info('Skipping repository fetch - no user or active project', {
      userId: user.value?.id,
      activeProjectId: activeProject.value?.id,
      isUserLoggedIn: !!user.value,
    })
    return
  }

  isLoadingRepos.value = true
  try {
    console.info('Fetching repositories for project', {
      userId: user.value.id,
      projectId: activeProject.value.id,
      isUserLoggedIn: !!user.value,
    })
    const data = await $fetch(`/api/users/${user.value.id}/projects/${activeProject.value.id}/resources/github-repositories`)
    console.info('Received repositories:', data)
    linkedRepositories.value = data.repositories as Repository[]

    if (linkedRepositories.value.length > 0) {
      console.info('First repository data:', {
        id: linkedRepositories.value[0].id,
        github_repository_id: linkedRepositories.value[0].github_repository_id,
        github_app_installation_id: linkedRepositories.value[0].github_app_installation_id,
        github_account_id: linkedRepositories.value[0].github_account_id,
      })
    }
  } catch (error) {
    console.error('Failed to load linked repositories', error)
    $toast.error('Failed to load linked repositories')
  } finally {
    isLoadingRepos.value = false
  }
}

async function fetchPublicRepositoryContext() {
  if (!repoOwner.value || !repoName.value) {
    $toast.error('Invalid GitHub repository URL')
    return
  }

  isLoading.value = true
  try {
    const response = await $fetch(`/api/github/accounts/${repoOwner.value}/repositories/${repoName.value}/configuration-files`)

    addContextToChat(response)
    $toast.success('Repository context added')
  } catch (error) {
    console.error('Failed to fetch repository context', error)
    $toast.error('Failed to fetch repository context')
  } finally {
    isLoading.value = false
  }
}

async function fetchLinkedRepositoryContext(repo: Repository) {
  if (!repo.github_account_id || !repo.github_repository_id) {
    console.error('Missing required repository data', repo)
    return
  }

  console.log('Fetching linked repository context:', {
    accountId: repo.github_account_id,
    repoId: repo.github_repository_id,
    repoName: repo.github_repository_name,
    installationId: repo.github_app_installation_id,
  })

  isLoading.value = true
  try {
    const data = await $fetch<RepositoryContext>(
      `/api/github/app/accounts/${repo.github_account_id}/repositories/${repo.github_repository_id}/configuration-files`,
    )
    addContextToChat(data)
    $toast.success('Repository context added')
  } catch (error) {
    console.error('Failed to fetch repository context', error)
    $toast.error('Failed to fetch repository context')
  } finally {
    isLoading.value = false
  }
}

function addContextToChat(contextData: RepositoryContext) {
  const contextJson = JSON.stringify(contextData, null, 2)
  const contextString = `\n\n---\n\nRepository Context:\n\`\`\`json\n${contextJson}\n\`\`\``
  emit('contextAdded', contextString)
}

async function handleAddContext() {
  const repo = selectedRepo.value
  if (repo) {
    await fetchLinkedRepositoryContext(repo)
  }
}
</script>

<template>
  <ShadcnTooltipProvider>
    <ShadcnPopover v-model:open="isOpen">
      <ShadcnPopoverTrigger as-child>
        <ShadcnButton variant="ghost" size="icon">
          <ShadcnTooltip>
            <ShadcnTooltipTrigger as-child>
              <ShadcnButton variant="ghost" size="icon">
                <AtSign class="size-4" />
                <span class="sr-only">Add Context</span>
              </ShadcnButton>
            </ShadcnTooltipTrigger>
            <ShadcnTooltipContent side="top">
              Add Context
            </ShadcnTooltipContent>
          </ShadcnTooltip>
        </ShadcnButton>
      </ShadcnPopoverTrigger>
      <ShadcnPopoverContent class="w-80">
        <div class="space-y-4">
          <h4 class="font-medium leading-none">
            Add Repository Context
          </h4>
          <p class="text-sm text-muted-foreground">
            Add configuration information from a GitHub repository
          </p>

          <div class="grid gap-2">
            <ShadcnTabs :default-value="activeProject ? 'linked' : 'public'" class="w-full">
              <ShadcnTabsList class="grid grid-cols-2 w-full">
                <ShadcnTabsTrigger value="public" @click="isPublicRepo = true">
                  Public Repo
                </ShadcnTabsTrigger>
                <ShadcnTooltip>
                  <ShadcnTooltipTrigger as-child>
                    <div class="w-full">
                      <ShadcnTabsTrigger class="w-full" value="linked" :disabled="!activeProject" @click="isPublicRepo = false">
                        Linked Repo
                      </ShadcnTabsTrigger>
                    </div>
                  </ShadcnTooltipTrigger>
                  <ShadcnTooltipContent v-if="!activeProject" side="top">
                    Please select a project to access linked repositories.
                  </ShadcnTooltipContent>
                </ShadcnTooltip>
              </ShadcnTabsList>
              <ShadcnTabsContent value="public" class="space-y-4">
                <div class="space-y-2">
                  <ShadcnLabel for="repoUrl">
                    GitHub Repository URL
                  </ShadcnLabel>
                  <ShadcnInput
                    id="repoUrl"
                    v-model="repositoryUrl"
                    placeholder="https://github.com/owner/repo"
                    type="url"
                  />
                  <p v-if="repoOwner && repoName" class="text-xs text-muted-foreground">
                    Will fetch context for {{ repoOwner }}/{{ repoName }}
                  </p>
                </div>
                <AsyncButton
                  class="w-full"
                  :is-disabled="!repositoryUrl"
                  :is-loading="isLoading"
                  :on-click-async="fetchPublicRepositoryContext"
                >
                  Add Context
                </AsyncButton>
              </ShadcnTabsContent>
              <ShadcnTabsContent value="linked" class="space-y-4">
                <div v-if="!activeProject" class="p-4 text-sm text-center rounded-md border text-muted-foreground">
                  Please select a project to view linked repositories
                </div>
                <template v-else>
                  <div class="space-y-2">
                    <ShadcnLabel for="linkedRepo">
                      Select Repository
                    </ShadcnLabel>
                    <ShadcnSelect v-model="selectedProjectId">
                      <ShadcnSelectTrigger class="w-full">
                        <div class="w-[200px] overflow-hidden text-left">
                          <ShadcnSelectValue placeholder="Select a repository">
                            <template #default>
                              <span class="truncate">{{ selectedRepo?.github_repository_name }}</span>
                            </template>
                          </ShadcnSelectValue>
                        </div>
                      </ShadcnSelectTrigger>
                      <ShadcnSelectContent>
                        <ShadcnSelectItem
                          v-for="repo in linkedRepositories"
                          :key="repo.id"
                          :value="String(repo.id)"
                          class="flex gap-1 items-center pr-2"
                        >
                          <div class="truncate">
                            {{ repo.github_repository_name || 'Unknown Repository' }}
                          </div>
                          <span v-if="repo.github_account_name" class="text-xs text-muted-foreground shrink-0">
                            ({{ repo.github_account_name }})
                          </span>
                        </ShadcnSelectItem>
                        <div v-if="linkedRepositories.length === 0 && !isLoadingRepos" class="p-2 text-sm text-muted-foreground">
                          No linked repositories found
                        </div>
                        <div v-if="isLoadingRepos" class="p-2 text-sm text-muted-foreground">
                          Loading repositories...
                        </div>
                      </ShadcnSelectContent>
                    </ShadcnSelect>
                  </div>
                  <AsyncButton
                    :is-disabled="!selectedProjectId"
                    :is-loading="isLoading"
                    :on-click-async="handleAddContext"
                    class="w-full"
                  >
                    Add Context
                  </AsyncButton>
                </template>
              </ShadcnTabsContent>
            </ShadcnTabs>
          </div>
        </div>
      </ShadcnPopoverContent>
    </ShadcnPopover>
  </ShadcnTooltipProvider>
</template>
