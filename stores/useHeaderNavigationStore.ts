import { defineStore } from 'pinia';

export const useHeaderNavigationStore = defineStore('header-navigation', () => {
  const headerNavigationElement = ref<HTMLElement | null>(null);

  return {
    headerNavigationElement,
  };
});
