<script lang="ts" setup>
defineProps<{
  isDisabled: boolean;
  includeDiff?: boolean;
}>();

const {
  versionsForSelectedFileType,
  selectedFileVersionId,
  selectedFileVersionDate,
  versionsForSelectedFileTypeComparison,
  selectedComparisonFileVersionId,
  selectedComparisonFileVersionDate,
} = useFiles();
</script>

<template>
  <div>
    <ShadcnLabel
      >Version<template v-if="selectedFileVersionDate">
        (<NuxtTime
          class="text-muted-foreground"
          :datetime="selectedFileVersionDate"
          day="numeric"
          month="numeric"
          year="numeric"
          hour="numeric"
          minute="numeric"
        />)
      </template>
    </ShadcnLabel>

    <ShadcnSelect :disabled="isDisabled" v-model="selectedFileVersionId">
      <ShadcnSelectTrigger>
        <ShadcnSelectValue placeholder="Select a version..." />
      </ShadcnSelectTrigger>
      <ShadcnSelectContent>
        <ShadcnSelectItem
          :value="String(file.id)"
          v-for="file in versionsForSelectedFileType"
        >
          {{ file.title }} {{ file.chat_conversation_message_id }}/{{
            file.id
          }}
          (<NuxtTime
            class="text-muted-foreground"
            :datetime="new Date(file.updated_at ?? new Date())"
            day="numeric"
            month="long"
            year="numeric"
            hour="numeric"
            minute="numeric"
            second="numeric"
          />)
        </ShadcnSelectItem>
      </ShadcnSelectContent>
    </ShadcnSelect>

    <template v-if="includeDiff">
      <ShadcnLabel
        >Comparison<template v-if="selectedComparisonFileVersionDate">
          (<NuxtTime
            class="text-muted-foreground"
            :datetime="selectedComparisonFileVersionDate"
            day="numeric"
            month="numeric"
            year="numeric"
            hour="numeric"
            minute="numeric"
          />)
        </template>
      </ShadcnLabel>

      <ShadcnSelect
        :disabled="isDisabled"
        v-model="selectedComparisonFileVersionId"
      >
        <ShadcnSelectTrigger>
          <ShadcnSelectValue placeholder="Select a version..." />
        </ShadcnSelectTrigger>
        <ShadcnSelectContent>
          <ShadcnSelectItem
            :value="String(file.id)"
            v-for="file in versionsForSelectedFileTypeComparison"
          >
            {{ file.title }} {{ file.chat_conversation_message_id }}/{{
              file.id
            }}
            (<NuxtTime
              class="text-muted-foreground"
              :datetime="new Date(file.updated_at ?? new Date())"
              day="numeric"
              month="long"
              year="numeric"
              hour="numeric"
              minute="numeric"
              second="numeric"
            />)
          </ShadcnSelectItem>
        </ShadcnSelectContent>
      </ShadcnSelect>
    </template>
  </div>
</template>

<style scoped></style>
