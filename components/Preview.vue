<script setup lang="ts">
const colorMode = useColorMode();
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
        ></div>

        <NuxtImg
          class="w-full md:w-[1200px] mx-2 relative rounded-lg leading-none flex items-center border border-t-2 border-t-primary/30"
          :src="
            colorMode.preference == 'light'
              ? '/assets/preview-light.jpg'
              : '/assets/preview-dark.jpg'
          "
          alt="app preview image"
        />

        <!-- gradient effect img -->
        <div
          class="absolute bottom-0 left-0 w-full h-20 rounded-lg md:h-28 bg-gradient-to-b from-background/0 via-background/50 to-background"
        ></div>
      </div>
    </div>
  </section>
</template>

<style scoped></style>
