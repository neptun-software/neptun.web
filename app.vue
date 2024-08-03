<template>
  <div id="ui-content">
    <header>Header</header>

    <NuxtRouteAnnouncer />
    <main>Main</main>

    <footer>Footer</footer>
  </div>
</template>

<style scoped>
header {
  position: sticky;
  top: 0;
  z-index: 999;
}

#ui-content {
  position: relative;
  display: grid;
  grid-template-rows: auto 1fr auto;
  min-height: 100vh;
  min-height: 100dvh;
}
</style>
