<script setup lang="ts">
import gsap from 'gsap';

const colorMode = useColorMode();
const floatingImage = ref<HTMLElement | null>(null);

const initializeAnimation = () => {
  gsap.to('.floating-image', {
    y: -10,
    duration: 2,
    ease: 'power1.inOut',
    yoyo: true,
    repeat: -1,
  });
};

watch(floatingImage, (newValue) => {
  if (newValue) {
    initializeAnimation();
  }
});

onMounted(() => {
  setTimeout(() => {
    if (floatingImage.value) {
      initializeAnimation();
    }
  }, 100);
});
</script>

<template>
  <section class="relative w-full bg-background">
    <div class="mx-auto">
      <div
        class="flex flex-col items-center justify-center py-4 sm:py-12 lg:py-16"
      >
        <div class="relative w-full">
          <h3
            class="pb-2 text-4xl font-bold text-center sm:text-6xl lg:text-8xl sm:pb-6"
          >
            What?
          </h3>

          <!-- gradient shadow -->
          <div
            class="absolute top-2 lg:-top-8 left-1/2 transform -translate-x-1/2 w-[90%] mx-auto h-24 lg:h-80 bg-blue-950/50 rounded-full blur-3xl opacity-70"
          />

          <div class="w-full max-w-screen-xl px-0 mx-auto">
            <SlidingTabs :tabs="['All_Chats', 'Active_Chat']">
              <template #All_Chats>
                <ClientOnly fallback-tag="div">
                  <div class="relative w-full overflow-hidden rounded-lg">
                    <NuxtImg
                      v-if="colorMode.preference === 'light'"
                      ref="floatingImage"
                      class="relative object-contain w-full h-auto border border-t-2 rounded-lg floating-image border-t-primary/30"
                      src="/assets/preview-light.png"
                      alt="app preview image light"
                    />
                    <NuxtImg
                      v-else
                      ref="floatingImage"
                      class="relative object-contain w-full h-auto border border-t-2 rounded-lg floating-image border-t-primary/30"
                      src="/assets/preview-dark.png"
                      alt="app preview image dark"
                    />
                  </div>
                  <template #fallback>
                    <div class="relative w-full overflow-hidden rounded-lg">
                      <NuxtImg
                        ref="floatingImage"
                        class="relative object-contain w-full h-auto border border-t-2 rounded-lg floating-image border-t-primary/30"
                        src="/assets/preview-light.png"
                        alt="app preview image light"
                      />
                    </div>
                  </template>
                </ClientOnly>
              </template>
              <template #Active_Chat>
                <ClientOnly fallback-tag="div">
                  <div class="relative w-full overflow-hidden rounded-lg">
                    <NuxtImg
                      v-if="colorMode.preference === 'light'"
                      ref="floatingImage"
                      class="relative object-contain w-full h-auto border border-t-2 rounded-lg floating-image border-t-primary/30"
                      src="/assets/preview-light-info.png"
                      alt="app preview image light"
                    />
                    <NuxtImg
                      v-else
                      ref="floatingImage"
                      class="relative object-contain w-full h-auto border border-t-2 rounded-lg floating-image border-t-primary/30"
                      src="/assets/preview-dark-info.png"
                      alt="app preview image dark"
                    />
                  </div>
                  <template #fallback>
                    <div class="relative w-full overflow-hidden rounded-lg">
                      <NuxtImg
                        ref="floatingImage"
                        class="relative object-contain w-full h-auto border border-t-2 rounded-lg floating-image border-t-primary/30"
                        src="/assets/preview-light-info.png"
                        alt="app preview image light"
                      />
                    </div>
                  </template>
                </ClientOnly>
              </template>
            </SlidingTabs>

            <!-- gradient effect img -->
            <div
              class="absolute bottom-0 left-0 w-full h-8 rounded-lg xs:h-12 sm:h-20 md:h-28 bg-gradient-to-b from-background/0 via-background/50 to-background"
            />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped></style>
