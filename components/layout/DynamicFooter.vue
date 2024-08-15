<script setup lang="ts"></script>

<template>
  <footer class="z-10 flex flex-col border-t bg-background">
    <AppLinks />
    <p class="mt-2 text-center text-muted-foreground">
      Animated Icons by
      <NuxtLink
        class="hover:underline"
        to="https://useanimations.com/"
        external
      >
        useanimations
      </NuxtLink>
    </p>
  </footer>
</template>

<style scoped>
footer {
  padding: 2rem;
  display: flex;
  justify-content: center;
}
</style>
