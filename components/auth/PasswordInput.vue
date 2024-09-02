<script lang="ts" setup>
import { Eye, EyeOff } from 'lucide-vue-next';

interface Props {
  onEnter: () => Promise<any>;
  modelValue: string; // password
}

const props = defineProps<Props>();
const passwordIsVisible = ref(false);
const togglePasswordVisibility = () => {
  passwordIsVisible.value = !passwordIsVisible.value;
};
</script>

<template>
  <div class="relative">
    <ShadcnInput
      @keydown.enter="props.onEnter()"
      :type="passwordIsVisible ? 'text' : 'password'"
      placeholder="&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;"
      id="password"
      name="password"
      v-model="props.modelValue"
      @input="$emit('update:modelValue', $event.target.value)"
      required
      autocomplete="current-password"
    />
    <ShadcnButton
      type="button"
      variant="link"
      size="icon"
      @click="togglePasswordVisibility"
      class="absolute top-0 right-0 flex items-center justify-center pr-3"
    >
      <span v-if="passwordIsVisible">
        <EyeOff class="w-5 h-5" />
      </span>
      <span v-else>
        <Eye class="w-5 h-5" />
      </span>
    </ShadcnButton>
  </div>
</template>

<style scoped></style>
