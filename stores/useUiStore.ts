import { defineStore } from 'pinia';

export const useUiStore = defineStore('ui-store', () => {
  const headerNavigationElement = ref<HTMLElement | null>(null);

  return {
    headerNavigationElement,
  };
});
