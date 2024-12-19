<script setup lang="ts">
import { Icon } from '@iconify/vue'
import {
  ALLOWED_AI_MODELS,
  defaultAiModelDomain,
  POSSIBLE_AI_MODELS,
} from '~/lib/types/ai.models'

const { user } = useUserSession()
const { selectedAiChat, selectedAiChatIsPlayground } = useSelectedAiChat()
const { resetAiPlaygroundChat } = useAiChatPlayground()
const { persistChatConversation } = useAPI()

watch(
  () => selectedAiChat.value.model,
  (newModel) => {
    if (newModel) {
      resetAiPlaygroundChat(newModel)
    }
  },
)
</script>

<template>
  <form class="grid items-start w-full gap-6">
    <fieldset class="grid gap-6 p-4 border rounded-lg">
      <legend class="px-1 -ml-1 text-sm font-medium">
        Settings
      </legend>
      <div class="grid gap-3">
        <ShadcnLabel for="model">
          Model
        </ShadcnLabel>
        <ShadcnSelect
          v-model="selectedAiChat.model"
          :default-value="defaultAiModelDomain"
        >
          <ShadcnSelectTrigger
            id="model"
            :disabled="!selectedAiChatIsPlayground"
            class="items-start [&_[data-description]]:hidden"
          >
            <ShadcnSelectValue placeholder="Select a model" />
          </ShadcnSelectTrigger>
          <ShadcnSelectContent>
            <ShadcnSelectItem
              v-for="model in ALLOWED_AI_MODELS"
              :key="model"
              :value="model"
            >
              <div class="flex items-start gap-3 text-muted-foreground">
                <Icon
                  :icon="
                    POSSIBLE_AI_MODELS[model.split('/')[0]][
                      model.split('/')[1]
                    ].icon
                  "
                  :ssr="true"
                  width="20"
                  height="20"
                />
                <div class="grid gap-0.5">
                  <p class="truncate">
                    {{
                      POSSIBLE_AI_MODELS[model.split('/')[0]][
                        model.split('/')[1]
                      ].publisher
                    }}
                    <span class="font-medium text-foreground">
                      {{
                        POSSIBLE_AI_MODELS[model.split('/')[0]][
                          model.split('/')[1]
                        ].name
                      }}
                    </span>
                  </p>
                  <p
                    class="text-xs"
                    data-description
                    v-html="
                      POSSIBLE_AI_MODELS[model.split('/')[0]][
                        model.split('/')[1]
                      ].description
                    "
                  />
                </div>
              </div>
            </ShadcnSelectItem>
          </ShadcnSelectContent>
        </ShadcnSelect>
        <div class="grid grid-cols-[1fr_auto] gap-1">
          <ShadcnInput
            id="chat-name"
            v-model="selectedAiChat.name"
            :disabled="!selectedAiChatIsPlayground"
            type="text"
            placeholder="Name of the chat... (optional)"
            @keydown.enter.prevent="
              async () => {
                selectedAiChat.id
                  = (await persistChatConversation(
                    user?.id ?? -1,
                    selectedAiChat.name,
                    selectedAiChat.model,
                  )) || -1;
              }
            "
          />

          <AsyncButton
            variant="secondary"
            :is-disabled="!selectedAiChatIsPlayground"
            :on-click-async="
              async () => {
                selectedAiChat.id
                  = (await persistChatConversation(
                    user?.id ?? -1,
                    selectedAiChat.name,
                    selectedAiChat.model,
                  )) || -1;
              }
            "
          >
            Persist Chat History
          </AsyncButton>
        </div>

        <ShadcnButton
          :disabled="selectedAiChatIsPlayground"
          variant="secondary"
          @click="() => resetAiPlaygroundChat()"
        >
          New Playground Chat
        </ShadcnButton>
      </div>
    </fieldset>
  </form>
</template>

<style scoped></style>
