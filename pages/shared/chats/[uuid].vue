<script lang="ts" setup>
import type { Message } from 'ai';

const route = useRoute(); // $route should work too, but most of the time it doesn't

const credentials = btoa(`"":""`);
const { data, status, error, refresh } = useFetch(
  `/api/shared/chats/${route?.params.uuid}`,
  {
    headers: {
      Authorization: `Basic ${credentials}`,
    },
  }
);

const chatMessages = computed(() => {
  return (
    data.value?.chatMessages.map(
      ({ id, message, actor }) =>
        ({
          id: `${String(id)}-${String(Date.now())}`,
          content: message,
          role: actor,
        } as Message)
    ) || []
  );
});
</script>

<template>
  <div class="p-4">
    <template v-if="error">
      <p class="text-center">
        Chat share is not active, doesn't exist or the password is invalid.
        <br />
        <span>
          (
          {{ error }}
          )
        </span>
      </p>
    </template>
    <div v-if="status !== 'error'">
      <ShadcnScrollArea>
        <AiChatMessages :messages="chatMessages" />

        <template v-if="status !== 'pending'">
          <MessagesSkeleton />
        </template>
      </ShadcnScrollArea>
    </div>
    <ShadcnButton class="block mx-auto mt-2" @click="refresh">
      Refresh Chat
    </ShadcnButton>
  </div>
</template>

<style scoped></style>
