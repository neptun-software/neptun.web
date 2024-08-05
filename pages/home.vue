<script setup lang="ts">
definePageMeta({
  name: 'Home',
  alias: ['/root'],
});
</script>

<template>
  <section id="home" class="relative flex items-center justify-center h-full">
    <div class="content">
      <div class="headline">
        <h2
          class="headline-text text-[6rem] sm:text-[10rem] md:text-[12rem] lg:text-[14rem] xl:text-[18rem] 2xl:text-[22rem]"
        >
          Neptun
        </h2>
        <h2
          class="headline-animation text-[6rem] sm:text-[10rem] md:text-[12rem] lg:text-[14rem] xl:text-[18rem] 2xl:text-[22rem]"
        >
          Neptun
        </h2>
      </div>
    </div>
    <Cursor />
  </section>
</template>

<style lang="postcss" scoped>
.headline {
  position: relative;
}

.headline-text {
  color: transparent;
  @apply stroke-primary;
  -webkit-text-stroke: 2px hsl(var(--primary));
}

.headline-animation {
  position: absolute;
  top: 0;
  left: 0;
  @apply text-primary;
  animation: animate 4s ease-in-out infinite;
}

@keyframes animate {
  0%,
  100% {
    clip-path: polygon(
      0% 45%,
      16% 44%,
      33% 50%,
      54% 60%,
      70% 61%,
      84% 59%,
      100% 52%,
      100% 100%,
      0% 100%
    );
  }

  50% {
    clip-path: polygon(
      0% 60%,
      15% 65%,
      34% 66%,
      51% 62%,
      67% 50%,
      84% 45%,
      100% 46%,
      100% 100%,
      0% 100%
    );
  }
}
</style>
