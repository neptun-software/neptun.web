<script lang="ts" setup>
import type { TemplateCollectionWithTemplates } from '~/components/pages/templates/(shared)/types'
import { useFetchResource } from '~/composables/useFetchResource'

const route = useRoute()

const { data, error, status, execute } = useFetchResource<{
  collection: TemplateCollectionWithTemplates
}>(`/api/shared/collections/${route.params.uuid}`)

onMounted(() => {
  execute()
})

useHead({
  title: `Collection Share - ${route.params.uuid}`,
})
</script>

<template>
  <div class="relative p-4">
    <InfoBlock show-loader show-dots :is-visible="status === 'pending'">
      Loading collection share
    </InfoBlock>

    <div v-if="error">
      <p class="text-center">
        Collection share does not exist or is not public.
        <br>
        <span>
          {{ error?.data?.statusCode }} {{ error?.data?.statusMessage }}
        </span>
      </p>
    </div>

    <div v-if="status === 'success' && data?.collection && data.collection.templates.length > 0">
      <CollectionTemplate
        :collection="{
          ...data.collection,
          share_uuid: route.params.uuid as string,
        }" full-width :use-simple-renderer="true"
      />
    </div>
    <div v-else-if="status === 'success' && data?.collection && data.collection.templates.length === 0">
      <InfoBlock :show-loader="false" :show-dots="false" :is-visible="true">
        There are no templates in this collection.
      </InfoBlock>
    </div>

    <AsyncButton
      class="sticky mx-auto mt-2 transform -translate-x-1/2 bottom-2 left-1/2"
      :on-click-async="execute"
    >
      Refresh Collection
    </AsyncButton>
  </div>
</template>
