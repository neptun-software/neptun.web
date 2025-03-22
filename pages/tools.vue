<script setup lang="ts">
definePageMeta({
  name: 'Tools',
  alias: toolsAliases,
})
</script>

<template>
  <div class="container p-6 space-y-6">
    <ShadcnCard>
      <ShadcnCardHeader>
        <ShadcnCardTitle>Configuration Tools</ShadcnCardTitle>
      </ShadcnCardHeader>
      <ShadcnCardContent>
        <DockerCommandToDockerCompose />
      </ShadcnCardContent>
    </ShadcnCard>

    <ShadcnCard>
      <ShadcnCardHeader>
        <ShadcnCardTitle>Software Recommendations</ShadcnCardTitle>
        <ShadcnCardDescription>Curated list of recommended software and tools</ShadcnCardDescription>
      </ShadcnCardHeader>
      <ShadcnCardContent>
        <SoftwareRecommendations />
      </ShadcnCardContent>
    </ShadcnCard>
  </div>
</template>

<style scoped>
</style>
