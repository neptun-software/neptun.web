<script setup lang="ts">
/* import { Timer, Lightbulb } from 'lucide-vue-next'; */

definePageMeta({
  name: 'Home',
  alias: ['/root', '/about'],
})

// defineOgImageComponent('NuxtSeo');

const features = ['Docker files', 'docker-compose files', 'github-workflows']

/* const successOperation = async () => {
  await new Promise((resolve) => setTimeout(resolve, 2000));
  return { success: true };
};

const errorOperation = async () => {
  await new Promise((_, reject) =>
    setTimeout(() => reject(new Error('Operation failed')), 1000)
  );
};

const longOperation = async () => {
  await new Promise((resolve) => setTimeout(resolve, 5000));
  return { success: true };
};

const handleError = (error: unknown) => {
  console.error('Operation failed:', error);
}; */
</script>

<template>
  <section id="home" class="overflow-x-hidden relative">
    <!-- <PlanetSystem
      :imagePaths="[
        '/assets/icons/docker-icon.svg',
        '/assets/icons/github-actions.svg',
        '/assets/icons/github-icon.svg',
        '/assets/icons/hugging-face-icon.svg',
        '/assets/icons/mistral-ai-icon.svg',
      ]"
      :imageSizeMin="100"
    /> -->

    <SecondarySection :is-first="true" class="overflow-hidden">
      <div class="flex flex-col items-center min-h-screen content">
        <Bubbles />

        <div v-if="!$device.isApple" class="relative headline">
          <h2
            class="headline-text text-[6rem] sm:text-[8rem] md:text-[10rem] lg:text-[12rem] xl:text-[14rem] 2xl:text-[16rem]"
          >
            Neptun
          </h2>
          <h2
            class="headline-animation text-[6rem] sm:text-[8rem] md:text-[10rem] lg:text-[12rem] xl:text-[14rem] 2xl:text-[16rem]"
          >
            Neptun
          </h2>
        </div>
        <div v-else class="relative headline">
          <h2
            class="text-[6rem] sm:text-[8rem] md:text-[10rem] lg:text-[12rem] xl:text-[14rem] 2xl:text-[16rem] mt-4"
          >
            Neptun
          </h2>
        </div>

        <TextInOut
          text="Automatically generates your "
          :text-to-loop="features"
          :duration="1.3"
        />

        <TypeText
          :type-data="[
            'Dear AI,\nPlease generate me every configuration file I need to deploy this Nuxt project to Digital Ocean.',
            'Create me a Dockerfile for my Svelte SPA, please!',
            'Hey!\n generate me every file I need to implement CICD for my Laravel project.',
            'Generate me a docker-compose.yml file for this Next project!',
          ]"
        >
          <CallToAction>
            <NuxtLink class="cta-button" to="/sign-up">
              <ShadcnButton variant="outline">
                send
              </ShadcnButton>
            </NuxtLink>
          </CallToAction>
        </TypeText>
      </div>
    </SecondarySection>

    <!-- <SpotlightCards
      :cards="[
        {
          title: 'More time for the actual project!',
          description:
            'The more time you spend on the actual project, the better. Am I right?',
          icon: Timer,
        },
        {
          title: 'Easy entry!',
          description:
            'Neptun is a very good starting point, for you to learn how to dockerize your applications.',
          icon: Lightbulb,
        },
      ]"
    /> -->

    <SecondarySection :is-last="true">
      <Preview />
      <Benefits />
      <Features />
    </SecondarySection>

    <!-- <div class="space-y-4">
      <AsyncButton :onClickAsync="successOperation" @error="handleError">
        Success (2s)
      </AsyncButton>

      <AsyncButton :onClickAsync="errorOperation" @error="handleError">
        Error (1s)
      </AsyncButton>

      <AsyncButton :onClickAsync="longOperation" @error="handleError">
        Long Operation (5s)
      </AsyncButton>
    </div> -->

    <Cursor v-if="$device.isDesktop" />
    <!-- <SimpleCursor /> -->
  </section>
</template>

<style lang="postcss" scoped>
.svg-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

/* SVG Styling */
.svg {
  position: absolute;
  width: 100%;
  height: auto;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) scale(1); /* center and scale the SVG */
  object-fit: cover; /* ensure the SVG covers the container */
}

.content {
  z-index: 2;
  position: relative;
}

.headline {
  margin-top: -6rem;
  user-select: none;
  font-weight: 900;
}

.headline-text {
  @apply stroke-slate-900 dark:stroke-[#5799c5] stroke-[5px] text-primary-foreground dark:text-primary;
  -webkit-text-stroke: 5px #0f172a;
}

.dark .headline-text {
  -webkit-text-stroke: 5px #5799c5;
}

.headline-animation {
  position: absolute;
  top: 0;
  left: 0;
  @apply text-slate-900 dark:text-[#5799c5];
  animation: animate 4s ease-in-out infinite;
}

@keyframes animate {
  0%,
  100% {
    clip-path: polygon(0% 45%, 16% 44%, 33% 50%, 54% 60%, 70% 61%, 84% 59%, 100% 52%, 100% 100%, 0% 100%);
  }

  50% {
    clip-path: polygon(0% 60%, 15% 65%, 34% 66%, 51% 62%, 67% 50%, 84% 45%, 100% 46%, 100% 100%, 0% 100%);
  }
}
</style>
