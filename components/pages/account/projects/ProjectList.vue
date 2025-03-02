<script setup lang="ts">
import type {
  GetGithubAppInstallation,
  GetProject,
  ReadChatConversation,
  ReadContextFile,
  ReadTemplateCollection,
  ReadUserFile,
} from '~/lib/types/database.tables/schema'
import { MoreVertical, Plus } from 'lucide-vue-next'
import {
  context_file_category,
  context_file_type,
  programming_language,
  project_type,
} from '~/lib/types/database.tables/schema'

const { $toast } = useNuxtApp()

interface FileUploadData {
  files: File[]
  category: ReadContextFile['category']
  file_type: ReadContextFile['file_type']
}

interface FileFormData {
  file: File
  customTitle: ReadContextFile['title']
  content: ReadContextFile['content']
  category: ReadContextFile['category']
  file_type: ReadContextFile['file_type']
}

const { projectsList, isLoading, fetchProjects, deleteProject, updateProject } = useProjects()
const {
  isLoading: isLoadingResources,
  imports,
  resources,
  availableResources,
  fetchImportsWithFiles,
  unlinkFile,
  updateFile,
  uploadFiles,
  deleteImport,
  createImport,
  fetchResources,
  fetchAvailableResources,
  linkResource,
  unlinkResource,
} = useProjectResources()
const showFreshProjectDialog = ref(false)
const route = useRoute()
const router = useRouter()

const projectTypes = project_type.enumValues
const programmingLanguages = programming_language.enumValues

const selectedProjectId = computed(() => {
  const id = route.query.project_id
  return id ? Number(id) : null
})

const selectedProject = computed(() => {
  return projectsList.value.find(p => p.id === selectedProjectId.value)
})

const editedProject = ref<GetProject | null>(null)

watch(selectedProject, (newProject) => {
  if (newProject) {
    editedProject.value = { ...newProject }
  } else {
    editedProject.value = null
  }
})

const newFileForm = ref<{
  files: FileFormData[]
  category: ReadContextFile['category']
  file_type: ReadContextFile['file_type']
}>({
  files: [] as FileFormData[],
  category: 'unknown',
  file_type: 'text',
})

const showNewFileDialog = ref(false)

const fileTypes = context_file_type.enumValues
const fileCategories = context_file_category.enumValues

const showEditFileDialog = ref(false)
const editingFile = ref<ReadContextFile | null>(null)
const editFileForm = ref<{
  title: ReadContextFile['title']
  content: ReadContextFile['content']
  category: ReadContextFile['category']
  file_type: ReadContextFile['file_type']
}>({
  title: '',
  content: '',
  category: 'unknown',
  file_type: 'text',
})

const showLinkResourceDialog = ref(false)
const selectedResourceType = ref<Parameters<typeof linkResource>[1] | null>(null)

async function openProjectDetails(project: GetProject) {
  router.push({ query: { project_id: project.id } })
  if (project.id) {
    await Promise.all([
      fetchImportsWithFiles(project.id),
      fetchResources(project.id, 'user-files'),
      fetchResources(project.id, 'template-collections'),
      fetchResources(project.id, 'github-installations'),
      fetchResources(project.id, 'chat-conversations'),
    ])
  }
}

function closeProjectDetails() {
  router.push({ query: {} })
}

async function handleUpdateProject() {
  if (!editedProject.value || !selectedProject.value) {
    return
  }

  try {
    await updateProject(selectedProject.value.id, {
      name: editedProject.value.name,
      description: editedProject.value.description,
      type: editedProject.value.type,
      main_language: editedProject.value.main_language,
    })
    $toast.success('Project updated successfully')
  } catch (error) {
    $toast.error('Failed to update project')
  }
}

async function handleDeleteProject(project: GetProject) {
  try {
    await deleteProject(project.id)
    closeProjectDetails()
    $toast.success('Project deleted successfully')
  } catch (error) {
    $toast.error('Failed to delete project')
  }
}

async function handleFileInput(event: Event) {
  const fileList = (event.target as HTMLInputElement).files
  if (!fileList) {
    return
  }

  newFileForm.value.files = await Promise.all(
    Array.from(fileList).map(async (file) => {
      const content = await file.text()

      return reactive({
        file,
        customTitle: file.name,
        content,
        category: newFileForm.value.category,
        file_type: newFileForm.value.file_type,
      }) as FileFormData
    }),
  )
}

async function handleCreateFile(): Promise<void> {
  const projectId = selectedProjectId.value
  if (!projectId || newFileForm.value.files.length === 0) {
    return Promise.resolve()
  }

  try {
    const importId = await createImport(projectId)
    const uploadPromises = newFileForm.value.files.map(async (fileData) => {
      const uploadData: FileUploadData = {
        files: [fileData.file],
        category: fileData.category || 'unknown',
        file_type: fileData.file_type,
      }
      await uploadFiles(projectId, uploadData as FileUploadData, importId)
    })

    await Promise.all(uploadPromises)
    showNewFileDialog.value = false
    newFileForm.value = {
      files: [],
      category: 'documentation',
      file_type: 'text',
    }
    $toast.success('Files uploaded successfully')
  } catch (error) {
    console.error('Upload error:', error)
    $toast.error('Failed to upload files')
    return Promise.reject(error)
  }
}

async function handleEditFile(file: ReadContextFile): Promise<void> {
  try {
    editingFile.value = file
    editFileForm.value = {
      title: file.title,
      content: file.content,
      category: file.category || 'unknown',
      file_type: file.file_type || 'text',
    }
    showEditFileDialog.value = true
    return Promise.resolve()
  } catch (error) {
    return Promise.reject(error)
  }
}

async function handleSaveFileEdit(): Promise<void> {
  if (!selectedProjectId.value || !editingFile.value) {
    return Promise.resolve()
  }

  try {
    await updateFile(selectedProjectId.value, editingFile.value.id, {
      title: editFileForm.value.title,
      content: editFileForm.value.content,
      category: editFileForm.value.category,
      file_type: editFileForm.value.file_type,
    })
    showEditFileDialog.value = false
    editingFile.value = null
    $toast.success('File updated successfully')
  } catch (error) {
    console.error('Update error:', error)
    $toast.error('Failed to update file')
    return Promise.reject(error)
  }
}

async function handleDeleteImport(importId: number): Promise<void> {
  const projectId = selectedProjectId.value
  if (!projectId) {
    return Promise.resolve()
  }
  try {
    await deleteImport(projectId, importId)
  } catch (error) {
    $toast.error('Failed to delete import')
    return Promise.reject(error)
  }
}

async function handleUnlinkFile(fileId: number): Promise<void> {
  const projectId = selectedProjectId.value
  if (!projectId) {
    return Promise.resolve()
  }
  try {
    await unlinkFile(projectId, fileId)
  } catch (error) {
    $toast.error('Failed to delete file')
    return Promise.reject(error)
  }
}

async function handleRefreshImports(): Promise<void> {
  const projectId = selectedProjectId.value
  if (!projectId) {
    return Promise.resolve()
  }
  try {
    await fetchImportsWithFiles(projectId)
  } catch (error) {
    $toast.error('Failed to refresh imports')
    return Promise.reject(error)
  }
}

async function handleProjectDelete(event: MouseEvent): Promise<void> {
  const project = selectedProject.value
  if (!project) {
    return Promise.resolve()
  }
  try {
    await handleDeleteProject(project)
  } catch (error) {
    $toast.error('Failed to delete project')
    return Promise.reject(error)
  }
}

async function handleShowLinkResourceDialog(resourceType: Parameters<typeof linkResource>[1]) {
  try {
    selectedResourceType.value = resourceType
    await fetchAvailableResources(resourceType)
    showLinkResourceDialog.value = true
  } catch (error) {
    console.error('Error fetching available resources:', error)
    $toast.error('Failed to fetch available resources')
  }
}

async function handleLinkResource(resourceId: number) {
  if (!selectedProjectId.value || !selectedResourceType.value) {
    return
  }

  try {
    const resourceData = {
      [selectedResourceType.value === 'user-files'
        ? 'user_file_id'
        : selectedResourceType.value === 'template-collections'
          ? 'template_collection_id'
          : selectedResourceType.value === 'github-installations'
            ? 'github_installation_id'
            : 'chat_conversation_id']: resourceId,
    } as ResourceToCreate

    await linkResource(selectedProjectId.value, selectedResourceType.value, resourceData)
    await fetchResources(selectedProjectId.value, selectedResourceType.value)
    $toast.success('Resource linked successfully')
    showLinkResourceDialog.value = false
  } catch (error) {
    console.error('Error linking resource:', error)
    $toast.error('Failed to link resource')
  }
}

async function handleUnlinkResource(resourceType: Parameters<typeof linkResource>[1], resourceId: number) {
  if (!selectedProjectId.value) {
    return
  }

  try {
    await unlinkResource(selectedProjectId.value, resourceType, resourceId)
    await fetchResources(selectedProjectId.value, resourceType)
    $toast.success('Resource unlinked successfully')
  } catch (error) {
    console.error('Error unlinking resource:', error)
    $toast.error('Failed to unlink resource')
  }
}

async function handleRefreshUserFiles(): Promise<void> {
  const projectId = selectedProjectId.value
  if (!projectId) {
    return
  }
  try {
    await fetchResources(projectId, 'user-files')
  } catch (error) {
    $toast.error('Failed to refresh user files')
  }
}

async function handleRefreshTemplateCollections(): Promise<void> {
  const projectId = selectedProjectId.value
  if (!projectId) {
    return
  }
  try {
    await fetchResources(projectId, 'template-collections')
  } catch (error) {
    $toast.error('Failed to refresh template collections')
  }
}

async function handleRefreshGithubInstallations(): Promise<void> {
  const projectId = selectedProjectId.value
  if (!projectId) {
    return
  }
  try {
    await fetchResources(projectId, 'github-installations')
  } catch (error) {
    $toast.error('Failed to refresh GitHub installations')
  }
}

async function handleRefreshChatConversations(): Promise<void> {
  const projectId = selectedProjectId.value
  if (!projectId) {
    return
  }
  try {
    await fetchResources(projectId, 'chat-conversations')
  } catch (error) {
    $toast.error('Failed to refresh chat conversations')
  }
}

onMounted(() => {
  fetchProjects()

  if (selectedProjectId.value) {
    handleRefreshImports()
    handleRefreshUserFiles()
    handleRefreshTemplateCollections()
    handleRefreshGithubInstallations()
    handleRefreshChatConversations()
  }
})
</script>

<template>
  <AccountSection>
    <template #header>
      <div class="flex justify-between items-center">
        <span>Projects</span>
        <ShadcnButton size="sm" @click="showFreshProjectDialog = true">
          <Plus class="mr-2 w-4 h-4" />
          New Project
        </ShadcnButton>
      </div>
    </template>
    <template #content>
      <div class="space-y-4">
        <InfoBlock
          :is-visible="isLoading"
          :show-loader="true"
          :show-dots="true"
        >
          Loading projects
        </InfoBlock>

        <InfoBlock
          :is-visible="!isLoading && projectsList.length === 0"
          :show-loader="false"
          :show-dots="false"
        >
          No projects yet. Create your first project to get started.
        </InfoBlock>

        <div v-if="!isLoading" class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div
            v-for="project in projectsList"
            :key="project.id"
            class="p-4 space-y-2 rounded-lg border"
          >
            <div class="flex justify-between items-start">
              <div>
                <h3 class="font-medium">
                  {{ project.name }}
                </h3>
                <p class="text-sm text-muted-foreground">
                  {{ project.description }}
                </p>
              </div>
              <ShadcnDropdownMenu>
                <ShadcnDropdownMenuTrigger as-child>
                  <ShadcnButton variant="ghost" size="sm">
                    <MoreVertical class="w-4 h-4" />
                  </ShadcnButton>
                </ShadcnDropdownMenuTrigger>
                <ShadcnDropdownMenuContent>
                  <ShadcnDropdownMenuItem @click="navigateTo(`/?project_id=${project.id}`)">
                    View Project
                  </ShadcnDropdownMenuItem>
                  <ShadcnDropdownMenuItem @click="openProjectDetails(project)">
                    View Details
                  </ShadcnDropdownMenuItem>
                  <ShadcnDropdownMenuSeparator />
                  <ShadcnDropdownMenuItem
                    class="text-destructive"
                    @click="handleDeleteProject(project)"
                  >
                    Delete Project
                  </ShadcnDropdownMenuItem>
                </ShadcnDropdownMenuContent>
              </ShadcnDropdownMenu>
            </div>
            <div class="flex gap-2">
              <ShadcnBadge>{{ project.type }}</ShadcnBadge>
              <ShadcnBadge variant="outline">
                {{ project.main_language }}
              </ShadcnBadge>
            </div>
          </div>
        </div>
      </div>
    </template>
  </AccountSection>

  <!-- Fresh Project Dialog -->
  <ShadcnDialog v-model:open="showFreshProjectDialog">
    <ShadcnDialogContent class="max-w-3xl">
      <ShadcnDialogHeader>
        <ShadcnDialogTitle>Create New Project</ShadcnDialogTitle>
        <ShadcnDialogDescription>
          Create a new project.
        </ShadcnDialogDescription>
      </ShadcnDialogHeader>

      <FreshProject />

      <ShadcnDialogFooter>
        <ShadcnButton variant="outline" @click="showFreshProjectDialog = false">
          Cancel
        </ShadcnButton>
      </ShadcnDialogFooter>
    </ShadcnDialogContent>
  </ShadcnDialog>

  <!-- Project Details Dialog -->
  <ShadcnDialog :open="!!selectedProjectId" @update:open="(open) => !open && closeProjectDetails()">
    <ShadcnDialogContent class="max-w-[1000px] h-[90vh] flex flex-col">
      <ShadcnDialogHeader class="flex-none px-2 pt-2">
        <ShadcnDialogTitle>Project Details</ShadcnDialogTitle>
        <ShadcnDialogDescription>
          View and edit your project details. Click save when you're done.
        </ShadcnDialogDescription>
      </ShadcnDialogHeader>

      <div class="flex flex-1 gap-6 py-4 min-h-0">
        <div v-if="editedProject" class="space-y-4 w-[320px]">
          <ShadcnScrollArea class="h-[calc(90vh-200px)]">
            <div class="flex flex-col gap-2 px-2">
              <div class="grid gap-2 items-center">
                <ShadcnLabel for="name">
                  Name
                </ShadcnLabel>
                <ShadcnInput
                  v-if="editedProject.name"
                  id="name"
                  v-model="editedProject.name"
                  placeholder="Project name"
                />
              </div>

              <div class="grid gap-2 items-center">
                <ShadcnLabel for="description">
                  Description
                </ShadcnLabel>
                <ShadcnTextarea
                  v-if="editedProject.description"
                  id="description"
                  v-model="editedProject.description"
                  placeholder="Project description"
                  rows="3"
                />
                <InfoBlock
                  :is-visible="!editedProject.description"
                  :show-loader="false"
                  :show-dots="false"
                >
                  No description yet.
                </InfoBlock>
              </div>

              <div class="grid gap-2 items-center">
                <ShadcnLabel for="type">
                  Project Type
                </ShadcnLabel>
                <ShadcnSelect v-if="editedProject.type" v-model="editedProject.type">
                  <ShadcnSelectTrigger>
                    <ShadcnSelectValue placeholder="Select project type..." />
                  </ShadcnSelectTrigger>
                  <ShadcnSelectContent>
                    <ShadcnSelectItem
                      v-for="type in projectTypes"
                      :key="type"
                      :value="type"
                    >
                      {{ type === 'web-site' ? 'Website'
                        : type === 'web-service' ? 'Web Service'
                          : type === 'web-app' ? 'Web Application' : type }}
                    </ShadcnSelectItem>
                  </ShadcnSelectContent>
                </ShadcnSelect>
              </div>

              <div class="grid gap-2 items-center">
                <ShadcnLabel for="language">
                  Main Language
                </ShadcnLabel>
                <ShadcnSelect v-if="editedProject.main_language" v-model="editedProject.main_language">
                  <ShadcnSelectTrigger>
                    <ShadcnSelectValue placeholder="Select programming language..." />
                  </ShadcnSelectTrigger>
                  <ShadcnSelectContent>
                    <ShadcnSelectItem
                      v-for="lang in programmingLanguages"
                      :key="lang"
                      :value="lang"
                    >
                      {{ lang.charAt(0).toUpperCase() + lang.slice(1) }}
                    </ShadcnSelectItem>
                  </ShadcnSelectContent>
                </ShadcnSelect>
              </div>

              <div class="grid grid-cols-2 gap-4 pt-2">
                <div class="space-y-1">
                  <p class="text-sm font-medium text-muted-foreground">
                    Created
                  </p>
                  <p class="text-sm">
                    {{ new Date(editedProject.created_at ?? '').toLocaleString() }}
                  </p>
                </div>
                <div class="space-y-1">
                  <p class="text-sm font-medium text-muted-foreground">
                    Last Updated
                  </p>
                  <p class="text-sm">
                    {{ new Date(editedProject.updated_at ?? '').toLocaleString() }}
                  </p>
                </div>
              </div>
            </div>
          </ShadcnScrollArea>
        </div>

        <div class="flex-1">
          <ShadcnScrollArea class="h-[calc(90vh-200px)]">
            <div class="pr-4">
              <div class="space-y-6">
                <div class="pt-6 pb-4">
                  <div class="flex justify-between items-center mb-4">
                    <h3 class="text-lg font-medium">
                      Project Context Imports
                    </h3>
                    <ShadcnButton size="sm" @click="showNewFileDialog = true">
                      <Plus class="mr-2 w-4 h-4" />
                      Import
                    </ShadcnButton>
                  </div>

                  <div class="space-y-4">
                    <div v-if="imports && imports.length > 0" class="space-y-4">
                      <div
                        v-for="import_ in imports"
                        :key="import_.id"
                        class="space-y-2"
                      >
                        <div class="flex justify-between items-center p-2 rounded-lg bg-muted">
                          <div>
                            <p class="font-medium">
                              {{ import_.source_path || 'Untitled Import' }}
                            </p>
                            <p class="text-sm text-muted-foreground">
                              {{ import_.source_type }} · {{ import_.created_at ? new Date(import_.created_at).toLocaleString() : 'Unknown date' }}
                            </p>
                          </div>
                          <AsyncButton
                            size="sm"
                            variant="destructive"
                            :on-click-async="(event: MouseEvent) => handleDeleteImport(import_.id)"
                          >
                            Delete Import
                          </AsyncButton>
                        </div>

                        <div v-if="import_.files && import_.files.length > 0" class="pl-4 space-y-2">
                          <div
                            v-for="file in import_.files"
                            :key="file.id"
                            class="flex justify-between items-center p-2 rounded-lg border"
                          >
                            <div>
                              <p class="font-medium">
                                {{ file.title }}
                              </p>
                              <p class="text-sm text-muted-foreground">
                                {{ file.category }} · {{ file.file_type }}
                                <span v-if="file.language">({{ file.language }})</span>
                              </p>
                            </div>
                            <div class="flex gap-2">
                              <AsyncButton
                                size="sm"
                                variant="outline"
                                :on-click-async="(event: MouseEvent) => handleEditFile(file)"
                              >
                                Edit
                              </AsyncButton>
                              <AsyncButton
                                size="sm"
                                variant="destructive"
                                :on-click-async="(event: MouseEvent) => handleUnlinkFile(file.id)"
                              >
                                Delete
                              </AsyncButton>
                            </div>
                          </div>
                        </div>
                        <InfoBlock
                          :is-visible="!import_.files.length"
                          :show-loader="false"
                          :show-dots="false"
                        >
                          No files in this import.
                        </InfoBlock>
                      </div>
                    </div>

                    <InfoBlock
                      :is-visible="!imports || imports.length === 0"
                      :show-loader="isLoadingResources"
                      :show-dots="isLoadingResources"
                    >
                      {{ isLoadingResources ? 'Loading imports...' : 'No imports in this project yet.' }}
                      <template #action>
                        <AsyncButton
                          v-if="!isLoadingResources && selectedProjectId"
                          size="sm"
                          variant="outline"
                          :on-click-async="handleRefreshImports"
                        >
                          Refresh
                        </AsyncButton>
                      </template>
                    </InfoBlock>
                  </div>
                </div>

                <!-- User Files -->
                <div class="pt-6 pb-4 border-t">
                  <div class="flex justify-between items-center mb-4">
                    <h3 class="text-lg font-medium">
                      User Files
                    </h3>
                    <ShadcnButton size="sm" @click="handleShowLinkResourceDialog('user-files')">
                      <Plus class="mr-2 w-4 h-4" />
                      Link File
                    </ShadcnButton>
                  </div>
                  <div class="space-y-4">
                    <div v-if="resources['user-files'].length > 0" class="space-y-2">
                      <div
                        v-for="file in resources['user-files']"
                        :key="file.id"
                        class="flex justify-between items-center p-2 rounded-lg border"
                      >
                        <div>
                          <p class="font-medium">
                            {{ file.title }}
                          </p>
                          <p class="text-sm text-muted-foreground">
                            {{ file.language }} · {{ file.extension }}
                          </p>
                        </div>
                        <AsyncButton
                          size="sm"
                          variant="destructive"
                          :on-click-async="() => handleUnlinkResource('user-files', file.id)"
                        >
                          Unlink
                        </AsyncButton>
                      </div>
                    </div>
                    <InfoBlock
                      :is-visible="resources['user-files'].length === 0"
                      :show-loader="isLoadingResources"
                      :show-dots="isLoadingResources"
                    >
                      {{ isLoadingResources ? 'Loading files...' : 'No files linked to this project.' }}
                      <template #action>
                        <AsyncButton
                          v-if="!isLoadingResources && selectedProjectId"
                          size="sm"
                          variant="outline"
                          :on-click-async="handleRefreshUserFiles"
                        >
                          Refresh
                        </AsyncButton>
                      </template>
                    </InfoBlock>
                  </div>
                </div>

                <!-- Template Collections -->
                <div class="pt-6 pb-4 border-t">
                  <div class="flex justify-between items-center mb-4">
                    <h3 class="text-lg font-medium">
                      Template Collections
                    </h3>
                    <ShadcnButton size="sm" @click="handleShowLinkResourceDialog('template-collections')">
                      <Plus class="mr-2 w-4 h-4" />
                      Link Collection
                    </ShadcnButton>
                  </div>
                  <div class="space-y-4">
                    <div v-if="resources['template-collections'].length > 0" class="space-y-2">
                      <div
                        v-for="collection in resources['template-collections']"
                        :key="collection.id"
                        class="flex justify-between items-center p-2 rounded-lg border"
                      >
                        <div>
                          <p class="font-medium">
                            {{ collection.name }}
                          </p>
                          <p class="text-sm text-muted-foreground">
                            {{ collection.description }}
                          </p>
                        </div>
                        <AsyncButton
                          size="sm"
                          variant="destructive"
                          :on-click-async="() => handleUnlinkResource('template-collections', collection.id)"
                        >
                          Unlink
                        </AsyncButton>
                      </div>
                    </div>
                    <InfoBlock
                      :is-visible="resources['template-collections'].length === 0"
                      :show-loader="isLoadingResources"
                      :show-dots="isLoadingResources"
                    >
                      {{ isLoadingResources ? 'Loading collections...' : 'No template collections linked to this project.' }}
                      <template #action>
                        <AsyncButton
                          v-if="!isLoadingResources && selectedProjectId"
                          size="sm"
                          variant="outline"
                          :on-click-async="handleRefreshTemplateCollections"
                        >
                          Refresh
                        </AsyncButton>
                      </template>
                    </InfoBlock>
                  </div>
                </div>

                <!-- GitHub Installations -->
                <div class="pt-6 pb-4 border-t">
                  <div class="flex justify-between items-center mb-4">
                    <h3 class="text-lg font-medium">
                      GitHub Installations
                    </h3>
                    <ShadcnButton size="sm" @click="handleShowLinkResourceDialog('github-installations')">
                      <Plus class="mr-2 w-4 h-4" />
                      Link Installation
                    </ShadcnButton>
                  </div>
                  <div class="space-y-4">
                    <div v-if="resources['github-installations'].length > 0" class="space-y-2">
                      <div
                        v-for="installation in resources['github-installations']"
                        :key="installation.id"
                        class="flex justify-between items-center p-2 rounded-lg border"
                      >
                        <div>
                          <p class="font-medium">
                            {{ installation.github_account_name }}
                          </p>
                          <p class="text-sm text-muted-foreground">
                            {{ installation.github_account_type }}
                          </p>
                        </div>
                        <AsyncButton
                          size="sm"
                          variant="destructive"
                          :on-click-async="() => handleUnlinkResource('github-installations', installation.id)"
                        >
                          Unlink
                        </AsyncButton>
                      </div>
                    </div>
                    <InfoBlock
                      :is-visible="resources['github-installations'].length === 0"
                      :show-loader="isLoadingResources"
                      :show-dots="isLoadingResources"
                    >
                      {{ isLoadingResources ? 'Loading installations...' : 'No GitHub installations linked to this project.' }}
                      <template #action>
                        <AsyncButton
                          v-if="!isLoadingResources && selectedProjectId"
                          size="sm"
                          variant="outline"
                          :on-click-async="handleRefreshGithubInstallations"
                        >
                          Refresh
                        </AsyncButton>
                      </template>
                    </InfoBlock>
                  </div>
                </div>

                <!-- Chat Conversations -->
                <div class="pt-6 pb-4 border-t">
                  <div class="flex justify-between items-center mb-4">
                    <h3 class="text-lg font-medium">
                      Chat Conversations
                    </h3>
                    <ShadcnButton size="sm" @click="handleShowLinkResourceDialog('chat-conversations')">
                      <Plus class="mr-2 w-4 h-4" />
                      Link Conversation
                    </ShadcnButton>
                  </div>
                  <div class="space-y-4">
                    <div v-if="resources['chat-conversations'].length > 0" class="space-y-2">
                      <div
                        v-for="conversation in resources['chat-conversations']"
                        :key="conversation.id"
                        class="flex justify-between items-center p-2 rounded-lg border"
                      >
                        <div>
                          <p class="font-medium">
                            {{ conversation.name }}
                          </p>
                          <p class="text-sm text-muted-foreground">
                            {{ conversation.model }}
                          </p>
                        </div>
                        <AsyncButton
                          size="sm"
                          variant="destructive"
                          :on-click-async="() => handleUnlinkResource('chat-conversations', conversation.id)"
                        >
                          Unlink
                        </AsyncButton>
                      </div>
                    </div>
                    <InfoBlock
                      :is-visible="resources['chat-conversations'].length === 0"
                      :show-loader="isLoadingResources"
                      :show-dots="isLoadingResources"
                    >
                      {{ isLoadingResources ? 'Loading conversations...' : 'No chat conversations linked to this project.' }}
                      <template #action>
                        <AsyncButton
                          v-if="!isLoadingResources && selectedProjectId"
                          size="sm"
                          variant="outline"
                          :on-click-async="handleRefreshChatConversations"
                        >
                          Refresh
                        </AsyncButton>
                      </template>
                    </InfoBlock>
                  </div>
                </div>
              </div>
            </div>
          </ShadcnScrollArea>
        </div>
      </div>

      <ShadcnDialogFooter class="flex-none">
        <AsyncButton
          variant="destructive"
          :on-click-async="handleProjectDelete"
        >
          Delete Project
        </AsyncButton>
        <div class="flex gap-2">
          <ShadcnButton variant="outline" @click="closeProjectDetails">
            Cancel
          </ShadcnButton>
          <AsyncButton
            :on-click-async="handleUpdateProject"
          >
            Save Changes
          </AsyncButton>
        </div>
      </ShadcnDialogFooter>
    </ShadcnDialogContent>
  </ShadcnDialog>

  <!-- New File Dialog -->
  <ShadcnDialog v-model:open="showNewFileDialog">
    <ShadcnDialogContent>
      <ShadcnDialogHeader>
        <ShadcnDialogTitle>Import Files</ShadcnDialogTitle>
        <ShadcnDialogDescription>
          Upload files to your project. You can select multiple files at once.
        </ShadcnDialogDescription>
      </ShadcnDialogHeader>

      <div class="py-4 space-y-4">
        <div class="grid gap-2 items-center">
          <ShadcnLabel for="files">
            Files
          </ShadcnLabel>
          <ShadcnInput
            id="files"
            type="file"
            multiple
            class="flex justify-center items-center p-4 w-full h-32 rounded-md border-2 border-dashed bg-secondary text-secondary-foreground border-primary"
            @change="handleFileInput"
          >
            <div class="flex justify-center items-center p-4 w-full h-full bg-secondary text-secondary-foreground">
              Drop files here or click to select...
            </div>
          </ShadcnInput>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div class="grid gap-2 items-center">
            <ShadcnLabel for="category">
              Category
            </ShadcnLabel>
            <ShadcnSelect v-if="newFileForm.category" v-model="newFileForm.category">
              <ShadcnSelectTrigger>
                <ShadcnSelectValue placeholder="Select file category..." />
              </ShadcnSelectTrigger>
              <ShadcnSelectContent>
                <ShadcnSelectItem
                  v-for="category in fileCategories"
                  :key="category"
                  :value="category"
                >
                  {{ category.charAt(0).toUpperCase() + category.slice(1) }}
                </ShadcnSelectItem>
              </ShadcnSelectContent>
            </ShadcnSelect>
          </div>

          <div class="grid gap-2 items-center">
            <ShadcnLabel for="type">
              File Type
            </ShadcnLabel>
            <ShadcnSelect v-if="newFileForm.file_type" v-model="newFileForm.file_type">
              <ShadcnSelectTrigger>
                <ShadcnSelectValue placeholder="Select file type..." />
              </ShadcnSelectTrigger>
              <ShadcnSelectContent>
                <ShadcnSelectItem
                  v-for="type in fileTypes"
                  :key="type"
                  :value="type"
                >
                  {{ type.charAt(0).toUpperCase() + type.slice(1) }}
                </ShadcnSelectItem>
              </ShadcnSelectContent>
            </ShadcnSelect>
          </div>
        </div>

        <!-- Show file preview -->
        <div v-if="newFileForm.files.length > 0" class="space-y-4">
          <ShadcnLabel>Files to Upload</ShadcnLabel>
          <ShadcnScrollArea class="h-[400px] pr-4">
            <div class="space-y-4">
              <div v-for="(fileData, index) in newFileForm.files" :key="fileData.file.name" class="p-4 space-y-4 rounded-lg border">
                <div class="flex justify-between items-center">
                  <span class="text-sm text-muted-foreground">
                    Original: {{ fileData.file.name }} ({{ Math.round(fileData.file.size / 1024) }}KB)
                  </span>
                </div>

                <div class="grid gap-2 items-center">
                  <ShadcnLabel :for="`file-${index}-title`">
                    Title
                  </ShadcnLabel>
                  <ShadcnInput
                    v-if="fileData.customTitle"
                    :id="`file-${index}-title`"
                    v-model="fileData.customTitle"
                    :placeholder="fileData.file.name"
                  />
                </div>

                <div class="grid grid-cols-2 gap-4">
                  <div class="grid gap-2 items-center">
                    <ShadcnLabel :for="`file-${index}-category`">
                      Category
                    </ShadcnLabel>
                    <ShadcnSelect v-if="fileData.category" v-model="fileData.category">
                      <ShadcnSelectTrigger>
                        <ShadcnSelectValue placeholder="Select category..." />
                      </ShadcnSelectTrigger>
                      <ShadcnSelectContent>
                        <ShadcnSelectItem
                          v-for="category in fileCategories"
                          :key="category"
                          :value="category"
                        >
                          {{ category.charAt(0).toUpperCase() + category.slice(1).replace('_', ' ') }}
                        </ShadcnSelectItem>
                      </ShadcnSelectContent>
                    </ShadcnSelect>
                  </div>

                  <div class="grid gap-2 items-center">
                    <ShadcnLabel :for="`file-${index}-type`">
                      File Type
                    </ShadcnLabel>
                    <ShadcnSelect v-if="fileData.file_type" v-model="fileData.file_type">
                      <ShadcnSelectTrigger>
                        <ShadcnSelectValue placeholder="Select type..." />
                      </ShadcnSelectTrigger>
                      <ShadcnSelectContent>
                        <ShadcnSelectItem
                          v-for="type in fileTypes"
                          :key="type"
                          :value="type"
                        >
                          {{ type.charAt(0).toUpperCase() + type.slice(1) }}
                        </ShadcnSelectItem>
                      </ShadcnSelectContent>
                    </ShadcnSelect>
                  </div>
                </div>

                <div class="grid gap-2 items-center">
                  <ShadcnLabel :for="`file-${index}-content`">
                    Content
                  </ShadcnLabel>
                  <ShadcnTextarea
                    v-if="fileData.content"
                    :id="`file-${index}-content`"
                    v-model="fileData.content"
                    :placeholder="`Content of ${fileData.file.name}`"
                    rows="5"
                  />
                </div>
              </div>
            </div>
          </ShadcnScrollArea>
        </div>
      </div>

      <ShadcnDialogFooter>
        <ShadcnButton
          variant="outline"
          @click="showNewFileDialog = false"
        >
          Cancel
        </ShadcnButton>
        <AsyncButton
          :disabled="newFileForm.files.length === 0"
          :on-click-async="handleCreateFile"
        >
          Upload Files
        </AsyncButton>
      </ShadcnDialogFooter>
    </ShadcnDialogContent>
  </ShadcnDialog>

  <!-- Edit File Dialog -->
  <ShadcnDialog v-model:open="showEditFileDialog">
    <ShadcnDialogContent>
      <ShadcnDialogHeader>
        <ShadcnDialogTitle>Edit File</ShadcnDialogTitle>
        <ShadcnDialogDescription>
          Edit the file details below.
        </ShadcnDialogDescription>
      </ShadcnDialogHeader>

      <div v-if="editingFile" class="py-4 space-y-4">
        <div class="grid gap-2 items-center">
          <ShadcnLabel for="edit-title">
            Title
          </ShadcnLabel>
          <ShadcnInput
            v-if="editFileForm.title"
            id="edit-title"
            v-model="editFileForm.title"
            placeholder="File title"
          />
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div class="grid gap-2 items-center">
            <ShadcnLabel for="edit-category">
              Category
            </ShadcnLabel>
            <ShadcnSelect v-if="editFileForm.category" v-model="editFileForm.category">
              <ShadcnSelectTrigger>
                <ShadcnSelectValue placeholder="Select category..." />
              </ShadcnSelectTrigger>
              <ShadcnSelectContent>
                <ShadcnSelectItem
                  v-for="category in fileCategories"
                  :key="category"
                  :value="category"
                >
                  {{ category.charAt(0).toUpperCase() + category.slice(1).replace('_', ' ') }}
                </ShadcnSelectItem>
              </ShadcnSelectContent>
            </ShadcnSelect>
          </div>

          <div class="grid gap-2 items-center">
            <ShadcnLabel for="edit-type">
              File Type
            </ShadcnLabel>
            <ShadcnSelect v-if="editFileForm.file_type" v-model="editFileForm.file_type">
              <ShadcnSelectTrigger>
                <ShadcnSelectValue placeholder="Select type..." />
              </ShadcnSelectTrigger>
              <ShadcnSelectContent>
                <ShadcnSelectItem
                  v-for="type in fileTypes"
                  :key="type"
                  :value="type"
                >
                  {{ type.charAt(0).toUpperCase() + type.slice(1) }}
                </ShadcnSelectItem>
              </ShadcnSelectContent>
            </ShadcnSelect>
          </div>
        </div>

        <div class="grid gap-2 items-center">
          <ShadcnLabel for="edit-content">
            Content
          </ShadcnLabel>
          <ShadcnTextarea
            v-if="editFileForm.content"
            id="edit-content"
            v-model="editFileForm.content"
            placeholder="File content"
            rows="10"
          />
        </div>
      </div>

      <ShadcnDialogFooter>
        <ShadcnButton
          variant="outline"
          @click="showEditFileDialog = false"
        >
          Cancel
        </ShadcnButton>
        <AsyncButton
          :on-click-async="handleSaveFileEdit"
        >
          Save Changes
        </AsyncButton>
      </ShadcnDialogFooter>
    </ShadcnDialogContent>
  </ShadcnDialog>

  <!-- Link Resource Dialog -->
  <ShadcnDialog v-model:open="showLinkResourceDialog">
    <ShadcnDialogContent class="grid grid-rows-[auto_1fr_auto] p-0 h-[90dvh]">
      <ShadcnDialogHeader class="p-6 pb-0">
        <ShadcnDialogTitle>Link {{ selectedResourceType?.replace('-', ' ') }}</ShadcnDialogTitle>
        <ShadcnDialogDescription>
          Select {{ selectedResourceType?.slice(0, -1).replace('-', ' ') }} to link to this project.
        </ShadcnDialogDescription>
      </ShadcnDialogHeader>

      <ShadcnScrollArea class="px-6 py-4">
        <div v-if="selectedResourceType && availableResources[selectedResourceType].length > 0" class="space-y-2">
          <div
            v-for="resource in availableResources[selectedResourceType]"
            :key="resource.id"
            class="flex justify-between items-center p-2 rounded-lg border"
          >
            <div>
              <!-- User Files -->
              <template v-if="selectedResourceType === 'user-files'">
                <p class="font-medium">
                  {{ (resource as ReadUserFile).title }}
                </p>
                <p class="text-sm text-muted-foreground">
                  {{ (resource as ReadUserFile).language }} · {{ (resource as ReadUserFile).extension }}
                </p>
              </template>

              <!-- Template Collections -->
              <template v-if="selectedResourceType === 'template-collections'">
                <p class="font-medium">
                  {{ (resource as ReadTemplateCollection).name }}
                </p>
                <p class="text-sm text-muted-foreground">
                  {{ (resource as ReadTemplateCollection).description }}
                </p>
              </template>

              <!-- GitHub Installations -->
              <template v-if="selectedResourceType === 'github-installations'">
                <p class="font-medium">
                  {{ (resource as GetGithubAppInstallation).github_account_name }}
                </p>
                <p class="text-sm text-muted-foreground">
                  {{ (resource as GetGithubAppInstallation).github_account_type }}
                </p>
              </template>

              <!-- Chat Conversations -->
              <template v-if="selectedResourceType === 'chat-conversations'">
                <p class="font-medium">
                  {{ (resource as ReadChatConversation).name }}
                </p>
                <p class="text-sm text-muted-foreground">
                  {{ (resource as ReadChatConversation).model }}
                </p>
              </template>
            </div>

            <AsyncButton
              size="sm"
              :disabled="resources[selectedResourceType].some(r => r.id === resource.id)"
              :on-click-async="async () => {
                if (selectedProjectId && selectedResourceType) {
                  const resourceId = (() => {
                    switch (selectedResourceType) {
                    case 'user-files':
                      return (resource as ReadUserFile).id
                    case 'template-collections':
                      return (resource as ReadTemplateCollection).id
                    case 'github-installations':
                      return (resource as GetGithubAppInstallation).id
                    case 'chat-conversations':
                      return (resource as ReadChatConversation).id
                    }
                  })()
                  await handleLinkResource(resourceId)
                  showLinkResourceDialog = false
                }
              }"
            >
              {{ resources[selectedResourceType].some(r => r.id === resource.id) ? 'Already Linked' : 'Link' }}
            </AsyncButton>
          </div>
        </div>

        <InfoBlock
          :is-visible="!selectedResourceType || availableResources[selectedResourceType].length === 0"
          :show-loader="isLoadingResources"
          :show-dots="isLoadingResources"
        >
          {{ isLoadingResources ? 'Loading resources...' : 'No resources available to link.' }}
        </InfoBlock>
      </ShadcnScrollArea>

      <ShadcnDialogFooter class="p-6 pt-0">
        <ShadcnButton
          variant="outline"
          @click="showLinkResourceDialog = false"
        >
          Close
        </ShadcnButton>
      </ShadcnDialogFooter>
    </ShadcnDialogContent>
  </ShadcnDialog>
</template>
