<script setup lang="ts">
import type { GetProject, ReadContextFile } from '~/lib/types/database.tables/schema'
import { MoreVertical, Plus } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import { context_file_category, context_file_type, programming_language, project_type } from '~/lib/types/database.tables/schema'

interface FileUploadData {
  files: File[]
  category: typeof context_file_category.enumValues[number]
  file_type: typeof context_file_type.enumValues[number]
}

interface FileFormData {
  file: File
  customTitle: string
  content: string
  category: typeof context_file_category.enumValues[number]
  file_type: typeof context_file_type.enumValues[number]
}

const { projectsList, isLoading, fetchProjects, deleteProject, updateProject } = useProjects()
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

const {
  isLoading: isLoadingResources,
  imports,
  fetchImportsWithFiles,
  unlinkFile,
  updateFile,
  uploadFiles,
  deleteImport,
  createImport,
} = useProjectResources()

const newFileForm = ref({
  files: [] as FileFormData[],
  category: 'documentation' as typeof context_file_category.enumValues[number],
  file_type: 'text' as typeof context_file_type.enumValues[number],
})

const showNewFileDialog = ref(false)

const fileTypes = context_file_type.enumValues
const fileCategories = context_file_category.enumValues

const showEditFileDialog = ref(false)
const editingFile = ref<ReadContextFile | null>(null)
const editFileForm = ref({
  title: '',
  content: '',
  category: '' as typeof context_file_category.enumValues[number],
  file_type: '' as typeof context_file_type.enumValues[number],
})

async function openProjectDetails(project: GetProject) {
  router.push({ query: { project_id: project.id } })
  if (project.id) {
    await fetchImportsWithFiles(project.id)
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
    toast.success('Project updated successfully')
  } catch (error) {
    toast.error('Failed to update project')
  }
}

async function handleDeleteProject(project: GetProject) {
  try {
    await deleteProject(project.id)
    closeProjectDetails()
    toast.success('Project deleted successfully')
  } catch (error) {
    toast.error('Failed to delete project')
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
        category: fileData.category,
        file_type: fileData.file_type,
      }
      await uploadFiles(projectId, uploadData, importId)
    })

    await Promise.all(uploadPromises)
    showNewFileDialog.value = false
    newFileForm.value = {
      files: [],
      category: 'documentation',
      file_type: 'text',
    }
    toast.success('Files uploaded successfully')
  } catch (error) {
    console.error('Upload error:', error)
    toast.error('Failed to upload files')
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
    toast.success('File updated successfully')
  } catch (error) {
    console.error('Update error:', error)
    toast.error('Failed to update file')
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
    toast.error('Failed to delete import')
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
    toast.error('Failed to delete file')
    return Promise.reject(error)
  }
}

async function handleRefreshImports(event: MouseEvent): Promise<void> {
  const projectId = selectedProjectId.value
  if (!projectId) {
    return Promise.resolve()
  }
  try {
    await fetchImportsWithFiles(projectId)
  } catch (error) {
    toast.error('Failed to refresh imports')
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
    toast.error('Failed to delete project')
    return Promise.reject(error)
  }
}

onMounted(() => {
  fetchProjects()
})
</script>

<template>
  <AccountSection>
    <template #header>
      <div class="flex items-center justify-between">
        <span>Projects</span>
        <ShadcnButton size="sm" @click="showFreshProjectDialog = true">
          <Plus class="w-4 h-4 mr-2" />
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
            class="p-4 space-y-2 border rounded-lg"
          >
            <div class="flex items-start justify-between">
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
    <ShadcnDialogContent class="sm:max-w-[500px] grid grid-rows-[auto_1fr_auto] p-0 h-[90dvh]">
      <ShadcnDialogHeader class="p-6 pb-0">
        <ShadcnDialogTitle>Project Details</ShadcnDialogTitle>
        <ShadcnDialogDescription>
          View and edit your project details. Click save when you're done.
        </ShadcnDialogDescription>
      </ShadcnDialogHeader>

      <ShadcnScrollArea class="px-6 py-4">
        <div v-if="editedProject" class="space-y-4">
          <div class="grid items-center gap-2">
            <ShadcnLabel for="name">
              Name
            </ShadcnLabel>
            <ShadcnInput
              id="name"
              v-model="editedProject.name"
              placeholder="Project name"
            />
          </div>

          <div class="grid items-center gap-2">
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

          <div class="grid items-center gap-2">
            <ShadcnLabel for="type">
              Project Type
            </ShadcnLabel>
            <ShadcnSelect v-model="editedProject.type">
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

          <div class="grid items-center gap-2">
            <ShadcnLabel for="language">
              Main Language
            </ShadcnLabel>
            <ShadcnSelect v-model="editedProject.main_language">
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

          <div class="pt-6 border-t">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-medium">
                Project Context Imports
              </h3>
              <ShadcnButton size="sm" @click="showNewFileDialog = true">
                <Plus class="w-4 h-4 mr-2" />
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
                  <div class="flex items-center justify-between p-2 rounded-lg bg-muted">
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
                      class="flex items-center justify-between p-2 border rounded-lg"
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
                    :is-visible="!import_.files?.length"
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
        </div>
      </ShadcnScrollArea>

      <ShadcnDialogFooter class="gap-2 p-6 pt-0 sm:gap-1">
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
        <div class="grid items-center gap-2">
          <ShadcnLabel for="files">
            Files
          </ShadcnLabel>
          <ShadcnInput
            id="files"
            type="file"
            multiple
            class="flex items-center justify-center w-full h-32 p-4 border-2 border-dashed rounded-md bg-secondary text-secondary-foreground border-primary"
            @change="handleFileInput"
          >
            <div class="flex items-center justify-center w-full h-full p-4 bg-secondary text-secondary-foreground">
              Drop files here or click to select...
            </div>
          </ShadcnInput>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div class="grid items-center gap-2">
            <ShadcnLabel for="category">
              Category
            </ShadcnLabel>
            <ShadcnSelect v-model="newFileForm.category">
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

          <div class="grid items-center gap-2">
            <ShadcnLabel for="type">
              File Type
            </ShadcnLabel>
            <ShadcnSelect v-model="newFileForm.file_type">
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
              <div v-for="(fileData, index) in newFileForm.files" :key="fileData.file.name" class="p-4 space-y-4 border rounded-lg">
                <div class="flex items-center justify-between">
                  <span class="text-sm text-muted-foreground">
                    Original: {{ fileData.file.name }} ({{ Math.round(fileData.file.size / 1024) }}KB)
                  </span>
                </div>

                <div class="grid items-center gap-2">
                  <ShadcnLabel :for="`file-${index}-title`">
                    Title
                  </ShadcnLabel>
                  <ShadcnInput
                    :id="`file-${index}-title`"
                    v-model="fileData.customTitle"
                    :placeholder="fileData.file.name"
                  />
                </div>

                <div class="grid grid-cols-2 gap-4">
                  <div class="grid items-center gap-2">
                    <ShadcnLabel :for="`file-${index}-category`">
                      Category
                    </ShadcnLabel>
                    <ShadcnSelect v-model="fileData.category">
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

                  <div class="grid items-center gap-2">
                    <ShadcnLabel :for="`file-${index}-type`">
                      File Type
                    </ShadcnLabel>
                    <ShadcnSelect v-model="fileData.file_type">
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

                <div class="grid items-center gap-2">
                  <ShadcnLabel :for="`file-${index}-content`">
                    Content
                  </ShadcnLabel>
                  <ShadcnTextarea
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
        <div class="grid items-center gap-2">
          <ShadcnLabel for="edit-title">
            Title
          </ShadcnLabel>
          <ShadcnInput
            id="edit-title"
            v-model="editFileForm.title"
            placeholder="File title"
          />
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div class="grid items-center gap-2">
            <ShadcnLabel for="edit-category">
              Category
            </ShadcnLabel>
            <ShadcnSelect v-model="editFileForm.category">
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

          <div class="grid items-center gap-2">
            <ShadcnLabel for="edit-type">
              File Type
            </ShadcnLabel>
            <ShadcnSelect v-model="editFileForm.file_type">
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

        <div class="grid items-center gap-2">
          <ShadcnLabel for="edit-content">
            Content
          </ShadcnLabel>
          <ShadcnTextarea
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
</template>
