<script setup lang="ts">
import type { HTMLAttributes } from 'vue';
import { Primitive, type PrimitiveProps } from 'radix-vue';
import { type ButtonVariants, buttonVariants } from '~/components/ui/button';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-vue-next';

interface Props extends PrimitiveProps {
  variant?: ButtonVariants['variant'];
  size?: ButtonVariants['size'];
  class?: HTMLAttributes['class'];
  isDisabled?: boolean;
  hideLoader?: boolean;
  onClickAsync?: (event: MouseEvent) => Promise<any>;
}

const props = withDefaults(defineProps<Props>(), {
  as: 'button',
});

const isLoading = ref(false);

const emit = defineEmits<{
  error: [error: unknown];
}>();

const handleClick = async (event: MouseEvent) => {
  if (isLoading.value || !props.onClickAsync) return;

  try {
    isLoading.value = true;
    await props.onClickAsync(event);
  } catch (error) {
    emit('error', error);
  } finally {
    isLoading.value = false;
  }
};

const displayLoader = !props.hideLoader;
</script>

<template>
  <Primitive
    :as="as"
    :as-child="asChild"
    :class="cn(buttonVariants({ variant, size }), props.class)"
    :disabled="isLoading || isDisabled"
    @click="handleClick"
  >
    <Loader2
      v-show="isLoading && displayLoader"
      :aria-hidden="!isLoading"
      class="w-4 h-4 mr-2 animate-spin"
    />
    <slot />
  </Primitive>
</template>

<style scoped></style>
