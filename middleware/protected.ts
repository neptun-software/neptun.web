import { defineNuxtRouteMiddleware, navigateTo } from 'nuxt/app';

export default defineNuxtRouteMiddleware((to, _from) => {
  const { loggedIn } = useUserSession();
  const { console } = useLogger();

  if (!loggedIn.value) {
    console.info('Page is protected: Your are not logged in!');
    return navigateTo('/login');
  }
});
