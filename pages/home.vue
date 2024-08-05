<script setup lang="ts">
definePageMeta({
  name: 'Home',
  alias: ['/root'],
});
</script>

<template>
  <section class="flex items-center justify-center h-full">
    <div class="content">
      <h2>Neptun</h2>
      <h2>Neptun</h2>
    </div>
  </section>
</template>

<style lang="postcss" scoped>
.content {
  position: relative;
}

.content h2 {
  font-size: 16em;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
}

.content h2:nth-child(1) {
  color: transparent;
  @apply stroke-primary;
  -webkit-text-stroke: 2px hsl(var(--primary));
}

.content h2:nth-child(2) {
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
