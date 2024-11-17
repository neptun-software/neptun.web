<script lang="ts" setup>
import { Eye, EyeOff } from 'lucide-vue-next';

interface Props {
  onEnter: () => Promise<any>;
  modelValue: string; // password
}

const props = defineProps<Props>();

const emit = defineEmits(['update:modelValue']);
const onInput = (value: string) => {
  emit('update:modelValue', value);
};

const passwordIsVisible = ref(false);
const togglePasswordVisibility = () => {
  passwordIsVisible.value = !passwordIsVisible.value;
};
</script>

<template>
  <div class="relative">
    <ShadcnInput
      id="password"
      :type="passwordIsVisible ? 'text' : 'password'"
      placeholder="&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;"
      name="password"
      required
      autocomplete="current-password"
      @keydown.enter="props.onEnter()"
      @input="onInput($event.target.value)"
    />
    <ShadcnButton
      variant="link"
      size="icon"
      class="absolute top-0 right-0 flex items-center justify-center pr-3"
      @click="togglePasswordVisibility"
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
