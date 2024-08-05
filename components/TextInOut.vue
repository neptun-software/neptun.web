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

const updateText = () => {
  const newIndex = (currentIndex + 1) % props.textToLoop.length;
  const newText = props.textToLoop[newIndex];

  // animate out the old text
  gsap.to(dynamicText.value, {
    y: -50,
    opacity: 0,
    duration: props.duration / 2,
    ease: 'power1.in',
    onComplete: () => {
      // update the text
      currentText.value = newText;

      // animate in the new text
      gsap.fromTo(
        dynamicText.value,
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: props.duration / 2, ease: 'power1.out' }
      );
    },
  });

  currentIndex = newIndex;
};

onMounted(() => {
  const interval = setInterval(updateText, props.duration * 1000);
  onUnmounted(() => clearInterval(interval));
});
</script>

<template>
  <div class="text-slider">
    <p
      class="inline my-8 ml-4 text-5xl font-extrabold text-center text-slate-800"
    >
      {{ text }}
      <span class="dynamic-text" ref="dynamicText">{{ currentText }}</span>
    </p>
  </div>
</template>

<style scoped>
.text-slider {
  text-align: center;
  position: relative;
  overflow: hidden;
  height: auto;
  padding: 2.5rem 1rem;
}

.dynamic-text {
  display: inline-block;
  position: relative;
}
</style>
