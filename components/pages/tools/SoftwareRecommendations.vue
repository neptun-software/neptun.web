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

interface Recommendation {
  url: string
  category: string
  description: string
}

const recommendations = ref<Recommendation[]>([
  {
    url: 'https://www.docker.com',
    category: 'Containerization',
    description: 'Platform for developing, shipping, and running applications in containers',
  },
  {
    url: 'https://www.portainer.io',
    category: 'Container Management',
    description: 'Web interface for managing Docker environments',
  },
  {
    url: 'https://www.nginx.com',
    category: 'Web Server',
    description: 'High-performance HTTP server and reverse proxy',
  },
])

const loading = ref<{ [key: string]: boolean }>({})
const error = ref<{ [key: string]: string | null }>({})
const ogData = ref<{ [key: string]: OgData | null }>({})
const imageLoadError = ref<{ [key: string]: boolean }>({})
const faviconLoadError = ref<{ [key: string]: boolean }>({})

function handleImageError(url: string) {
  imageLoadError.value[url] = true
}

function handleFaviconError(url: string) {
  faviconLoadError.value[url] = true
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
</script>

<template>
  <div class="space-y-4">
    <div v-for="rec in recommendations" :key="rec.url" class="group">
      <ShadcnCard class="shadow-none transition-all duration-200 hover:border-primary">
        <ShadcnCardHeader>
          <ShadcnCardTitle>{{ rec.category }}</ShadcnCardTitle>
          <ShadcnCardDescription>{{ rec.description }}</ShadcnCardDescription>
        </ShadcnCardHeader>
        <ShadcnCardContent>
          <div class="og-data">
            <!-- TODO: Use skeleton instead -->
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
                  <template v-if="ogData[rec.url]?.ogImage?.[0]?.url && !imageLoadError[rec.url]">
                    <NuxtImg
                      :src="ogData[rec.url]?.ogImage?.[0]?.url"
                      :alt="ogData[rec.url]?.ogImage?.[0]?.alt || ogData[rec.url]?.ogTitle || ''"
                      class="object-cover w-24 h-24 rounded-lg"
                      loading="lazy"
                      @error="handleImageError(rec.url)"
                    />
                  </template>
                  <div v-else class="flex justify-center items-center w-24 h-24 rounded-lg bg-muted">
                    <Icon icon="lucide:ban" class="w-8 h-8 text-muted-foreground/50" />
                  </div>

                  <template v-if="ogData[rec.url]?.favicon && !faviconLoadError[rec.url]">
                    <NuxtImg
                      :src="ogData[rec.url]?.favicon"
                      class="absolute -right-2 -bottom-2 w-6 h-6 bg-white rounded-full shadow-sm"
                      alt="Site favicon"
                      loading="lazy"
                      @error="handleFaviconError(rec.url)"
                    />
                  </template>
                  <div v-else class="flex absolute -right-2 -bottom-2 justify-center items-center w-6 h-6 bg-white rounded-full shadow-sm">
                    <Icon icon="lucide:globe" class="w-4 h-4 text-muted-foreground/50" />
                  </div>
                </div>
                <div class="flex flex-col flex-grow justify-center">
                  <div class="flex gap-2 items-center">
                    <h3 class="font-medium">
                      {{ ogData[rec.url]?.ogTitle || ogData[rec.url]?.twitterTitle }}
                    </h3>
                    <ShadcnBadge v-if="ogData[rec.url]?.ogType" variant="secondary">
                      {{ ogData[rec.url]?.ogType }}
                    </ShadcnBadge>
                  </div>
                  <p class="text-sm text-muted-foreground line-clamp-2">
                    {{ ogData[rec.url]?.ogDescription || ogData[rec.url]?.twitterDescription }}
                  </p>
                  <div class="flex gap-2 items-center mt-1">
                    <ShadcnBadge v-if="ogData[rec.url]?.ogSiteName" variant="secondary">
                      {{ ogData[rec.url]?.ogSiteName }}
                    </ShadcnBadge>
                    <ShadcnBadge v-if="ogData[rec.url]?.ogLocale" variant="secondary">
                      {{ ogData[rec.url]?.ogLocale }}
                    </ShadcnBadge>
                  </div>
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
</template>
