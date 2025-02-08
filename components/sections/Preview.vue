<script setup lang="ts">
import gsap from 'gsap'
import { Loader2 } from 'lucide-vue-next'

const colorMode = useColorMode()
const activeTab = ref('All_Chats')
const loadedImages = ref(new Set<string>())
const currentY = ref(0)
const FLOAT_LIMIT = 8
const movingUp = ref(true)
const imageLoadingStates = ref(new Map<string, boolean>())
const loadError = ref(new Map<string, boolean>())

function initializeAnimation() {
  gsap.killTweensOf('.floating-image')

  const images = document.querySelectorAll('.floating-image')

  if (images.length === 0) {
    return
  }

  currentY.value = Math.max(Math.min(currentY.value, FLOAT_LIMIT), -FLOAT_LIMIT)
  gsap.set(images, { y: currentY.value })

  movingUp.value = !movingUp.value
  const targetY = movingUp.value ? -FLOAT_LIMIT : FLOAT_LIMIT

  gsap.to(images, {
    y: targetY,
    duration: 1.5,
    ease: 'sine.inOut',
    yoyo: true,
    repeat: -1,
    onUpdate() {
      if (this.targets().length > 0) {
        currentY.value = Math.max(
          Math.min(this.targets()[0]._gsap.y, FLOAT_LIMIT),
          -FLOAT_LIMIT,
        )
      }
    },
  })
}

function handleImageLoad(src: string) {
  loadedImages.value.add(src)
  imageLoadingStates.value.set(src, false)
  loadError.value.set(src, false)
  const currentImages = getCurrentTabImages()
  if (currentImages.every(img => loadedImages.value.has(img))) {
    initializeAnimation()
  }
}

function handleImageError(src: string) {
  imageLoadingStates.value.set(src, false)
  loadError.value.set(src, true)
  console.error(`Failed to load image: ${src}`)
}

function getCurrentTabImages(): string[] {
  const isDark = colorMode.preference === 'dark'
  if (activeTab.value === 'All_Chats') {
    return [isDark ? '/assets/preview-dark.png' : '/assets/preview-light.png']
  }
  return [isDark ? '/assets/preview-dark-info.png' : '/assets/preview-light-info.png']
}

function handleTabChange() {
  loadedImages.value.clear()
  const allPossibleImages = [
    '/assets/preview-dark.png',
    '/assets/preview-light.png',
    '/assets/preview-dark-info.png',
    '/assets/preview-light-info.png',
  ]
  allPossibleImages.forEach((img) => {
    imageLoadingStates.value.set(img, true)
    loadError.value.set(img, false)
  })
}

onMounted(() => {
  handleTabChange()
})

onBeforeUnmount(() => {
  gsap.killTweensOf('.floating-image')
})
</script>

<template>
  <section class="relative w-full bg-background">
    <div class="mx-auto">
      <div class="flex flex-col justify-center items-center py-4 sm:py-12 lg:py-16">
        <div class="relative w-full">
          <h3 class="pb-2 text-4xl font-bold text-center sm:text-6xl lg:text-8xl sm:pb-6">
            What?
          </h3>

          <!-- gradient shadow -->
          <div class="absolute top-2 lg:-top-8 left-1/2 transform -translate-x-1/2 w-[90%] mx-auto h-24 lg:h-80 bg-blue-950/50 rounded-full blur-3xl opacity-70" />

          <div class="px-0 mx-auto w-full max-w-screen-xl">
            <SlidingTabs
              v-model="activeTab"
              :tabs="['All_Chats', 'Active_Chat']"
            >
              <template #All_Chats>
                <div class="relative w-full rounded-lg">
                  <div
                    v-if="imageLoadingStates.get(colorMode.preference === 'light' ? '/assets/preview-light.png' : '/assets/preview-dark.png')"
                    class="flex absolute inset-0 justify-center items-center bg-background/80"
                  >
                    <Loader2 class="w-12 h-12 text-blue-500 animate-spin" />
                  </div>
                  <div
                    v-if="loadError.get(colorMode.preference === 'light' ? '/assets/preview-light.png' : '/assets/preview-dark.png')"
                    class="flex absolute inset-0 justify-center items-center bg-background/80"
                  >
                    <p class="text-red-500">
                      Failed to load image. Please try refreshing.
                    </p>
                  </div>
                  <NuxtImg
                    v-if="colorMode.preference === 'light'"
                    :preload="{
                      fetchPriority: 'high',
                    }"
                    placeholder
                    loading="lazy"
                    format="webp"
                    quality="80"
                    class="object-contain relative w-full h-auto rounded-lg border border-t-2 floating-image border-t-primary/30"
                    src="/assets/preview-light.png"
                    alt="app preview image light"
                    width="1916"
                    height="907"
                    :on-error="() => handleImageError('/assets/preview-light.png')"
                    @load="() => handleImageLoad('/assets/preview-light.png')"
                  />
                  <NuxtImg
                    v-else
                    :preload="{
                      fetchPriority: 'high',
                    }"
                    placeholder
                    loading="lazy"
                    format="webp"
                    quality="80"
                    class="object-contain relative w-full h-auto rounded-lg border border-t-2 floating-image border-t-primary/30"
                    src="/assets/preview-dark.png"
                    alt="app preview image dark"
                    width="1919"
                    height="908"
                    :on-error="() => handleImageError('/assets/preview-dark.png')"
                    @load="() => handleImageLoad('/assets/preview-dark.png')"
                  />
                </div>
              </template>

              <template #Active_Chat>
                <div class="relative w-full rounded-lg">
                  <div
                    v-if="imageLoadingStates.get(colorMode.preference === 'light' ? '/assets/preview-light-info.png' : '/assets/preview-dark-info.png')"
                    class="flex absolute inset-0 justify-center items-center bg-background/80"
                  >
                    <Loader2 class="w-12 h-12 text-blue-500 animate-spin" />
                  </div>
                  <div
                    v-if="loadError.get(colorMode.preference === 'light' ? '/assets/preview-light-info.png' : '/assets/preview-dark-info.png')"
                    class="flex absolute inset-0 justify-center items-center bg-background/80"
                  >
                    <p class="text-red-500">
                      Failed to load image. Please try refreshing.
                    </p>
                  </div>
                  <NuxtImg
                    v-if="colorMode.preference === 'light'"
                    :preload="{
                      fetchPriority: 'high',
                    }"
                    placeholder
                    loading="lazy"
                    format="webp"
                    quality="80"
                    class="object-contain relative w-full h-auto rounded-lg border border-t-2 floating-image border-t-primary/30"
                    src="/assets/preview-light-info.png"
                    alt="app preview image light info"
                    width="1917"
                    height="908"
                    :on-error="() => handleImageError('/assets/preview-light-info.png')"
                    @load="() => handleImageLoad('/assets/preview-light-info.png')"
                  />
                  <NuxtImg
                    v-else
                    :preload="{
                      fetchPriority: 'high',
                    }"
                    placeholder
                    loading="lazy"
                    format="webp"
                    quality="80"
                    class="object-contain relative w-full h-auto rounded-lg border border-t-2 floating-image border-t-primary/30"
                    src="/assets/preview-dark-info.png"
                    alt="app preview image dark info"
                    width="1918"
                    height="907"
                    :on-error="() => handleImageError('/assets/preview-dark-info.png')"
                    @load="() => handleImageLoad('/assets/preview-dark-info.png')"
                  />
                </div>
              </template>
            </SlidingTabs>

            <!-- gradient effect -->
            <div class="absolute bottom-0 left-0 w-full h-8 bg-gradient-to-b rounded-lg xs:h-12 sm:h-20 md:h-28 from-background/0 via-background/50 to-background" />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped></style>
