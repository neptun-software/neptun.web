<script lang="ts" setup>
import type { Message } from 'ai'
import type { ChatMessages, ShareInfo } from '~/lib/types/database.tables/schema'
import { useFetchResource } from '~/composables/useFetchResource'

// defineOgImageComponent('NuxtSeo');

const route = useRoute() // $route should work too, but most of the time it doesn't

const { data, error, status, password, execute } = useFetchResource<{
  chatMessages: ChatMessages
  shareInfo: ShareInfo
}>(`/api/shared/chats/${route.params.uuid}`, {
  transform: convertStringsToDates,
  requiresAuth: true,
})

const chatMessages = computed(() => {
  return (
    data.value?.chatMessages?.map(
      ({ id, message, actor }) =>
        ({
          id: `${String(id)}-${String(Date.now())}`,
          content: message,
          role: actor,
        } as Message),
    ) || []
  )
})

onMounted(() => {
  execute()
})

useHead({
  title: `Chat Share - ${route.params.uuid}`,
})
</script>

<template>
  <div class="relative p-4">
    <InfoBlock show-loader show-dots :is-visible="status === 'pending'">
      Loading chat share
    </InfoBlock>

    <template v-if="error">
      <p class="text-center">
        <template v-if="!error?.data?.data?.shareInfo?.shareExists">
          Chat share does not exist. Or you are not authorized to view it.
        </template>
        <template v-else-if="!error?.data?.data?.shareInfo?.shareIsActive">
          Chat share is not active.
        </template>
        <template v-else-if="error?.data?.data?.shareInfo?.shareIsPrivate">
          <h2 class="text-3xl font-extrabold">
            Chat share is private.
          </h2>

          <template v-if="error?.data?.data?.shareInfo?.shareHasPassword">
            Please enter the password to view it: <br>
            <div class="flex justify-center gap-1 my-2">
              <ShadcnInput
                v-model="password"
                class="w-fit"
                type="password"
                placeholder="&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;"
              />
              <AsyncButton :on-click-async="execute">
                Submit
              </AsyncButton>
            </div>
          </template>
          <template v-if="error?.data?.data?.shareInfo?.shareHasWhitelist">
            <template v-if="!error?.data?.data?.shareInfo?.shareHasPassword">
              If you can not see it, you are not on the whitelist.
            </template>
          </template>
        </template>
        <br>
        <span>
          [{{ error?.data?.statusCode }}] {{ error?.data?.statusMessage }}
        </span>
      </p>
    </template>
    <div v-if="status !== 'error'">
      <ShadcnScrollArea>
        <DashboardChatMessages
          v-if="status === 'success' && chatMessages.length > 0"
          :messages="chatMessages"
        />
        <p v-else class="text-center">
          There are no chat messages in this chat share...
        </p>

        <template v-if="status === 'pending'">
          <MessagesSkeleton />
        </template>
      </ShadcnScrollArea>
    </div>

    <AsyncButton
      class="sticky mx-auto mt-2 transform -translate-x-1/2 bottom-2 left-1/2"
      :on-click-async="execute"
    >
      Refresh Chat
    </AsyncButton>
  </div>
</template>

<style scoped></style>
