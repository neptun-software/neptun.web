<script setup lang="ts">
import { Import, ChevronsUpDown, Plus, Code2 } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import { buttonVariants } from '@/components/shadcn/button'
import { cn } from '@/lib/utils'

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
  return typeof projectId === 'string' ? parseInt(projectId, 10) : undefined
})

const { activeProject, projectsList, fetchProject, fetchProjects, clearProject } = useProjects()

// Load projects on mount
onMounted(async () => {
  try {
    await fetchProjects()
  } catch (error) {
    toast.error('Failed to load projects')
  }
})

// Watch for project ID changes
watchEffect(async () => {
  if (selectedProjectId.value) {
    try {
      await fetchProject(selectedProjectId.value)
    } catch (error) {
      toast.error('Failed to load project', {
        description: 'Failed to load project. Please try again later.'
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
                  'w-full justify-center cursor-pointer'
                )"
                @click="() => navigateTo('/')"
              >
                Clear active project
              </ShadcnDropdownMenuItem>
              <div class="px-1.5 py-1.5 text-sm text-muted-foreground" v-if="projectsList.length === 0">
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

        <!-- Import Code Repositories From Github To Analyze -->
        <NuxtLink
          v-if="selectedProjectId"
          class="flex gap-2 pr-5"
          target="_blank"
          :to="
            IS_DEV
              ? 'https://github.com/apps/neptun-github-app-dev'
              : 'https://github.com/apps/neptun-github-app'
          "
          :external="true"
        >
          <ShadcnButton
            variant="outline"
            size="sm"
            class="gap-1.5 ml-auto text-sm truncate"
          >
            Import Github Repository
            <Import class="size-4" />
          </ShadcnButton>
        </NuxtLink>
        <!-- Import Data into Project -->
        <!-- TODO -->
      </header>
      <Dashboard />
    </div>
  </div>
</template>

<style scoped></style>
