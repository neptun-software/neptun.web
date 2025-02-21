<script setup lang="ts">
import { useProjectResources } from '@/composables/useProjectResources'
import { useProjects } from '@/composables/useProjects'
import { get, set, useDropZone } from '@vueuse/core'
import { Check, Circle, Dot, Import, Info, X } from 'lucide-vue-next'
import { toast } from 'vue-sonner'

const IS_DEV = process.env.NODE_ENV === 'development'

const stepIndex = ref(1)
const steps = [
  {
    step: 1,
    title: 'Files',
    description: 'Import project files from github or local.',
  },
  {
    step: 2,
    title: 'Context',
    description: 'Provide some context about the project.',
  },
  {
    step: 3,
    title: 'Done!',
    description: 'That\'s it. You can now use the configurations.',
  },
]

const canGoNext = computed(() => stepIndex.value < steps.length)
const canGoBack = computed(() => stepIndex.value > 1)
function goNext() {
  if (get(canGoNext)) {
    set(stepIndex, stepIndex.value + 1)
  }
}
function goBack() {
  if (get(canGoBack)) {
    set(stepIndex, stepIndex.value - 1)
  }
}

const files = ref<File[]>([])
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

const inputFileRef = ref<HTMLInputElement | null>(null)
function updateInputFileValue() {
  if (inputFileRef.value) {
    const dataTransfer = new DataTransfer()
    files.value.forEach(file => dataTransfer.items.add(file))
    inputFileRef.value.files = dataTransfer.files
  }
}

const allowedToGoNext = ref(true)
const doCreateFilesInGitRepository = ref(false)

const projectContext = ref('')
const isUploading = ref(false)

const { uploadFiles } = useProjectResources()
const { createProject } = useProjects()
const { user } = useUserSession()

function removeFile(index: number) {
  files.value.splice(index, 1)
  updateInputFileValue()
}

async function generateConfigurationFiles() {
  try {
    isUploading.value = true

    if (files.value.length === 0) {
      toast.error('Please upload at least one file')
      return
    }

    if (!projectContext.value.trim()) {
      toast.error('Please provide project context')
      return
    }

    const userId = user.value?.id
    if (!userId) {
      toast.error('User not found')
      return
    }

    const project = await createProject({
      name: 'New Project',
      description: projectContext.value,
      type: 'web-app',
      main_language: 'typescript',
      neptun_user_id: userId,
    })

    await uploadFiles(project.id, {
      files: files.value,
      category: 'documentation',
      file_type: 'text',
    })

    toast.success('Project created successfully')

    await new Promise(resolve => setTimeout(resolve, 250))
    navigateTo(`/?project_id=${project.id}`)
  } catch (error) {
    console.error('Failed to generate project:', error)
    if (error instanceof Error) {
      toast.error(`Failed to generate project: ${error.message}`)
    } else {
      toast.error('Failed to generate project')
    }
  } finally {
    isUploading.value = false
  }
}

const isStepValid = computed(() => {
  switch (stepIndex.value) {
    case 1:
      return files.value.length > 0
    case 2:
      return projectContext.value.trim().length > 0
    default:
      return true
  }
})

watch(isStepValid, (valid) => {
  allowedToGoNext.value = valid
})
</script>

<template>
  <ShadcnStepper v-model="stepIndex" class="flex gap-2 items-start w-full">
    <ShadcnStepperItem
      v-for="step in steps"
      :key="step.step"
      v-slot="{ state }"
      class="flex relative flex-col justify-center items-center w-full"
      :step="step.step"
    >
      <ShadcnStepperSeparator
        v-if="step.step !== steps[steps.length - 1].step"
        class="absolute left-[calc(50%+20px)] right-[calc(-50%+10px)] top-5 block h-0.5 shrink-0 rounded-full bg-muted group-data-[state=completed]:bg-primary"
      />

      <ShadcnStepperTrigger as-child>
        <ShadcnButton
          :variant="
            state === 'completed' || state === 'active' ? 'default' : 'outline'
          "
          size="icon"
          class="z-10 rounded-full shrink-0"
          :class="[
            state === 'active'
              && 'ring-2 ring-ring ring-offset-2 ring-offset-background',
          ]"
          :disabled="state !== 'completed' && !allowedToGoNext"
        >
          <Check v-if="state === 'completed'" class="size-5" />
          <Circle v-if="state === 'active'" />
          <Dot v-if="state === 'inactive'" />
        </ShadcnButton>
      </ShadcnStepperTrigger>

      <div class="flex flex-col items-center mt-5 text-center">
        <ShadcnStepperTitle
          :class="[state === 'active' && 'text-primary']"
          class="font-semibold transition text-md lg:text-base"
        >
          {{ step.title }}
        </ShadcnStepperTitle>
        <ShadcnStepperDescription
          :class="[state === 'active' && 'text-primary']"
          class="text-xs transition sr-only text-muted-foreground md:not-sr-only lg:text-sm"
        >
          {{ step.description }}
        </ShadcnStepperDescription>
      </div>
    </ShadcnStepperItem>
  </ShadcnStepper>

  <div class="flex flex-col gap-4 mt-4">
    <template v-if="stepIndex === 1">
      <p class="my-2 text-sm text-center text-muted-foreground">
        Upload your project files or import them from GitHub to get started.
      </p>
      <ShadcnTabs default-value="local" class="w-full">
        <ShadcnTabsList class="flex flex-grow justify-start">
          <ShadcnTabsTrigger value="local">
            Local Files
          </ShadcnTabsTrigger>
          <ShadcnTabsTrigger value="github">
            GitHub Repository
          </ShadcnTabsTrigger>
        </ShadcnTabsList>
        <ShadcnTabsContent value="local">
          <div class="flex flex-col gap-2 p-4 rounded-md border">
            <ShadcnInput
              ref="inputFileRef"
              type="file"
              multiple
              class="flex justify-center items-center p-4 w-full h-32 rounded-md border-2 border-dashed bg-secondary text-secondary-foreground"
              :class="[
                isOverDropZone ? 'border-primary bg-primary/5' : 'border-primary/50',
              ]"
              @change="onFileInput"
            >
              <div
                ref="dropZoneRef"
                class="flex flex-col justify-center items-center p-4 w-full h-full bg-secondary text-secondary-foreground"
                :class="{ 'drop-active': isOverDropZone }"
              >
                <p class="mb-2 font-medium">
                  {{ isOverDropZone ? 'Drop files here...' : 'Drop files here or click to select' }}
                </p>
                <p class="text-sm text-muted-foreground">
                  Upload your project files to get started
                </p>
              </div>
            </ShadcnInput>
            <div v-if="files.length > 0" class="mt-4">
              <div class="flex justify-between items-center mb-2">
                <strong class="text-sm">Uploaded Files:</strong>
                <ShadcnButton variant="ghost" size="sm" @click="files = []">
                  Clear All
                </ShadcnButton>
              </div>
              <ShadcnScrollArea class="p-2 w-full h-36 rounded-md border">
                <div class="space-y-2">
                  <div v-for="(file, index) in files" :key="index" class="flex justify-between items-center p-2 rounded-md bg-muted">
                    <div class="flex-1 min-w-0">
                      <p class="text-sm font-medium truncate">
                        {{ file.name }}
                      </p>
                      <p class="text-xs text-muted-foreground">
                        {{ (file.size / 1024).toFixed(1) }} KB
                      </p>
                    </div>
                    <ShadcnButton variant="ghost" size="icon" @click="removeFile(index)">
                      <span class="sr-only">Remove file</span>
                      <X class="w-4 h-4" />
                    </ShadcnButton>
                  </div>
                </div>
              </ShadcnScrollArea>
            </div>
            <InfoBlock v-else :is-visible="true" :show-loader="false" :show-dots="false">
              No files uploaded yet
            </InfoBlock>
          </div>
        </ShadcnTabsContent>
        <ShadcnTabsContent value="github">
          <div class="p-4 rounded-md border">
            <NuxtLink
              target="_blank"
              :to="IS_DEV ? 'https://github.com/apps/neptun-github-app-dev' : 'https://github.com/apps/neptun-github-app'"
              :external="true"
            >
              <ShadcnButton variant="outline" size="sm" :disabled="true" class="gap-1.5 w-full text-sm truncate">
                Import GitHub Repository
                <Import class="size-4" />
              </ShadcnButton>
            </NuxtLink>
          </div>
        </ShadcnTabsContent>
      </ShadcnTabs>
    </template>

    <template v-if="stepIndex === 2">
      <div class="space-y-4">
        <div>
          <p class="mb-2 text-sm font-medium">
            Project Context
          </p>
          <p class="mb-4 text-sm text-muted-foreground">
            Provide additional context about your project to help us better understand its requirements.
          </p>
          <ShadcnTextarea
            v-model="projectContext"
            placeholder="Describe your project, its goals, and any specific requirements..."
            :rows="6"
          />
        </div>
      </div>
    </template>

    <template v-if="stepIndex === 3">
      <div class="space-y-4">
        <div class="p-4 bg-blue-50 rounded-lg">
          <h3 class="mb-2 font-medium">
            Configuration Summary
          </h3>
          <div class="space-y-1">
            <p>Files to process: {{ files.length }}</p>
            <p>Context provided: {{ projectContext ? 'Yes' : 'No' }}</p>
          </div>
        </div>

        <div class="flex justify-between items-center">
          <div class="space-y-1">
            <div class="flex gap-2 items-center">
              <span>Add generated files to GitHub repository</span>
              <ShadcnTooltipProvider>
                <ShadcnTooltip>
                  <ShadcnTooltipTrigger as-child>
                    <button type="button" class="cursor-help">
                      <Info class="w-4 h-4 text-muted-foreground" />
                    </button>
                  </ShadcnTooltipTrigger>
                  <ShadcnTooltipContent side="top" align="center" class="max-w-[300px]">
                    <p>We'll create a pull request with the generated configuration files in your GitHub repository.</p>
                  </ShadcnTooltipContent>
                </ShadcnTooltip>
              </ShadcnTooltipProvider>
            </div>
            <p class="text-sm text-muted-foreground">
              If enabled, we'll create a pull request with the generated configuration files in your GitHub repository.
            </p>
          </div>
          <ShadcnSwitch
            id="create-files-in-git-repository"
            v-model:checked="doCreateFilesInGitRepository"
            :disabled="true"
          />
        </div>
      </div>
    </template>
  </div>

  <div class="flex justify-between items-center mt-4">
    <ShadcnButton
      :disabled="!canGoBack"
      variant="outline"
      size="sm"
      @click="goBack"
    >
      Back
    </ShadcnButton>
    <div class="flex gap-3 items-center">
      <AsyncButton
        v-if="stepIndex !== 3"
        :disabled="!canGoNext || !isStepValid"
        size="sm"
        :loading="isUploading"
        @click="allowedToGoNext && goNext()"
      >
        Next
      </AsyncButton>

      <AsyncButton
        v-if="stepIndex === 3"
        size="sm"
        :loading="isUploading"
        :on-click-async="generateConfigurationFiles"
      >
        Generate Project
      </AsyncButton>
    </div>
  </div>
</template>

<style scoped>
.drop-active {
  @apply border-primary/50 bg-primary/5;
}
</style>
