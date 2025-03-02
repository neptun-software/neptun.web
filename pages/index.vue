<script setup lang="ts">
import { buttonVariants } from '@/components/shadcn/button'
import { cn } from '@/lib/utils'
import { ChevronsUpDown, Code2, Plus } from 'lucide-vue-next'

const { $toast } = useNuxtApp()

definePageMeta({
  name: 'Dashboard',
  middleware: ['protected'],
  alias: dashboardAliases,
})

const { $headerNavigationElement } = useUiStore()
const headerNavigationHeight = ref(0)
watch($headerNavigationElement, (new$headerNavigationElement) => {
  // needs access to lifecycle hooks (that is why it is not defined in the store or a composable)
  const { height } = useElementSize(new$headerNavigationElement)
  headerNavigationHeight.value = height.value
})

const route = useRoute()
const selectedProjectId = computed(() => {
  const projectId = route.query.project_id
  return typeof projectId === 'string' ? Number.parseInt(projectId, 10) : undefined
})

const { activeProject, projectsList, fetchProject, fetchProjects, clearProject } = useProjects()

// Load projects on mount
onMounted(async () => {
  try {
    await fetchProjects()
  } catch (error) {
    $toast.error('Failed to load projects')
  }
})

// Watch for project ID changes
watchEffect(async () => {
  if (selectedProjectId.value) {
    try {
      await fetchProject(selectedProjectId.value)
    } catch (error) {
      $toast.error('Failed to load project', {
        description: 'Failed to load project. Please try again later.',
      })
    }
  } else {
    clearProject()
  }
})
</script>

<template>
  <div class="grid pl-2 w-full">
    <div class="flex flex-col">
      <header
        class="flex sticky left-0 z-20 gap-1 justify-between items-center py-2 pt-4 border-b bg-background"
        :style="{ top: `${headerNavigationHeight}px` }"
      >
        <div class="flex gap-2 items-center">
          <ShadcnDropdownMenu>
            <ShadcnDropdownMenuTrigger as-child>
              <ShadcnButton
                variant="ghost"
                size="lg"
                class="h-auto py-2 px-2 bg-accent/50 hover:bg-accent/75 data-[state=open]:bg-accent/75"
              >
                <div class="flex justify-center items-center rounded-md aspect-square size-8 bg-primary/10 text-primary">
                  <Code2 class="size-4" />
                </div>
                <div class="grid flex-1 ml-2 text-sm leading-tight text-left">
                  <span class="font-medium truncate">{{ activeProject?.name ?? 'Select Project' }}</span>
                  <span v-if="activeProject" class="text-xs truncate text-muted-foreground">{{ activeProject.type.replace('-', ' ') }}</span>
                </div>
                <ChevronsUpDown class="ml-4 opacity-50 size-4 shrink-0" />
              </ShadcnButton>
            </ShadcnDropdownMenuTrigger>
            <ShadcnDropdownMenuContent
              class="w-[--radix-dropdown-menu-trigger-width] min-w-56"
              align="start"
              side="bottom"
              :side-offset="4"
            >
              <ShadcnDropdownMenuLabel class="px-1.5 mb-1 text-xs font-normal text-muted-foreground">
                Projects
              </ShadcnDropdownMenuLabel>
              <ShadcnDropdownMenuItem
                v-for="project in projectsList"
                :key="project.id"
                class="gap-2 px-1.5 py-1.5 rounded-md cursor-pointer"
                :class="project.id === activeProject?.id ? 'bg-accent/50' : ''"
                @click="() => navigateTo(`/?project_id=${project.id}`)"
              >
                <div class="flex justify-center items-center rounded-md border size-6 bg-primary/10">
                  <Code2 class="size-4 shrink-0 text-primary" />
                </div>
                <div class="grid flex-1 text-sm leading-none">
                  <span class="truncate">{{ project.name }}</span>
                  <span class="mt-1 text-xs truncate text-muted-foreground">{{ project.type.replace('-', ' ') }}</span>
                </div>
              </ShadcnDropdownMenuItem>

              <ShadcnSeparator class="my-2" />

              <ShadcnDropdownMenuItem
                :class="cn(
                  buttonVariants({ variant: 'secondary', size: 'sm' }),
                  'w-full justify-center cursor-pointer',
                )"
                @click="() => navigateTo('/')"
              >
                Clear active project
              </ShadcnDropdownMenuItem>
              <div v-if="projectsList.length === 0" class="px-1.5 py-1.5 text-sm text-muted-foreground">
                No projects yet.
              </div>
              <ShadcnDropdownMenuSeparator class="my-1.5" />
              <ShadcnDropdownMenuItem
                class="gap-2 px-1.5 py-1.5 rounded-md cursor-pointer"
                @click="() => navigateTo('/guide')"
              >
                <div class="flex justify-center items-center rounded-md border size-6 bg-background/50">
                  <Plus class="size-4 shrink-0 text-foreground/70" />
                </div>
                <span class="text-sm text-muted-foreground">New Project</span>
              </ShadcnDropdownMenuItem>
            </ShadcnDropdownMenuContent>
          </ShadcnDropdownMenu>
        </div>

        <!-- Import Data into Project -->
        <ShadcnButton
          v-if="activeProject?.id"
          class="mr-2"
          variant="outline"
          @click="() => navigateTo(`/account?project_id=${activeProject?.id}`)"
        >
          Import Data
        </ShadcnButton>
      </header>
      <Dashboard />
    </div>
  </div>
</template>

<style scoped></style>
