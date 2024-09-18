<script setup lang="ts">
import { Menu } from 'lucide-vue-next';

defineProps({
  layout: String,
});

const { loggedIn } = useUserSession();
const router = useRouter();
const routes = router.options.routes;

const hiddenRoutes = ['/new-password', '/shared/chats/:uuid()'];
const hiddenRoutesIfLoggedIn = hiddenRoutes.concat(['/log-in', '/sign-up']);
const hiddenRoutesIfLoggedOut = hiddenRoutes.concat([
  '/',
  '/account',
  '/guide',
]);

const visibleRoutes = computed(() => {
  if (loggedIn.value) {
    return routes.filter(
      (route) => !hiddenRoutesIfLoggedIn.includes(route.path)
    );
  } else {
    return routes.filter(
      (route) => !hiddenRoutesIfLoggedOut.includes(route.path)
    );
  }
});

const { width: windowWidth } = useWindowSize();
const useSsrSaveId = () => useId();

const sortedRoutes = computed(() => {
  const homeRoute = visibleRoutes.value.find((route) => route.path === '/home');
  const otherRoutes = visibleRoutes.value.filter(
    (route) => route.path !== '/home'
  );

  if (homeRoute) {
    return [homeRoute, ...otherRoutes];
  }

  return otherRoutes;
});
</script>

<template>
  <div nuxt-client class="flex justify-center">
    <div v-if="windowWidth <= 700 && layout === 'navigation'">
      <ShadcnDropdownMenu>
        <ShadcnDropdownMenuTrigger><Menu /></ShadcnDropdownMenuTrigger>
        <ShadcnDropdownMenuContent class="ml-4">
          <ShadcnDropdownMenuItem v-for="route in visibleRoutes">
            <NuxtLink :to="route.path" activeClass="underline">
              <p :key="useSsrSaveId">{{ route.name }}</p>
            </NuxtLink>
          </ShadcnDropdownMenuItem>
        </ShadcnDropdownMenuContent>
      </ShadcnDropdownMenu>
    </div>

    <ul
      class="flex items-center gap-2"
      v-bind:class="{
        navigation: layout === 'navigation',
        default: layout !== 'navigation',
      }"
      v-if="windowWidth > 700 || layout !== 'navigation'"
    >
      <li v-for="route in sortedRoutes" :key="useSsrSaveId">
        <NuxtLink
          class="font-bold"
          v-if="layout === 'navigation' && route.path === '/home'"
          :to="route.path"
        >
          <ShadcnAvatar>
            <ShadcnAvatarImage src="/favicon.png" alt="Neptun Logo" />
            <ShadcnAvatarFallback>Home</ShadcnAvatarFallback>
          </ShadcnAvatar>
        </NuxtLink>
        <NuxtLink v-else :to="route.path" activeClass="active-link">
          {{ route.name }}
        </NuxtLink>
      </li>
    </ul>
  </div>
</template>

<style lang="postcss" scoped>
ul.default li a {
  display: inline-block;
  position: relative;
}

ul.default li a:after {
  content: '';
  position: absolute;
  width: 100%;
  transform: scaleX(0);
  height: 2px;
  bottom: 0;
  left: 0;
  transform-origin: bottom right;
  transition: transform 0.25s ease-out;
  @apply bg-primary;
}

ul.default li a.active-link:after {
  @apply bg-primary/50;
}

ul.default li a.active-link:after,
ul.default li a.active-link:after,
ul.default li a:hover:after,
ul.default li a:focus:after {
  transform: scaleX(1);
  transform-origin: bottom left;
}

ul.default li a.active-link:hover:after,
ul.default li a.active-link:focus:after {
  @apply bg-primary/80;
}

ul.navigation {
  flex-direction: row;
  flex-wrap: wrap;
  align-items: center;
  list-style: none;
  gap: 0.5rem;
  position: relative;
}

ul.navigation a {
  text-decoration: none;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  position: relative;
  z-index: 1;
}

ul.navigation a::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
  border-radius: 0.25rem;
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.2s ease-in-out;
  @apply bg-accent;
}

ul.navigation a.active-link::before {
  transform: scaleX(1);
  transform-origin: right;
}
</style>
