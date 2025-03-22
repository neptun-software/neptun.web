<script setup lang="ts">
import { Icon } from '@iconify/vue'

interface OgData {
  ogTitle?: string
  ogDescription?: string
  ogImage?: Array<{ url: string, type?: string, width?: string, height?: string, alt?: string }>
  ogSiteName?: string
  ogType?: string
  ogLocale?: string
  twitterCard?: string
  twitterTitle?: string
  twitterDescription?: string
  twitterImage?: Array<{ url: string, alt?: string }>
  twitterSite?: string
  favicon?: string
}

enum Category {
  ContainerizationAndOrchestration = 'Containerization & Orchestration',
  PackageAndVersionManagement = 'Package & Version Management',
  InfrastructureManagement = 'Infrastructure Management',
  CICDAndVersionControl = 'CI/CD & Version Control',
  WebServersAndAuthentication = 'Web Servers & Authentication',
  PackageRegistriesAndRuntimes = 'Package Registries & Runtimes',
  InfrastructureAndDeployment = 'Infrastructure & Deployment',
  LanguagesAndDevelopmentTools = 'Languages & Development Tools',
  FrontendFrameworksAndLibraries = 'Frontend Frameworks & Libraries',
  BackendFrameworks = 'Backend Frameworks',
  StylingAndDesign = 'Styling & Design'
}

interface Recommendation {
  url: string
  name: string
  category: Category
  description: string
}

const recommendations = ref<Recommendation[]>([
  // Containerization & Orchestration
  {
    url: 'https://www.docker.com',
    name: 'Docker',
    category: Category.ContainerizationAndOrchestration,
    description: 'Platform for developing, shipping, and running applications in containers',
  },
  {
    url: 'https://kubernetes.io',
    name: 'Kubernetes',
    category: Category.ContainerizationAndOrchestration,
    description: 'Production-grade container orchestration system for automated deployment and scaling',
  },
  {
    url: 'https://k3s.io',
    name: 'K3s',
    category: Category.ContainerizationAndOrchestration,
    description: 'Lightweight Kubernetes distribution perfect for edge, IoT, and development',
  },
  {
    url: 'https://skaffold.dev',
    name: 'Skaffold',
    category: Category.ContainerizationAndOrchestration,
    description: 'Handles the workflow for building, pushing, and deploying Kubernetes applications',
  },
  
  // Package & Version Management
  {
    url: 'https://helm.sh',
    name: 'Helm',
    category: Category.PackageAndVersionManagement,
    description: 'Package manager for Kubernetes that helps define, install, and upgrade applications',
  },
  {
    url: 'https://asdf-vm.com',
    name: 'asdf',
    category: Category.PackageAndVersionManagement,
    description: 'Universal version manager for runtime environments and CLI tools',
  },
  
  // Infrastructure Management
  {
    url: 'https://www.portainer.io',
    name: 'Portainer',
    category: Category.InfrastructureManagement,
    description: 'Web interface for managing Docker environments',
  },
  {
    url: 'https://kubevela.io',
    name: 'KubeVela',
    category: Category.InfrastructureManagement,
    description: 'Modern application delivery platform that makes deploying and operating applications easier',
  },
  {
    url: 'https://argoproj.github.io/cd',
    name: 'Argo CD',
    category: Category.InfrastructureManagement,
    description: 'Declarative continuous delivery tool for Kubernetes following GitOps principles',
  },
  
  // CI/CD & Version Control
  {
    url: 'https://www.jenkins.io',
    name: 'Jenkins',
    category: Category.CICDAndVersionControl,
    description: 'Open source automation server for building, deploying, and automating projects',
  },
  {
    url: 'https://github.com',
    name: 'GitHub',
    category: Category.CICDAndVersionControl,
    description: 'Development platform for hosting and collaborating on code',
  },
  
  // Web Servers & Authentication
  {
    url: 'https://www.nginx.com',
    name: 'NGINX',
    category: Category.WebServersAndAuthentication,
    description: 'High-performance HTTP server and reverse proxy',
  },
  {
    url: 'https://caddyserver.com',
    name: 'Caddy',
    category: Category.WebServersAndAuthentication,
    description: 'Modern web server with automatic HTTPS and simple configuration',
  },
  {
    url: 'https://www.authelia.com',
    name: 'Authelia',
    category: Category.WebServersAndAuthentication,
    description: 'Open source authentication and authorization server for modern web applications',
  },
  {
    url: 'https://better-auth.vercel.app',
    name: 'Better Auth',
    category: Category.WebServersAndAuthentication,
    description: 'Modern authentication library',
  },
  {
    url: 'https://docs.postalserver.io',
    name: 'Postal',
    category: Category.WebServersAndAuthentication,
    description: 'Open source mail server for SMTP, IMAP, and web interface',
  },
  
  // Package Registries & Runtimes
  {
    url: 'https://jsr.io',
    name: 'JSR',
    category: Category.PackageRegistriesAndRuntimes,
    description: 'Fast and modern registry for JavaScript and TypeScript packages',
  },
  {
    url: 'https://bun.sh',
    name: 'Bun',
    category: Category.PackageRegistriesAndRuntimes,
    description: 'Fast all-in-one JavaScript runtime and toolkit with bundler, test runner, and package manager',
  },
  
  // Infrastructure & Deployment
  {
    url: 'https://coolify.io',
    name: 'Coolify',
    category: Category.InfrastructureAndDeployment,
    description: 'Open-source & self-hostable Heroku/Netlify/Vercel alternative',
  },
  
  // Languages & Development Tools
  {
    url: 'https://www.typescriptlang.org',
    name: 'TypeScript',
    category: Category.LanguagesAndDevelopmentTools,
    description: 'Typed superset of JavaScript that compiles to plain JavaScript',
  },
  {
    url: 'https://biomejs.dev',
    name: 'Biome',
    category: Category.LanguagesAndDevelopmentTools,
    description: 'Fast and modern formatter, linter, and bundler for JavaScript and TypeScript',
  },
  {
    url: 'https://orm.drizzle.team',
    name: 'Drizzle',
    category: Category.LanguagesAndDevelopmentTools,
    description: 'TypeScript ORM that maximizes type safety and runtime performance',
  },
  {
    url: 'https://vite.dev',
    name: 'Vite',
    category: Category.LanguagesAndDevelopmentTools,
    description: 'Next generation frontend tooling with instant server start and hot module replacement',
  },
  {
    url: 'https://nektosact.com',
    name: 'Nektos Act',
    category: Category.LanguagesAndDevelopmentTools,
    description: 'Modern and intuitive Action testing tool for developers',
  },
  
  // Frontend Frameworks & Libraries
  {
    url: 'https://vuejs.org',
    name: 'Vue.js',
    category: Category.FrontendFrameworksAndLibraries,
    description: 'Progressive JavaScript framework for building user interfaces',
  },
  {
    url: 'https://nuxt.com',
    name: 'Nuxt',
    category: Category.FrontendFrameworksAndLibraries,
    description: 'Intuitive Vue META framework for building performant web applications',
  },
  {
    url: 'https://svelte.dev',
    name: 'Svelte',
    category: Category.FrontendFrameworksAndLibraries,
    description: 'Radical new approach to building user interfaces with less code',
  },
  {
    url: 'https://docs.astro.build',
    name: 'Astro',
    category: Category.FrontendFrameworksAndLibraries,
    description: 'Framework for building content-focused, fast websites',
  },
  {
    url: 'https://ui.shadcn.com',
    name: 'shadcn/ui',
    category: Category.FrontendFrameworksAndLibraries,
    description: 'Re-usable components built with Radix UI and Tailwind CSS',
  },
  {
    url: 'https://sst.dev',
    name: 'SST',
    category: Category.InfrastructureAndDeployment,
    description: 'Framework for building full-stack serverless applications with TypeScript',
  },
  {
    url: 'https://templ.guide',
    name: 'Templ',
    category: Category.BackendFrameworks,
    description: 'Type-safe HTML templating language for Go that helps build robust web applications',
  },
  
  // Backend Frameworks
  {
    url: 'https://nitro.build',
    name: 'Nitro',
    category: Category.BackendFrameworks,
    description: 'Fast and flexible server engine for JavaScript and TypeScript applications',
  },
  {
    url: 'https://hono.dev',
    name: 'Hono',
    category: Category.BackendFrameworks,
    description: 'Ultrafast web framework for the Edges, written in TypeScript',
  },
  {
    url: 'https://echo.labstack.com',
    name: 'Echo',
    category: Category.BackendFrameworks,
    description: 'High performance, minimalist Go web framework',
  },
  {
    url: 'https://ktor.io',
    name: 'Ktor',
    category: Category.BackendFrameworks,
    description: 'Kotlin framework for building asynchronous servers and clients',
  },
  
  // Styling & Design
  {
    url: 'https://tailwindcss.com',
    name: 'Tailwind CSS',
    category: Category.StylingAndDesign,
    description: 'Utility-first CSS framework for rapidly building custom user interfaces',
  },
  {
    url: 'https://sass-lang.com',
    name: 'Sass',
    category: Category.StylingAndDesign,
    description: 'Professional grade CSS extension language with more features and capabilities',
  },
  {
    url: 'https://postcss.org',
    name: 'PostCSS',
    category: Category.StylingAndDesign,
    description: 'Tool for transforming CSS with JavaScript plugins to automate routine operations',
  },
  {
    url: 'https://iconify.design',
    name: 'Iconify',
    category: Category.StylingAndDesign,
    description: 'All popular icon sets, one framework. Over 150,000 open source vector icons',
  },
])

const searchQuery = ref('')

const filteredRecommendations = computed(() => {
  const query = searchQuery.value.toLowerCase().trim()
  if (!query) return recommendations.value

  return recommendations.value.filter(rec => 
    rec.category.toLowerCase().includes(query) ||
    rec.description.toLowerCase().includes(query) ||
    rec.url.toLowerCase().includes(query)
  )
})

const loading = ref<{ [key: string]: boolean }>({})
const error = ref<{ [key: string]: string | null }>({})
const ogData = ref<{ [key: string]: OgData | null }>({})
const imageLoadError = ref<{ [key: string]: boolean }>({})
const faviconLoadError = ref<{ [key: string]: boolean }>({})
const imageLoading = ref<{ [key: string]: boolean }>({})
const faviconLoading = ref<{ [key: string]: boolean }>({})

function handleImageError(url: string) {
  imageLoadError.value[url] = true
  imageLoading.value[url] = false
}

function handleFaviconError(url: string) {
  faviconLoadError.value[url] = true
  faviconLoading.value[url] = false
}

function handleImageLoad(url: string) {
  imageLoading.value[url] = false
}

function handleFaviconLoad(url: string) {
  faviconLoading.value[url] = false
}

async function fetchOgData(url: string) {
  if (ogData.value[url]) {
    return
  }

  try {
    loading.value[url] = true
    error.value[url] = null

    const result = await $fetch(`/api/og/${encodeURIComponent(url)}`)
    ogData.value[url] = result as OgData
  } catch (e) {
    console.error('OG Data Fetch Error:', e)
    error.value[url] = e instanceof Error ? e.message : 'Unknown error occurred'
  } finally {
    loading.value[url] = false
  }
}

onMounted(() => {
  recommendations.value.forEach(rec => fetchOgData(rec.url))
})

const groupedRecommendations = computed(() => {
  const groups = {} as Record<string, Recommendation[]>
  
  filteredRecommendations.value.forEach(rec => {
    if (!groups[rec.category]) {
      groups[rec.category] = []
    }
    groups[rec.category].push(rec)
  })
  
  return groups
})
</script>

<template>
  <div class="space-y-4">
    <div class="relative w-full">
      <ShadcnInput
        v-model="searchQuery"
        type="text"
        placeholder="Search by category, description, or URL..."
        class="pl-10"
      />
      <span class="flex absolute inset-y-0 justify-center items-center px-2 start-0">
        <Icon icon="lucide:search" class="w-5 h-5 text-muted-foreground" />
      </span>
    </div>

    <div class="space-y-8">
      <div v-for="(tools, category) in groupedRecommendations" :key="category" class="space-y-4">
        <h2 class="text-2xl font-semibold">{{ category }}</h2>
        <div class="space-y-4">
          <div v-for="rec in tools" :key="rec.url" class="group">
            <ShadcnCard class="shadow-none transition-all duration-200 hover:border-primary">
              <ShadcnCardHeader>
                <ShadcnCardTitle>{{ rec.name }}</ShadcnCardTitle>
                <ShadcnCardDescription>{{ rec.description }}</ShadcnCardDescription>
              </ShadcnCardHeader>
              <ShadcnCardContent>
                <div class="og-data">
                  <InfoBlock v-if="loading[rec.url]" :is-visible="loading[rec.url]" :show-loader="true" :show-dots="true" variant="info">
                    Loading preview
                  </InfoBlock>

                  <InfoBlock v-else-if="error[rec.url]" :is-visible="error[rec.url] != null" variant="error">
                    {{ error[rec.url] }}
                  </InfoBlock>

                  <NuxtLink
                    :to="rec.url" target="_blank" external
                    class="flex flex-col gap-4 group-hover:opacity-90"
                  >
                    <div class="flex gap-4">
                      <div class="relative flex-shrink-0">
                        <template v-if="!loading[rec.url]">
                          <template v-if="ogData[rec.url]?.ogImage?.[0]?.url && !imageLoadError[rec.url]">
                            <ShadcnSkeleton v-if="imageLoading[rec.url]" class="w-24 h-24 rounded-lg" />
                            <NuxtImg
                              :src="ogData[rec.url]?.ogImage?.[0]?.url"
                              :alt="ogData[rec.url]?.ogImage?.[0]?.alt || ogData[rec.url]?.ogTitle || rec.name"
                              class="object-cover w-24 h-24 rounded-lg"
                              @load="handleImageLoad(rec.url)"
                              @error="handleImageError(rec.url)"
                              @mounted="imageLoading[rec.url] = true"
                            />
                          </template>
                          <div v-else class="flex justify-center items-center w-24 h-24 rounded-lg bg-muted">
                            <Icon icon="lucide:ban" class="w-8 h-8 text-muted-foreground/50" />
                          </div>

                          <template v-if="ogData[rec.url]?.favicon && !faviconLoadError[rec.url]">
                            <ShadcnSkeleton v-if="faviconLoading[rec.url]" class="absolute -right-2 -bottom-2 w-6 h-6 rounded-full" />
                            <NuxtImg
                              :src="ogData[rec.url]?.favicon"
                              :alt="`${rec.name} favicon`"
                              class="absolute -right-2 -bottom-2 w-6 h-6 bg-white rounded-full shadow-sm"
                              @load="handleFaviconLoad(rec.url)"
                              @error="handleFaviconError(rec.url)"
                              @mounted="faviconLoading[rec.url] = true"
                            />
                          </template>
                          <div v-else class="flex absolute -right-2 -bottom-2 justify-center items-center w-6 h-6 bg-white rounded-full shadow-sm">
                            <Icon icon="lucide:globe" class="w-4 h-4 text-muted-foreground/50" />
                          </div>
                        </template>
                        <template v-else>
                          <ShadcnSkeleton class="w-24 h-24 rounded-lg" />
                          <ShadcnSkeleton class="absolute -right-2 -bottom-2 w-6 h-6 rounded-full" />
                        </template>
                      </div>

                      <div class="flex flex-col flex-grow justify-center">
                        <template v-if="loading[rec.url] || (!ogData[rec.url]?.ogTitle && !ogData[rec.url]?.twitterTitle)">
                          <ShadcnSkeleton class="mb-2 w-3/4 h-6" />
                          <ShadcnSkeleton class="w-full h-4" />
                        </template>
                        <template v-else>
                          <div class="flex gap-2 items-center">
                            <h3 class="font-medium">
                              {{ ogData[rec.url]?.ogTitle || ogData[rec.url]?.twitterTitle || rec.name }}
                            </h3>
                            <ShadcnBadge v-if="ogData[rec.url]?.ogType" variant="secondary">
                              {{ ogData[rec.url]?.ogType }}
                            </ShadcnBadge>
                          </div>
                          <p class="text-sm text-muted-foreground line-clamp-2">
                            {{ ogData[rec.url]?.ogDescription || ogData[rec.url]?.twitterDescription || rec.description }}
                          </p>
                          <div class="flex gap-2 items-center mt-1">
                            <ShadcnBadge v-if="ogData[rec.url]?.ogSiteName" variant="secondary">
                              {{ ogData[rec.url]?.ogSiteName }}
                            </ShadcnBadge>
                            <ShadcnBadge v-if="ogData[rec.url]?.ogLocale" variant="secondary">
                              {{ ogData[rec.url]?.ogLocale }}
                            </ShadcnBadge>
                          </div>
                        </template>
                      </div>

                      <div>
                        <NuxtLink
                          v-if="ogData[rec.url]?.twitterSite"
                          :to="`https://twitter.com/${ogData[rec.url]?.twitterSite?.replace('@', '')}`"
                          target="_blank"
                          external
                          class="flex gap-1 items-center text-sm transition-colors text-muted-foreground hover:text-primary"
                        >
                          <Icon icon="fa6-brands:x-twitter" class="w-4 h-4" /> {{ ogData[rec.url]?.twitterSite }}
                        </NuxtLink>
                      </div>
                    </div>
                  </NuxtLink>
                </div>
              </ShadcnCardContent>
            </ShadcnCard>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
