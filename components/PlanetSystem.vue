<script setup>
import gsap from 'gsap';

const props = defineProps({
  imagePaths: {
    type: Array,
    required: true
  },
  exclusionRadius: {
    type: Number,
    default: 600
  },
  paddingX: {
    type: Number,
    default: 100
  },
  paddingY: {
    type: Number,
    default: 200
  },
  maxUsagePerImage: {
    type: Number,
    default: 1
  },
  imageSizeMin: {
    type: Number,
    default: 30
  },
  imageSizeMax: {
    type: Number,
    default: 100
  }
});

const exclusionRadius = props.exclusionRadius;
const paddingX = props.paddingX;
const paddingY = props.paddingY;
const maxUsagePerImage = props.maxUsagePerImage;

const container = ref(null);
const stars = ref([]);

const initializeStars = () => {
  const containerWidth = container.value.offsetWidth;
  const containerHeight = container.value.offsetHeight;
  const centerX = containerWidth / 2;
  const centerY = containerHeight / 2;
  const starImages = [];

  props.imagePaths.forEach((path) => {
    for (let i = 0; i < maxUsagePerImage; i++) {
      starImages.push(path);
    }
  });

  const starCount = starImages.length;

  stars.value = Array.from({ length: starCount }, (_, index) => {
    const size
      = Math.random() * (props.imageSizeMax - props.imageSizeMin)
      + props.imageSizeMin;
    let x, y, distance;

    do {
      x = Math.random() * (containerWidth - 2 * paddingX) + paddingX;
      y = Math.random() * (containerHeight - 2 * paddingY) + paddingY;
      const dx = x - centerX;
      const dy = y - centerY;
      distance = Math.sqrt(dx * dx + dy * dy);
    } while (distance < exclusionRadius);

    return {
      src: starImages[index],
      style: {
        position: 'absolute',
        width: `${size}px`,
        height: `${size}px`,
        top: `${y}px`,
        left: `${x}px`,
        transform: `translate(-50%, -50%)`
      }
    }
  });
};

const handleMouseMove = (event) => {
  const { clientX, clientY } = event;
  const centerX = window.innerWidth / 2;
  const centerY = window.innerHeight / 2;
  const deltaX = clientX - centerX;
  const deltaY = clientY - centerY;
  stars.value.forEach((star, index) => {
    const movement = (index + 1) / stars.value.length;
    gsap.to(star.style, {
      transform: `translate(${deltaX * movement * 0.1}px, ${
        deltaY * movement * 0.1
      }px)`,
      duration: 0.3,
      ease: 'power1.out'
    })
  });
}

onMounted(() => {
  initializeStars();
  window.addEventListener('mousemove', handleMouseMove);
})

onBeforeUnmount(() => {
  window.removeEventListener('mousemove', handleMouseMove);
})
</script>

<template>
  <div
    ref="container"
    class="container"
  >
    <img
      v-for="(star, index) in stars"
      :key="index"
      :src="star.src"
      :style="star.style"
      class="star"
    >
  </div>
</template>

<style scoped>
.container {
  position: absolute;
  top: 0;
  left: 0;
  min-width: 100vw;
  height: 100vh;
  overflow: hidden;
  z-index: 1;
}

.star {
  pointer-events: none;
  will-change: transform; /* hint to the browser that this element will change */
}
</style>
