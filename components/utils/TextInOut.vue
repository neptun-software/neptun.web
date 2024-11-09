<script setup>
import gsap from 'gsap';

const props = defineProps({
  text: {
    type: String,
    required: true,
  },
  textToLoop: {
    type: Array,
    default: () => [],
  },
  duration: {
    type: Number,
    default: 2,
  },
});

const dynamicText = ref(null);
const currentText = ref(props.textToLoop[0]);
let currentIndex = 0;

// Calculate slide height based on dynamic text height
const slideHeight = ref(0);

const updateText = () => {
  const newIndex = (currentIndex + 1) % props.textToLoop.length;
  const newText = props.textToLoop[newIndex];

  gsap.to(dynamicText.value, {
    y: -slideHeight.value,
    opacity: 0,
    duration: props.duration / 2,
    ease: 'power1.in',
    onComplete: () => {
      currentText.value = newText;
      gsap.fromTo(
        dynamicText.value,
        { y: slideHeight.value, opacity: 0 },
        { y: 0, opacity: 1, duration: props.duration / 2, ease: 'power1.out' }
      );
    },
  });

  currentIndex = newIndex;
};

onMounted(async () => {
  await nextTick(); // Wait until the text is rendered, then calculate the height
  slideHeight.value = dynamicText.value.offsetHeight / 4;

  const interval = setInterval(updateText, props.duration * 1000);
  onUnmounted(() => clearInterval(interval));
});
</script>

<template>
  <div class="text-slider">
    <p
      class="inline my-6 text-3xl font-extrabold text-center sm:my-8 lg:my-10 sm:text-4xl lg:text-5xl"
    >
      {{ text }}
      <span ref="dynamicText" class="dynamic-text">{{ currentText }}</span>
    </p>
  </div>
</template>

<style scoped>
.text-slider {
  text-align: center;
  position: relative;
  overflow: hidden;
  padding-top: 1rem;
  padding-bottom: 1rem;
}

.dynamic-text {
  display: inline-block;
  position: relative;
}
</style>
