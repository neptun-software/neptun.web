<script setup lang="ts"></script>

<template>
  <div id="ui-content">
    <DynamicHeader />
    <main>
      <!-- INFO: overflow-x-hidden breaks position sticky and switching to another layout for the dashboard alone breaks the animation... -->
      <!-- class="overflow-x-hidden" -->
      <slot />
    </main>
    <DynamicFooter />
  </div>
</template>

<style scoped>
#ui-content {
  position: relative;
  display: grid;
  grid-template-rows: auto 1fr auto;
  min-height: 100vh;
  min-height: 100dvh;
}
</style>
