<script setup lang="ts">
import { Icon } from '@iconify/vue';
import {
  validateEmailInput,
  validatePasswordInput,
} from '~/lib/types/input.validation';
import { toast } from 'vue-sonner';
import { Eye, EyeOff } from 'lucide-vue-next';

const { console } = useLogger();

const auth = useAuth();
const { fetch } = useUserSession();
const email = ref('');
const password = ref('');
const emailErrors = ref([]);
const passwordErrors = ref([]);

watch(email, (newEmail) => {
  emailErrors.value = validateEmailInput(newEmail);
});

watch(password, (newPassword) => {
  passwordErrors.value = validatePasswordInput(newPassword);
});

async function signUp() {
  const { error } = await auth.signUp(email.value, password.value);

  if (error) {
    // @ts-ignore
    console.info('error:', error?.message, error?.data);
    // @ts-ignore
    emailErrors.value = error?.data?.data?.issues
      .filter((issue: any) => issue.path[0] === 'email')
      .map((issue: any) => issue.message);
    // @ts-ignore
    passwordErrors.value = error?.data?.data?.issues
      .filter((issue: any) => issue.path[0] === 'password')
      .map((issue: any) => issue.message);

    // @ts-ignore
    toast.error(error?.message);
    return;
  }

  await fetch(); // reloadNuxtApp({ ttl: 0, force: true, persistState: false, path: "/dashboard" });
  navigateTo('/dashboard', {
    redirectCode: 303,
  });
}

const passwordIsVisible = ref(false);
const togglePasswordVisibility = () => {
  passwordIsVisible.value = !passwordIsVisible.value;
};
</script>

<template>
  <div>
    <ShadcnCard class="max-w-full mx-2">
      <ShadcnCardHeader>
        <ShadcnCardTitle class="text-xl"> Sign Up </ShadcnCardTitle>
        <ShadcnCardDescription>
          Enter your information to create an account
        </ShadcnCardDescription>
      </ShadcnCardHeader>
      <ShadcnCardContent>
        <form>
          <div class="grid gap-4">
            <div>
              <div class="grid gap-2 mb-1">
                <ShadcnLabel for="email">Email</ShadcnLabel>
                <ShadcnInput
                  id="email"
                  type="email"
                  name="email"
                  v-model="email"
                  placeholder="your.name@domain.tld"
                  required
                  autocomplete="email"
                />
              </div>

              <ul v-if="emailErrors?.length > 0" class="pl-5 list-disc">
                <li
                  v-for="error in emailErrors"
                  class="text-sm font-bold text-destructive"
                >
                  {{ error }}<br />
                </li>
              </ul>
            </div>
            <div>
              <div class="grid gap-2 mb-1">
                <ShadcnLabel for="password">Password</ShadcnLabel>
                <div class="relative">
                  <ShadcnInput
                    @keydown.enter="signUp()"
                    :type="passwordIsVisible ? 'text' : 'password'"
                    placeholder="&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;"
                    id="password"
                    name="password"
                    v-model="password"
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
              </div>

              <ul v-if="passwordErrors?.length > 0" class="pl-5 list-disc">
                <li
                  v-for="error in passwordErrors"
                  class="text-sm font-bold text-destructive"
                >
                  {{ error }}<br />
                </li>
              </ul>
            </div>
            <ShadcnButton type="button" class="w-full" @click="signUp()">
              Create an account
            </ShadcnButton>
            <ShadcnSeparator label="or Oauth" class="my-2" />
            <div class="flex flex-col gap-1">
              <ShadcnButton
                type="button"
                variant="outline"
                class="w-full"
                as-child
              >
                <a href="/auth/google">
                  <!-- needs to be a instead of NuxtLink, because it is not recognized by the Nuxt router, but does exist -->
                  Sign in/up with Google
                  <Icon
                    icon="devicon:google"
                    class="h-[1.2rem] w-[1.2rem] ml-2"
                  />
                </a>
              </ShadcnButton>
              <ShadcnButton
                type="button"
                variant="outline"
                class="w-full"
                as-child
              >
                <a href="/auth/github">
                  <!-- needs to be a instead of NuxtLink, because it is not recognized by the Nuxt router, but does exist -->
                  Sign in/up with GitHub
                  <Icon
                    icon="ant-design:github-filled"
                    class="h-[1.4rem] w-[1.4rem] ml-2"
                  />
                </a>
              </ShadcnButton>
            </div>
            <ShadcnSeparator />
          </div>
          <div class="mt-4 text-sm text-center">
            Already have an account?
            <NuxtLink to="/login" class="underline"> Log In </NuxtLink>
          </div>
        </form>
      </ShadcnCardContent>
    </ShadcnCard>
  </div>
</template>

<style scoped></style>
