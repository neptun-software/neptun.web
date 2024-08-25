<script lang="ts" setup>
import type { Message } from 'ai';
import { Loader2 } from 'lucide-vue-next';

// TODO: correct typescript typings

const route = useRoute(); // $route should work too, but most of the time it doesn't

function useProtectedFetch(url: string) {
  const data = ref<any>(null);
  const error = ref<any>(null);
  const status = ref<any>('idle');
  const password = ref<any>('');

  const credentials = computed(() => btoa(`:${password.value}`));

  const execute = async () => {
    status.value = 'pending';
    try {
      const response = await $fetch(url, {
        headers: {
          Authorization: `Basic ${credentials.value}`,
        },
      });
      data.value = response;
      status.value = 'success';
      error.value = null;
    } catch (e) {
      error.value = e;
      status.value = 'error';
    }
  };

  return {
    data,
    error,
    status,
    execute,
    password,
  };
}

const { data, error, status, password, execute } = useProtectedFetch(
  `/api/shared/chats/${route.params.uuid}`
);

const chatMessages = computed(() => {
  return (
    data.value?.chatMessages?.map(
      // @ts-ignore
      ({ id, message, actor }) =>
        ({
          id: `${String(id)}-${String(Date.now())}`,
          content: message,
          role: actor,
        } as Message)
    ) || []
  );
});

onMounted(() => {
  execute();
});
</script>

<template>
  <div class="relative p-4">
    <div
      v-show="status === 'pending'"
      class="flex items-center justify-center gap-2 px-3 py-2 mb-2 border border-blue-200 rounded-lg bg-background"
    >
      <Loader2 class="w-4 h-4 mr-1 text-blue-500 animate-spin" />
      <p class="flex-grow">Loading chat share<LoadingDots /></p>
    </div>

    <template v-if="error">
      <p class="text-center">
        <template v-if="!error?.data?.data?.shareInfo?.shareExists">
          Chat share does not exist.
        </template>
        <template v-else-if="!error?.data?.data?.shareInfo?.shareIsActive">
          Chat share is not active.
        </template>
        <template v-else-if="error?.data?.data?.shareInfo?.shareIsPrivate">
          <h2 class="text-3xl font-extrabold">Chat share is private.</h2>

          <template v-if="error?.data?.data?.shareInfo?.shareHasPassword">
            Please enter the password to view it: <br />
            <div class="flex justify-center gap-1 my-2">
              <ShadcnInput
                class="w-fit"
                type="password"
                placeholder="&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;"
                v-model="password"
              />
              <ShadcnButton @click="execute">Submit</ShadcnButton>
            </div>
          </template>
          <template v-if="error?.data?.data?.shareInfo?.shareHasWhitelist">
            <template v-if="!error?.data?.data?.shareInfo?.shareHasPassword">
              If you can not see it, you are not on the whitelist.
            </template>
          </template>
        </template>
        <br />
        <span>
          {{ error?.data?.statusCode }} {{ error?.data?.statusMessage }}
        </span>
      </p>
    </template>
    <div v-if="status !== 'error'">
      <ShadcnScrollArea>
        <AiChatMessages v-if="status === 'success'" :messages="chatMessages" />

        <template v-if="status === 'pending'">
          <MessagesSkeleton />
        </template>
      </ShadcnScrollArea>
    </div>

    <ShadcnButton
      v-if="status === 'success'"
      class="sticky mx-auto mt-2 transform -translate-x-1/2 bottom-2 left-1/2"
      @click="execute"
    >
      Refresh Chat
    </ShadcnButton>
  </div>
</template>

<style scoped></style>
