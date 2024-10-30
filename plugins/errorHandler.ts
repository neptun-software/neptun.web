import { toast } from 'vue-sonner';

export default defineNuxtPlugin((nuxtApp) => {
  const { console } = useLogger();

  nuxtApp.vueApp.config.errorHandler = (error, instance, info) => {
    toast.error(`Unknown error${IS_DEV ? ` (${error})` : ''}`);
    if (IS_DEV) console.error(error, instance, info);
  };
});
