<script setup lang="ts">
import type { FileTemplate } from './types'
import { Pencil, Trash2 } from 'lucide-vue-next'

interface SafeFileTemplate extends FileTemplate {
  title: string
  description: string
  language: string
  extension: string
  template_collection_id: number
  user_file_id: number
}

const props = defineProps<{
  templates: FileTemplate[]
  isUpdating: boolean
  onUpdate: (id: number, data: any) => Promise<void>
  onDelete: (id: number) => Promise<void>
}>()

const { session } = useUserSession()

const editingTemplate = ref<number | null>(null)
const editForm = ref<Partial<SafeFileTemplate> | null>(null)

function startEditing(template: FileTemplate) {
  editingTemplate.value = template.id
  editForm.value = {
    ...template,
    title: template.title || template.file_name,
    description: template.description || '',
    language: template.language || 'text',
    extension: template.extension || 'txt',
    template_collection_id: template.template_collection_id || undefined,
    user_file_id: template.user_file_id || undefined,
  }
}

async function handleSave() {
  if (!editForm.value || !editingTemplate.value) {
    return
  }

  await props.onUpdate(editingTemplate.value, {
    description: editForm.value.description,
    file_name: editForm.value.file_name,
    file: {
      title: editForm.value.title,
      text: editForm.value.text || '',
      language: editForm.value.language,
      extension: editForm.value.extension,
      neptun_user_id: session.value.user?.id ?? -1,
    },
  })

  editingTemplate.value = null
  editForm.value = null
}
</script>

<template>
  <ShadcnScrollArea v-if="templates.length > 0" class="mt-4">
    <div v-auto-animate class="space-y-2 max-h-[33vh]">
      <div
        v-for="template in templates"
        :key="template.id"
        class="p-3 rounded-md border"
      >
        <div v-if="editingTemplate === template.id && editForm">
          <div class="space-y-2">
            <ShadcnInput
              v-model="editForm.file_name"
              placeholder="File name"
              :disabled="isUpdating"
            />
            <ShadcnInput
              v-model="editForm.title"
              placeholder="Title"
              :disabled="isUpdating"
            />
            <ShadcnTextarea
              v-model="editForm.description"
              placeholder="Description"
              :disabled="isUpdating"
              :rows="2"
            />
            <!-- TODO: Use monaco editor here -->
            <ShadcnTextarea
              v-model="editForm.text"
              placeholder="Template content"
              :disabled="isUpdating"
              :rows="8"
            />
            <div class="flex gap-2 items-center">
              <!-- TODO: make me a select with search -->
              <ShadcnInput
                v-model="editForm.language"
                placeholder="Language"
                :disabled="isUpdating"
              />
              <ShadcnInput
                v-model="editForm.extension"
                placeholder="Extension"
                :disabled="isUpdating"
              />
            </div>
            <div class="flex gap-2 justify-end">
              <ShadcnButton
                variant="outline"
                size="sm"
                :disabled="isUpdating"
                @click="editingTemplate = null"
              >
                Cancel
              </ShadcnButton>
              <ShadcnButton
                size="sm"
                :disabled="isUpdating"
                @click="handleSave"
              >
                Save
              </ShadcnButton>
            </div>
          </div>
        </div>
        <div v-else class="flex justify-between items-start">
          <div>
            <h4 class="font-medium">
              {{ template.title || template.file_name }}
            </h4>
            <p class="text-sm text-muted-foreground">
              {{ template.description }}
            </p>
            <div class="mt-1 text-xs text-muted-foreground">
              {{ template.language }} | {{ template.extension }}
            </div>
          </div>
          <div class="flex gap-2">
            <ShadcnButton
              variant="secondary"
              size="icon"
              :disabled="isUpdating"
              @click="startEditing(template)"
            >
              <Pencil class="size-4" />
            </ShadcnButton>
            <ShadcnButton
              variant="destructive"
              size="icon"
              :disabled="isUpdating"
              @click="() => onDelete(template.id)"
            >
              <Trash2 class="size-4" />
            </ShadcnButton>
          </div>
        </div>
      </div>
    </div>
    <ShadcnScrollBar orientation="vertical" />
  </ShadcnScrollArea>
  <p v-else class="text-sm text-muted-foreground">
    No templates in this collection
  </p>
</template>
