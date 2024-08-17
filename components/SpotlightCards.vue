<script setup>
const props = defineProps({
  cards: {
    type: [
      {
        scr: String,
        icon: Object,
        title: String,
        description: String,
      },
    ],
    required: true,
  },
});

class Spotlight {
  constructor(containerElement) {
    this.container = containerElement;
    this.cards = Array.from(this.container.children);
    this.mouse = { x: 0, y: 0 };
    this.containerSize = { w: 0, h: 0 };
    this.initContainer = this.initContainer.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
    this.init();
  }

  initContainer() {
    this.containerSize.w = this.container.offsetWidth;
    this.containerSize.h = this.container.offsetHeight;
  }

  onMouseMove(event) {
    const { clientX, clientY } = event;
    const rect = this.container.getBoundingClientRect();
    const { w, h } = this.containerSize;
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    const inside = x < w && x > 0 && y < h && y > 0;

    if (inside) {
      this.mouse.x = x;
      this.mouse.y = y;
      this.cards.forEach((card) => {
        const cardRect = card.getBoundingClientRect();
        const cardX = -(cardRect.left - rect.left) + this.mouse.x;
        const cardY = -(cardRect.top - rect.top) + this.mouse.y;
        card.style.setProperty('--mouse-x', `${cardX}px`);
        card.style.setProperty('--mouse-y', `${cardY}px`);
      });
    }
  }

  init() {
    this.initContainer();
    window.addEventListener('resize', this.initContainer);
    window.addEventListener('mousemove', this.onMouseMove);
  }

  destroy() {
    window.removeEventListener('resize', this.initContainer);
    window.removeEventListener('mousemove', this.onMouseMove);
  }
}

onMounted(() => {
  const spotlights = document.querySelectorAll('[data-spotlight]');
  spotlights.forEach((spotlight) => {
    spotlight._spotlightInstance = new Spotlight(spotlight);
  });
});

onUnmounted(() => {
  const spotlights = document.querySelectorAll('[data-spotlight]');
  spotlights.forEach((spotlight) => {
    if (spotlight._spotlightInstance) {
      spotlight._spotlightInstance.destroy();
    }
  });
});
</script>

<template>
  <div class="relative overflow-hidden antialiased">
    <div class="w-full max-w-6xl px-4 py-24 mx-auto md:px-6">
      <div
        class="grid items-start max-w-sm gap-6 mx-auto lg:grid-cols-3 lg:max-w-none group"
        data-spotlight
      >
        <SpotlightCard
          v-for="(card, index) in cards"
          :key="index"
          :src="card.src"
          :icon="card.icon"
          :title="card.title"
          :description="card.description"
          :index="index"
        />
      </div>
    </div>
  </div>
</template>

<style scoped></style>
