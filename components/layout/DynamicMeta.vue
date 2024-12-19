<script setup lang="ts">
const router = useRouter() // cannot pass $route (RouteLocationNormalizedLoadedGeneric) as prop, because it wouldn't rerender the component correctly
const currentRouteTitle = titleCase(
  router.currentRoute.value.name?.toString() ?? '',
)
</script>

<template>
  <div>
    <Head>
      <Title>{{ currentRouteTitle }}</Title>
    </Head>
  </div>
</template>

<style scoped></style>
