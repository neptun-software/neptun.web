<script setup lang="ts">
import type { TemplateCollectionWithTemplates } from './types'
import type { TemplateCollectionToCreate, TemplateToCreate, UserFileToCreate } from '~/lib/types/database.tables/schema'
import {
  Trash2,
} from 'lucide-vue-next'

const { session } = useUserSession()
const {
  collections,
  fetchStatus,
  fetchError,
  createNewCollection,
  readCollections,
  updateCollection,
  deleteCollection,
  createTemplate,
  updateTemplate,
  deleteTemplate,
} = useTemplateManager()

const isUpdating = ref(false)

const showNewCollectionDialog = ref(false)
const newCollection = ref<Omit<TemplateCollectionToCreate, | 'description'> & { description?: string }>({
  name: '',
  description: '',
  is_shared: true,
  neptun_user_id: session.value.user?.id ?? -1,
})

const editingCollection = ref<number | null>(null)
const sharedStates = ref(new Map<number, boolean>())

const showNewTemplateDialog = ref(false)
const selectedCollectionId = ref<number | null>(null)

interface ExtendedFile extends File {
  customTitle?: string
  description?: string
}

const files = ref<ExtendedFile[]>([])
const inputFileRef = ref<HTMLInputElement | null>(null)
const dropZoneRef = ref<HTMLDivElement>()

const { isOverDropZone } = useDropZone(dropZoneRef, {
  onDrop,
})

function onDrop(droppedFiles: File[] | null) {
  if (droppedFiles) {
    files.value = [...files.value, ...droppedFiles]
    updateInputFileValue()
  }
}

function onFileInput(event: Event) {
  const input = event.target as HTMLInputElement
  if (input.files) {
    files.value = [...files.value, ...Array.from(input.files)]
    updateInputFileValue()
  }
}

function updateInputFileValue() {
  if (inputFileRef.value) {
    const dataTransfer = new DataTransfer()
    files.value.forEach(file => dataTransfer.items.add(file))
    inputFileRef.value.files = dataTransfer.files
  }
}

function draftNewTemplate(collection: TemplateCollectionWithTemplates) {
  selectedCollectionId.value = collection.id
  showNewTemplateDialog.value = true
  files.value = []
}

async function handleCreateTemplate() {
  if (!selectedCollectionId.value || files.value.length === 0) {
    return
  }

  try {
    isUpdating.value = true

    for (const file of files.value) {
      const fileContent = await file.text()

      const fileData: UserFileToCreate = {
        title: file.customTitle || file.name,
        text: fileContent,
        neptun_user_id: session.value.user?.id ?? -1,
        language: file.type || 'text',
        extension: file.name.split('.').pop() || 'txt',
      }

      const templateData: TemplateToCreate = {
        file_name: file.name,
        description: file.description || '',
        template_collection_id: selectedCollectionId.value,
        neptun_user_id: session.value.user?.id ?? -1,
      }

      await createTemplate(selectedCollectionId.value, templateData, fileData)
    }

    showNewTemplateDialog.value = false
    files.value = []
  } catch (error) {
    console.error('Failed to create template!')
  } finally {
    isUpdating.value = false
  }
}

watch(() => collections.value, (newCollections) => {
  newCollections.forEach((collection) => {
    if (!sharedStates.value.has(collection.id)) {
      sharedStates.value.set(collection.id, collection.is_shared)
    }
  })
}, { immediate: true })

async function toggleShared(collection: TemplateCollectionWithTemplates) {
  const currentState = sharedStates.value.get(collection.id) ?? collection.is_shared
  const newState = !currentState

  sharedStates.value.set(collection.id, newState)

  if (isUpdating.value) {
    return
  }

  isUpdating.value = true
  try {
    await updateCollection(collection.share_uuid, {
      name: collection.name,
      description: collection.description,
      is_shared: newState,
      neptun_user_id: session.value.user?.id ?? -1,
    })
  } finally {
    isUpdating.value = false
  }
}

async function handleSave(collection: TemplateCollectionWithTemplates) {
  if (isUpdating.value) {
    return
  }

  isUpdating.value = true
  try {
    await updateCollection(collection.share_uuid, {
      name: collection.name,
      description: collection.description,
      is_shared: collection.is_shared,
      neptun_user_id: session.value.user?.id ?? -1,
    })
    editingCollection.value = null
  } finally {
    isUpdating.value = false
  }
}

async function handleDelete(shareUuid: string) {
  isUpdating.value = true
  try {
    await deleteCollection(shareUuid)
  } finally {
    isUpdating.value = false
  }
}

function startEditing(collection: TemplateCollectionWithTemplates, event?: MouseEvent) {
  event?.stopPropagation()

  if (editingCollection.value === collection.id) {
    return
  }

  editingCollection.value = collection.id
}

function handleBlur(event: FocusEvent, collection: TemplateCollectionWithTemplates) {
  setTimeout(() => {
    const relatedTarget = event.relatedTarget as HTMLElement | null
    const editContainer = (event.target as HTMLElement)?.closest('.edit-container')

    if (relatedTarget && editContainer?.contains(relatedTarget)) {
      return
    }

    if (editingCollection.value === collection.id) {
      editingCollection.value = null
    }
  }, 100)
}

function resetNewCollection() {
  newCollection.value = {
    name: '',
    description: '',
    is_shared: true,
    neptun_user_id: session.value.user?.id ?? -1,
  }
}

onMounted(() => {
  void readCollections()
})
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <h2 class="text-2xl font-bold">
        Your Template Collections
      </h2>
      <ShadcnButton @click="showNewCollectionDialog = true">
        New Collection
      </ShadcnButton>
    </div>

    <InfoBlock
      show-loader
      show-dots
      :is-visible="fetchStatus === 'pending'"
      class="my-2 mb-0"
    >
      Loading collections
    </InfoBlock>

    <!-- Collections List -->
    <div class="grid gap-4">
      <div v-auto-animate class="space-y-4">
        <div
          v-for="collection in collections"
          :key="`${collection.id}-${collection.share_uuid}`"
          class="p-4 space-y-2 border rounded-lg"
        >
          <div class="flex items-center justify-between gap-2">
            <div class="flex-1 px-2 pt-2 pb-3 rounded-md bg-secondary">
              <div
                v-if="editingCollection === collection.id"
                class="edit-container"
              >
                <div class="flex items-start justify-between gap-2">
                  <div class="flex-1">
                    <ShadcnInput
                      v-model="collection.name"
                      class="mb-1 text-lg font-semibold"
                      :disabled="isUpdating"
                      :autofocus="editingCollection === collection.id"
                      @keyup.enter="handleSave(collection)"
                      @blur="(e: FocusEvent) => handleBlur(e, collection)"
                    />
                    <ShadcnTextarea
                      v-model="collection.description"
                      :rows="2"
                      class="text-sm resize-none"
                      :disabled="isUpdating"
                      @keyup.enter="handleSave(collection)"
                      @blur="(e: FocusEvent) => handleBlur(e, collection)"
                    />
                  </div>
                  <div class="flex gap-2">
                    <ShadcnButton
                      variant="outline"
                      :disabled="isUpdating"
                    >
                      Add Template
                    </ShadcnButton>
                    <ShadcnButton
                      variant="destructive"
                      size="icon"
                      :disabled="isUpdating"
                      @click="() => handleDelete(collection.share_uuid)"
                    >
                      <Trash2 class="size-3.5" />
                    </ShadcnButton>
                  </div>
                </div>
              </div>
              <div
                v-else
                class="flex items-center justify-between gap-2"
              >
                <div class="flex-1">
                  <div
                    class="flex flex-col gap-2 cursor-pointer"
                    @click="(e) => !isUpdating && startEditing(collection, e)"
                  >
                    <div>{{ collection.name }}</div>
                    <div class="text-sm text-muted-foreground">
                      {{ collection.description }}
                    </div>
                  </div>
                  <div class="flex items-center gap-2 mt-2">
                    <ShadcnCheckbox
                      :checked="sharedStates.get(collection.id) ?? collection.is_shared"
                      :disabled="isUpdating"
                      @update:checked="() => toggleShared(collection)"
                    />
                    <ShadcnLabel class="text-xs text-muted-foreground">
                      Public
                    </ShadcnLabel>
                  </div>
                </div>
                <div class="flex gap-2">
                  <ShadcnButton
                    variant="outline"
                    :disabled="isUpdating"
                    @click="() => draftNewTemplate(collection)"
                  >
                    Add Template
                  </ShadcnButton>
                  <ShadcnButton
                    variant="destructive"
                    size="icon"
                    :disabled="isUpdating"
                    @click="() => handleDelete(collection.share_uuid)"
                  >
                    <Trash2 class="size-3.5" />
                  </ShadcnButton>
                </div>
              </div>
            </div>
          </div>
          <MutatableTemplates
            :templates="collection.templates"
            :is-updating="isUpdating"
            :on-update="updateTemplate"
            :on-delete="deleteTemplate"
          />
        </div>
        <InfoBlock
          :is-visible="collections.length === 0"
          :show-dots="false"
          :show-loader="false"
        >
          No collections found.
        </InfoBlock>
      </div>
    </div>

    <div v-if="fetchError" class="text-center text-red-500">
      Something went wrong...
      <DevOnly>
        {{ fetchError.message }}
      </DevOnly>
    </div>

    <!-- New Collection Dialog -->
    <ShadcnDialog v-model:open="showNewCollectionDialog">
      <ShadcnDialogContent>
        <ShadcnDialogHeader>
          <ShadcnDialogTitle>Create New Collection</ShadcnDialogTitle>
        </ShadcnDialogHeader>
        <div class="space-y-4">
          <div class="space-y-2">
            <ShadcnLabel for="name">
              Name
            </ShadcnLabel>
            <ShadcnInput id="name" v-model="newCollection.name" />
          </div>
          <div class="space-y-2">
            <ShadcnLabel for="description">
              Description
            </ShadcnLabel>
            <ShadcnTextarea id="description" v-model="newCollection.description" />
          </div>
          <div class="flex items-center space-x-2">
            <ShadcnCheckbox
              id="is_shared"
              :checked="newCollection.is_shared"
              @update:checked="newCollection.is_shared = $event"
            />
            <ShadcnLabel for="is_shared">
              Share publicly
            </ShadcnLabel>
          </div>
        </div>
        <ShadcnDialogFooter>
          <ShadcnButton variant="outline" @click="showNewCollectionDialog = false">
            Cancel
          </ShadcnButton>
          <ShadcnButton
            :disabled="!newCollection.name"
            @click="async () => {
              await createNewCollection(newCollection).then(() => {
                showNewCollectionDialog = false
                resetNewCollection()
              })
            }"
          >
            Create
          </ShadcnButton>
        </ShadcnDialogFooter>
      </ShadcnDialogContent>
    </ShadcnDialog>

    <!-- Add New Template Dialog -->
    <ShadcnDialog v-model:open="showNewTemplateDialog">
      <ShadcnDialogContent>
        <ShadcnDialogHeader>
          <ShadcnDialogTitle>Add New Template</ShadcnDialogTitle>
        </ShadcnDialogHeader>

        <div class="space-y-4">
          <!-- File Upload -->
          <div class="flex flex-col gap-2 p-4 border rounded-md">
            <ShadcnInput
              ref="inputFileRef"
              type="file"
              multiple
              class="flex items-center justify-center w-full h-32 p-4 border-2 border-dashed rounded-md bg-secondary text-secondary-foreground border-primary"
              @change="onFileInput"
            >
              <div
                ref="dropZoneRef"
                class="flex items-center justify-center w-full h-full p-4 bg-secondary text-secondary-foreground"
              >
                Drop files here... ({{ isOverDropZone }})
              </div>
            </ShadcnInput>

            <!-- File List -->
            <div>
              <strong>Selected Files:</strong>
              <ShadcnScrollArea class="h-36">
                <div v-for="(file, index) in files" :key="index" class="px-1 py-2 space-y-2">
                  <!-- File Details -->
                  <div class="space-y-2">
                    <ShadcnInput
                      v-model="file.customTitle"
                      :placeholder="file.name"
                      label="Title"
                    />
                    <ShadcnTextarea
                      v-model="file.description"
                      placeholder="Enter description..."
                      label="Description"
                      :rows="2"
                    />
                    <div class="text-sm text-muted-foreground">
                      <p>Size: {{ file.size }}</p>
                      <p>Type: {{ file.type || 'Unknown' }}</p>
                      <p>Last modified: {{ new Date(file.lastModified).toLocaleString() }}</p>
                    </div>
                  </div>
                  <ShadcnSeparator v-if="index < files.length - 1" class="my-2" />
                </div>
                <p v-if="files.length === 0">
                  No files selected yet...
                </p>
              </ShadcnScrollArea>
            </div>
          </div>
        </div>

        <ShadcnDialogFooter>
          <ShadcnButton
            variant="outline"
            @click="showNewTemplateDialog = false"
          >
            Cancel
          </ShadcnButton>
          <ShadcnButton
            :disabled="files.length === 0 || isUpdating"
            @click="handleCreateTemplate"
          >
            Create Template
          </ShadcnButton>
        </ShadcnDialogFooter>
      </ShadcnDialogContent>
    </ShadcnDialog>
  </div>
</template>

<style scoped></style>
