<script setup lang="ts">
import { Check, Circle, Dot } from 'lucide-vue-next';
import { get, set, useDropZone } from '@vueuse/core';
import { toast } from 'vue-sonner';

const stepIndex = ref(1);
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
    description: "That's it. You can now use the configurations.",
  },
];

const canGoNext = computed(() => stepIndex.value < steps.length);
const canGoBack = computed(() => stepIndex.value > 1);
function goNext() {
  if (get(canGoNext)) {
    set(stepIndex, stepIndex.value + 1);
  }
}
function goBack() {
  if (get(canGoBack)) {
    set(stepIndex, stepIndex.value - 1);
  }
}

const files = ref<File[]>([]);
const dropZoneRef = ref<HTMLDivElement>();
const { isOverDropZone } = useDropZone(dropZoneRef, {
  onDrop,
});

function onDrop(droppedFiles: File[] | null) {
  if (droppedFiles) {
    files.value = [...files.value, ...droppedFiles];
    updateInputFileValue();
  }
}

function onFileInput(event: Event) {
  const input = event.target as HTMLInputElement;
  if (input.files) {
    files.value = [...files.value, ...Array.from(input.files)];
    updateInputFileValue();
  }
}

const inputFileRef = ref<HTMLInputElement | null>(null);
function updateInputFileValue() {
  if (inputFileRef.value) {
    const dataTransfer = new DataTransfer();
    files.value.forEach((file) => dataTransfer.items.add(file));
    inputFileRef.value.files = dataTransfer.files;
  }
}

const allowedToGoNext = ref(true);
const doCreateFilesInGitRepository = ref(false);

function generateConfigurationFiles() {
  toast.error('Coming Soon...');
}
</script>

<template>
  <ShadcnStepper v-model="stepIndex" class="flex items-start w-full gap-2">
    <ShadcnStepperItem
      v-for="step in steps"
      :key="step.step"
      v-slot="{ state }"
      class="relative flex flex-col items-center justify-center w-full"
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
            state === 'active' &&
              'ring-2 ring-ring ring-offset-2 ring-offset-background',
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
      <p>Import Data</p>
      <ShadcnTabs default-value="local" class="w-full">
        <ShadcnTabsList class="flex justify-start flex-grow">
          <ShadcnTabsTrigger value="local"> Local </ShadcnTabsTrigger>
          <ShadcnTabsTrigger value="github"> Github </ShadcnTabsTrigger>
        </ShadcnTabsList>
        <ShadcnTabsContent value="local">
          <div class="flex flex-col gap-2 p-4 border rounded-md">
            <ShadcnInput
              type="file"
              multiple
              @change="onFileInput"
              class="flex items-center justify-center w-full h-32 p-4 border-2 border-dashed rounded-md bg-secondary text-secondary-foreground border-primary"
              ref="inputFileRef"
            >
              <div
                ref="dropZoneRef"
                class="flex items-center justify-center w-full h-full p-4 bg-secondary text-secondary-foreground"
              >
                Drop files here... ({{ isOverDropZone }})
              </div>
            </ShadcnInput>
            <div>
              <strong>Uploaded Files:</strong>
              <ShadcnScrollArea class="h-36">
                <div v-for="(file, index) in files" :key="index">
                  <p>Name: {{ file.name }}</p>
                  <p>Size: {{ file.size }}</p>
                  <p>Type: {{ file.type || 'Unknown' }}</p>
                  <p>Last modified: {{ file.lastModified }}</p>
                </div>
                <p v-if="files.length === 0">No files uploaded yet...</p>
              </ShadcnScrollArea>
            </div>
          </div>
        </ShadcnTabsContent>
        <ShadcnTabsContent value="github">
          <div class="flex flex-col gap-2 p-4 border rounded-md">
            <p>
              Coming Soon. See
              <NuxtLink
                class="underline hover:no-underline"
                target="_blank"
                :external="true"
                to="https://github.com/neptun-software/neptun.github.app"
                >here</NuxtLink
              >
              for more information.
            </p>
          </div>
        </ShadcnTabsContent>
      </ShadcnTabs>
    </template>

    <template v-if="stepIndex === 2">
      Provide More Context

      <ShadcnTextarea placeholder="Provide more context about the project" />
    </template>

    <template v-if="stepIndex === 3">
      <ShadcnLabel for="create-files-in-git-repository">
        Would you like me to add the generated files to your github repository?
      </ShadcnLabel>
      <ShadcnSwitch
        id="create-files-in-git-repository"
        v-model:checked="doCreateFilesInGitRepository"
      />

      <ShadcnSeparator />
    </template>
  </div>

  <div class="flex items-center justify-between mt-4">
    <ShadcnButton
      :disabled="!canGoBack"
      variant="outline"
      size="sm"
      @click="goBack"
    >
      Back
    </ShadcnButton>
    <div class="flex items-center gap-3">
      <ShadcnButton
        v-if="stepIndex !== 3"
        type="button"
        :disabled="!canGoNext"
        size="sm"
        @click="allowedToGoNext && goNext()"
      >
        Next
      </ShadcnButton>
      <ShadcnButton
        v-if="stepIndex === 3"
        size="sm"
        type="button"
        @click="generateConfigurationFiles"
      >
        Generate Configuration Files
      </ShadcnButton>
    </div>
  </div>
</template>

<style scoped></style>
