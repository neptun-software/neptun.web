<script setup lang="ts">
definePageMeta({
  name: 'Home',
  alias: ['/root'],
});

const features = ['docker-files', 'docker-compose-files', 'github-workflows'];
</script>

<template>
  <section id="home" class="relative overflow-x-hidden">
    <!-- hm... -->
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

    <SecondarySection :isFirst="true" class="overflow-hidden">
      <div class="flex flex-col items-center min-h-screen content">
        <Bubbles />

        <div class="relative headline">
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

        <TextInOut
          :text="'Automatically generates your '"
          :textToLoop="features"
          :duration="1.5"
        />

        <TypeText
          :typeData="[
            'Hey!\n generate me every file I need to implement CICD.',
            'docker-compose-files',
          ]"
        >
          <CallToAction>
            <NuxtLink class="cta-button" to="/sign-up">
              <ShadcnButton
                class="bg-slate-950 text-slate-200 hover:bg-slate-950 hover:text-slate-200"
                variant="outline"
                >send</ShadcnButton
              >
            </NuxtLink>
          </CallToAction>
        </TypeText>
      </div>
    </SecondarySection>

    <SecondarySection :isLast="true">
      <Preview />
      <Benefits />
      <Features />
    </SecondarySection>
    <!-- <Cursor /> -->
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
  @apply stroke-slate-800 stroke-[5px] text-slate-200;
  -webkit-text-stroke: 5px #1e293b;
}

.headline-animation {
  position: absolute;
  top: 0;
  left: 0;
  @apply text-slate-950;
  animation: animate 4s ease-in-out infinite;
}

@keyframes animate {
  0%,
  100% {
    clip-path: polygon(
      0% 45%,
      16% 44%,
      33% 50%,
      54% 60%,
      70% 61%,
      84% 59%,
      100% 52%,
      100% 100%,
      0% 100%
    );
  }

  50% {
    clip-path: polygon(
      0% 60%,
      15% 65%,
      34% 66%,
      51% 62%,
      67% 50%,
      84% 45%,
      100% 46%,
      100% 100%,
      0% 100%
    );
  }
}
</style>
