<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import { get, set } from '@vueuse/core'
import { Check, Circle, Dot } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import * as z from 'zod'

const isLoading = ref(false)
const { user } = useUserSession()

const formSchema = [
  z.object({
    'project-type': z.union([
      z.literal('web-site', {
        message:
          'No project type selected. Project type is required. Possible values: Website, Webservice or Webapp.',
      }),
      z.literal('web-service'),
      z.literal('web-app'),
    ]),
  }),
  z.object({
    'project-language': z.union([
      z.literal('typescript', {
        message:
          'No project type selected. Project type is required. Possible values: Typescript, Javascript, PHP, Go, Python, Java, Kotlin, Ruby or Elixir.',
      }),
      z.literal('javascript'),
      z.literal('php'),
      z.literal('go'),
      z.literal('python'),
      z.literal('java'),
      z.literal('kotlin'),
      z.literal('ruby'),
      z.literal('elixir'),
    ]),
  }),
]

const stepIndex = ref(1)
const steps = [
  {
    step: 1,
    title: 'Type',
    description: 'Choose the type of project.',
  },
  {
    step: 2,
    title: 'Language',
    description: 'Choose a preferred programming language.',
  },
  {
    step: 3,
    title: 'Done!',
    description: 'That\'s it. You can now start coding.',
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

async function createProject(data: {
  'project-type': string
  'project-language': string
}) {
  try {
    isLoading.value = true
    const response = await $fetch(`/api/users/${user.value?.id ?? -1}/projects`, {
      method: 'POST',
      body: {
        name: `New ${data['project-type']} Project`,
        description: `A ${data['project-type']} project created from Neptun AI`,
        type: data['project-type'],
        main_language: data['project-language'],
        neptun_user_id: user.value?.id ?? -1,
      },
    })

    toast.success('Project created successfully!', {
      description: 'You will be redirected to your new project.',
    })

    await new Promise(resolve => setTimeout(resolve, 250))
    navigateTo(`/?project_id=${response.id}`)
  } catch (error: any) {
    console.error('Failed to create project:', error)
    toast.error('Failed to create project', {
      description: error?.data?.message || error?.message || 'An unexpected error occurred',
    })
  } finally {
    isLoading.value = false
  }
}

async function onSubmit(values: any) {
  if (stepIndex.value === steps.length) {
    await createProject(values)
  } else {
    toast('You submitted the following values:', {
      description: h(
        'pre',
        {
          class:
            'mt-2 w-fit max-w-full overflow-x-auto rounded-md bg-slate-950 p-2',
        },
        h('code', { class: 'text-white' }, JSON.stringify(values, null, 2)),
      ),
    })
  }
}

const doCreateGitRepository = ref(false)
</script>

<template>
  <ShadcnForm
    v-slot="{ meta, values, validate }"
    as=""
    keep-values
    :validation-schema="toTypedSchema(formSchema[stepIndex - 1])"
  >
    <form
      @submit="
        (e) => {
          e.preventDefault();
          validate();

          if (stepIndex === steps.length) {
            onSubmit(values);
          }
        }
      "
    >
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
                state === 'completed' || state === 'active'
                  ? 'default'
                  : 'outline'
              "
              size="icon"
              class="z-10 rounded-full shrink-0"
              :class="[
                state === 'active'
                  && 'ring-2 ring-ring ring-offset-2 ring-offset-background',
              ]"
              :disabled="state !== 'completed' && !meta.valid"
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
          <ShadcnFormField v-slot="{ componentField }" name="project-type">
            <ShadcnFormItem>
              <ShadcnFormLabel>Project Type</ShadcnFormLabel>

              <!-- TODO: ask AI about project type -->

              <ShadcnSelect v-bind="componentField">
                <ShadcnFormControl>
                  <ShadcnSelectTrigger>
                    <ShadcnSelectValue placeholder="Select a project type" />
                  </ShadcnSelectTrigger>
                </ShadcnFormControl>
                <ShadcnSelectContent>
                  <ShadcnSelectGroup>
                    <ShadcnSelectItem value="web-site">
                      Website. (static or dynamic)
                    </ShadcnSelectItem>
                    <ShadcnSelectItem value="web-service">
                      Microservice, hosted on the internet. (web-service)
                    </ShadcnSelectItem>
                    <ShadcnSelectItem value="web-app">
                      Multi-Platform App (web-app, desktop-app & mobile-app in
                      one (web-based)).
                    </ShadcnSelectItem>
                  </ShadcnSelectGroup>
                </ShadcnSelectContent>
              </ShadcnSelect>
              <ShadcnFormMessage />
            </ShadcnFormItem>
          </ShadcnFormField>
        </template>

        <template v-if="stepIndex === 2">
          <ShadcnFormField v-slot="{ componentField }" name="project-language">
            <ShadcnFormItem>
              <ShadcnFormLabel>Preferred Programming Language</ShadcnFormLabel>

              <!-- TODO: ask AI about preferred programming language -->

              <ShadcnSelect v-bind="componentField">
                <ShadcnFormControl>
                  <ShadcnSelectTrigger>
                    <ShadcnSelectValue
                      placeholder="Select a preferred programming language"
                    />
                  </ShadcnSelectTrigger>
                </ShadcnFormControl>
                <ShadcnSelectContent>
                  <ShadcnSelectGroup>
                    <ShadcnSelectItem value="typescript">
                      Typescript (recommended<!-- TODO, make me dynamic, depending on project type -->)
                    </ShadcnSelectItem>
                    <ShadcnSelectItem value="javascript">
                      Javascript
                    </ShadcnSelectItem>
                    <ShadcnSelectItem value="php">
                      PHP
                    </ShadcnSelectItem>
                    <ShadcnSelectItem value="go">
                      Go
                    </ShadcnSelectItem>
                    <ShadcnSelectItem value="python">
                      Python
                    </ShadcnSelectItem>
                    <ShadcnSelectItem value="java">
                      Java
                    </ShadcnSelectItem>
                    <ShadcnSelectItem value="kotlin">
                      Kotlin
                    </ShadcnSelectItem>
                    <ShadcnSelectItem value="ruby">
                      Ruby
                    </ShadcnSelectItem>
                    <ShadcnSelectItem value="elixir">
                      Elixir
                    </ShadcnSelectItem>
                  </ShadcnSelectGroup>
                </ShadcnSelectContent>
              </ShadcnSelect>
              <ShadcnFormMessage />
            </ShadcnFormItem>
          </ShadcnFormField>
        </template>

        <template v-if="stepIndex === 3">
          This is your configuration:
          <span class="prose dark:prose-invert">
            <code>
              {{ JSON.stringify(values, null, 2) }}
            </code>
          </span>

          Feel free, to go back and make changes.

          <ShadcnLabel for="create-git-repository">
            Would you like me to setup a github repository?
          </ShadcnLabel>
          <ShadcnSwitch
            id="create-git-repository"
            v-model:checked="doCreateGitRepository"
            disabled
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
            :type="meta.valid ? 'button' : 'submit'"
            :disabled="!canGoNext || isLoading"
            size="sm"
            @click="meta.valid && goNext()"
          >
            Next
          </ShadcnButton>
          <ShadcnButton
            v-if="stepIndex === 3"
            size="sm"
            type="submit"
            :disabled="isLoading"
          >
            <template v-if="isLoading">
              Creating Project...
            </template>
            <template v-else>
              Generate Project
            </template>
          </ShadcnButton>
        </div>
      </div>
    </form>
  </ShadcnForm>
</template>

<style scoped></style>
