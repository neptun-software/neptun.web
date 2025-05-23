<script setup lang="ts">
import type { ImportedTemplateData, TemplateCollectionWithTemplates } from './types'
import type { TemplateCollectionToCreate, TemplateToCreate, UserFileToCreate } from '~/lib/types/database.tables/schema'

import {
  Trash2,
} from 'lucide-vue-next'
import { uploadTemplateZip } from './functions'

const { $toast } = useNuxtApp()

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
const newCollection = ref<Omit<TemplateCollectionToCreate, 'description'> & { description?: string }>({
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
const $inputFileElement = ref<HTMLInputElement | null>(null)
const $dropZoneElement = ref<HTMLDivElement>()

const { isOverDropZone } = useDropZone($dropZoneElement, {
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
  if ($inputFileElement.value) {
    const dataTransfer = new DataTransfer()
    files.value.forEach(file => dataTransfer.items.add(file))
    $inputFileElement.value.files = dataTransfer.files
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
    await updateCollection(collection.id, {
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
    await updateCollection(collection.id, {
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

async function handleDelete(id: number) {
  isUpdating.value = true
  try {
    await deleteCollection(id)
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

const requestUrl = useRequestURL()

const $uploadCollectionInput = ref<HTMLInputElement | null>(null)
async function handleUploadCollection(data: ImportedTemplateData) {
  try {
    isUpdating.value = true
    const newCollection = await createNewCollection({
      name: data.name,
      description: '',
      is_shared: true,
      neptun_user_id: session.value.user?.id ?? -1,
    })

    await nextTick()

    if (!newCollection) {
      $toast.error('Failed to import collection!')
      return
    }

    for (const template of data.templates) {
      if (!template) {
        continue
      }

      const fileData: UserFileToCreate = {
        title: template.title,
        text: template.text,
        neptun_user_id: session.value.user?.id ?? -1,
        language: template.language,
        extension: template.extension,
      }

      const templateData: TemplateToCreate = {
        file_name: template.file_name,
        template_collection_id: newCollection.id,
        neptun_user_id: session.value.user?.id ?? -1,
      }

      await createTemplate(newCollection.id, templateData, fileData)
    }
  } catch (error) {
    console.error('Failed to upload collection:', error)
  } finally {
    isUpdating.value = false
  }
}
</script>

<template>
  <div class="space-y-4">
    <div class="flex justify-between items-center">
      <h2 class="text-2xl font-bold">
        Your Template Collections
      </h2>
      <div class="flex gap-2 items-center">
        <input
          ref="$uploadCollectionInput"
          type="file"
          class="hidden"
          accept=".zip"
          @change="async (e) => {
            const file = (e.target as HTMLInputElement).files?.[0]
            if (!file) return

            try {
              isUpdating = true
              const data = await uploadTemplateZip(file)
              await handleUploadCollection(data)
              $toast.success('Templates imported successfully!')
            }
            catch (error) {
              console.error('Failed to import templates:', error)
              $toast.error('Failed to import templates!')
            }
            finally {
              isUpdating = false
              if ($uploadCollectionInput) {
                $uploadCollectionInput.value = ''
              }
            }
          }"
        >
        <ShadcnButton
          variant="outline"
          :disabled="isUpdating"
          @click="() => { if ($uploadCollectionInput) $uploadCollectionInput.click() }"
        >
          Import Collection Zip
        </ShadcnButton>
        <ShadcnButton @click="showNewCollectionDialog = true">
          New Collection
        </ShadcnButton>
      </div>
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
          class="p-4 space-y-2 rounded-lg border"
        >
          <div class="flex gap-2 justify-between items-center">
            <div class="flex-1 px-2 pt-2 pb-3 rounded-md bg-secondary">
              <div
                v-if="editingCollection === collection.id"
                class="edit-container"
              >
                <div class="flex gap-2 justify-between items-start">
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
                      @click="() => handleDelete(collection.id)"
                    >
                      <Trash2 class="size-3.5" />
                    </ShadcnButton>
                  </div>
                </div>
              </div>
              <div
                v-else
                class="flex gap-2 justify-between items-center"
              >
                <div class="flex-1">
                  <div
                    class="flex flex-col gap-2 cursor-pointer"
                    @click="(e) => !isUpdating && startEditing(collection, e)"
                  >
                    <div>{{ collection.name }}</div>
                    <div class="text-sm whitespace-pre-wrap text-muted-foreground">
                      {{ collection.description }}
                    </div>
                  </div>
                  <div class="flex gap-2 items-center mt-2">
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
                    @click="() => handleDelete(collection.id)"
                  >
                    <Trash2 class="size-3.5" />
                  </ShadcnButton>
                </div>
              </div>
            </div>
          </div>
          <CollectionTemplateListMutable
            :templates="collection.templates"
            :is-updating="isUpdating"
            :on-update="updateTemplate"
            :on-delete="deleteTemplate"
          />
          <div v-if="collection.is_shared" class="flex gap-2 items-center px-2 py-1 rounded-sm border bg-accent">
            {{ `http${IS_DEV ? '' : 's'}://${requestUrl.host}/shared/collections/${collection.share_uuid}` }}
            <CopyToClipboard :text="`http${IS_DEV ? '' : 's'}://${requestUrl.host}/shared/collections/${collection.share_uuid}`" />
          </div>
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
          <div class="flex flex-col gap-2 p-4 rounded-md border">
            <ShadcnInput
              ref="$inputFileElement"
              type="file"
              multiple
              class="flex justify-center items-center p-4 w-full h-32 rounded-md border-2 border-dashed bg-secondary text-secondary-foreground border-primary"
              @change="onFileInput"
            >
              <div
                ref="$dropZoneElement"
                class="flex justify-center items-center p-4 w-full h-full bg-secondary text-secondary-foreground"
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
