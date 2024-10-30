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
  <section class="container">
    <div
      class="grid max-w-full gap-8 py-20 mx-auto place-items-center lg:max-w-screen-xl md:py-32"
    >
      <div class="relative mt-14">
        <h3 class="pb-4 font-bold text-center text-9xl">What?</h3>

        <!-- gradient shadow -->
        <div
          class="absolute top-2 lg:-top-8 left-1/2 transform -translate-x-1/2 w-[90%] mx-auto h-24 lg:h-80 bg-blue-950/50 rounded-full blur-3xl opacity-70"
        />

        <SlidingTabs :tabs="['All_Chats', 'Active_Chat']">
          <template #All_Chats>
            <ClientOnly fallback-tag="div">
              <NuxtImg
                v-if="colorMode.preference === 'light'"
                ref="floatingImage"
                class="floating-image w-full md:w-[1200px] mx-2 relative rounded-lg leading-none flex items-center border border-t-2 border-t-primary/30"
                src="/assets/preview-light.png"
                alt="app preview image light"
              />
              <NuxtImg
                v-else
                ref="floatingImage"
                class="floating-image w-full md:w-[1200px] mx-2 relative rounded-lg leading-none flex items-center border border-t-2 border-t-primary/30"
                src="/assets/preview-dark.png"
                alt="app preview image dark"
              />
              <template #fallback>
                <NuxtImg
                  ref="floatingImage"
                  class="floating-image w-full md:w-[1200px] mx-2 relative rounded-lg leading-none flex items-center border border-t-2 border-t-primary/30"
                  src="/assets/preview-light.png"
                  alt="app preview image light"
                />
              </template>
            </ClientOnly>
          </template>
          <template #Active_Chat>
            <ClientOnly fallback-tag="div">
              <NuxtImg
                v-if="colorMode.preference === 'light'"
                ref="floatingImage"
                class="floating-image w-full md:w-[1200px] mx-2 relative rounded-lg leading-none flex items-center border border-t-2 border-t-primary/30"
                src="/assets/preview-light-info.png"
                alt="app preview image light"
              />
              <NuxtImg
                v-else
                ref="floatingImage"
                class="floating-image w-full md:w-[1200px] mx-2 relative rounded-lg leading-none flex items-center border border-t-2 border-t-primary/30"
                src="/assets/preview-dark-info.png"
                alt="app preview image dark"
              />
              <template #fallback>
                <NuxtImg
                  ref="floatingImage"
                  class="floating-image w-full md:w-[1200px] mx-2 relative rounded-lg leading-none flex items-center border border-t-2 border-t-primary/30"
                  src="/assets/preview-light-info.png"
                  alt="app preview image light"
                />
              </template>
            </ClientOnly>
          </template>
        </SlidingTabs>

        <!-- gradient effect img -->
        <div
          class="absolute bottom-0 left-0 w-full h-20 rounded-lg md:h-28 bg-gradient-to-b from-background/0 via-background/50 to-background"
        />
      </div>
    </div>
  </section>
</template>

<style scoped></style>
