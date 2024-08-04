<script setup lang="ts">
const { loggedIn } = useUserSession();
// Thanks to https://codepen.io/Mamboleoo/pen/obWGYr ♥
const colorMode = useColorMode();
const colors = computed(() => {
  return colorMode.preference === 'dark'
    ? ['#00FFFF', '#1E90FF', '#00BFFF', '#00CED1', '#00B2FF']
    : ['#0e7490', '#083344', '#042f2e', '#082f49', '#60a5fa'];
});

const { x, y } = useMouse();
const mouse = ref<Mouse>({ x: 0, y: 0 });
const radius = ref<number>(1);

watch(colors, () => {
  initScene();
});

watch(x, (newX) => {
  mouse.value.x = newX;
});

watch(y, (newY) => {
  mouse.value.y = newY;
});

interface Mouse {
  x: number;
  y: number;
}

class Particle {
  x: number;
  y: number;
  dest: { x: number; y: number };
  r: number;
  vx: number;
  vy: number;
  accX: number;
  accY: number;
  friction: number;
  color: string;

  constructor(x: number, y: number, colors: string[]) {
    this.x = Math.random() * window.innerWidth;
    this.y = Math.random() * window.innerHeight;
    this.dest = { x, y };
    this.r = Math.random() * 5 + 2;
    this.vx = (Math.random() - 0.5) * 20;
    this.vy = (Math.random() - 0.5) * 20;
    this.accX = 0;
    this.accY = 0;
    this.friction = Math.random() * 0.05 + 0.94;
    this.color = colors[Math.floor(Math.random() * colors.length)];
  }

  render(ctx: CanvasRenderingContext2D, mouse: Mouse, radius: number) {
    this.accX = (this.dest.x - this.x) / 500;
    this.accY = (this.dest.y - this.y) / 500;
    this.vx += this.accX;
    this.vy += this.accY;
    this.vx *= this.friction;
    this.vy *= this.friction;
    this.x += this.vx;
    this.y += this.vy;

    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    ctx.fill();

    const a = this.x - mouse.x;
    const b = this.y - mouse.y;
    const distance = Math.sqrt(a * a + b * b);

    const multiplier = 15;
    if (distance < radius * multiplier) {
      // multiplier for the interaction radius
      const force = (radius * multiplier - distance) / (radius * multiplier); // force calculation
      this.accX = ((this.x - mouse.x) * force) / 10; // divisor for impact strength
      this.accY = ((this.y - mouse.y) * force) / 10; // divisor for impact strength
      this.vx += this.accX;
      this.vy += this.accY;
    }
  }
}

const canvas = ref<HTMLCanvasElement | null>(null);

const particles: Particle[] = [];
const staticText = 'Neptun';

const initScene = () => {
  if (!canvas.value) return;

  const ctx = canvas.value.getContext('2d');
  if (!ctx) return;

  const ww = (canvas.value.width = window.innerWidth);
  const wh = (canvas.value.height = window.innerHeight);

  ctx.clearRect(0, 0, canvas.value.width, canvas.value.height);
  ctx.font = `bold ${ww / 4}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle'; // Align text vertically in the middle
  ctx.fillText(staticText, ww / 2, wh / 2);

  const data = ctx.getImageData(0, 0, ww, wh).data;
  ctx.clearRect(0, 0, canvas.value.width, canvas.value.height);
  ctx.globalCompositeOperation = 'screen';

  particles.length = 0;
  for (let i = 0; i < ww; i += Math.round(ww / 150)) {
    for (let j = 0; j < wh; j += Math.round(ww / 150)) {
      if (data[(i + j * ww) * 4 + 3] > 150) {
        particles.push(new Particle(i, j, colors.value));
      }
    }
  }
};

const render = () => {
  if (!canvas.value) return;

  const ctx = canvas.value.getContext('2d');
  if (!ctx) return;

  requestAnimationFrame(render);
  ctx.clearRect(0, 0, canvas.value.width, canvas.value.height);
  particles.forEach((particle) =>
    particle.render(ctx, mouse.value, radius.value)
  );
};

const onTouchEnd = (event: TouchEvent) => {
  const touch = event.changedTouches[0];
  mouse.value.x = touch.clientX;
  mouse.value.y = touch.clientY;
};

const onMouseClick = () => {
  radius.value = radius.value === 5 ? 1 : radius.value + 1;
};

onMounted(() => {
  window.addEventListener('resize', initScene);
  window.addEventListener('click', onMouseClick);
  window.addEventListener('touchend', onTouchEnd);
  initScene();
  requestAnimationFrame(render);
});

onUnmounted(() => {
  window.removeEventListener('resize', initScene);
  window.removeEventListener('click', onMouseClick);
  window.removeEventListener('touchend', onTouchEnd);
});

const headerNavigationStore = useHeaderNavigationStore();
const { headerNavigationElement } = storeToRefs(headerNavigationStore);

const headerNavigationHeight = ref(loggedIn.value ? 81 : 77);
watch(headerNavigationElement, (newHeaderNavigationElement) => {
  const { height } = useElementSize(newHeaderNavigationElement);
  headerNavigationHeight.value = height.value;
});

definePageMeta({
  name: 'Home',
  alias: ['/root'],
});
</script>

<template>
  <div class="overflow-hidden">
    <canvas ref="canvas" id="scene" class="z-10 bg-slate-950"></canvas>
    <div
      class="absolute left-0 z-50 w-full bg-cyan-600"
      :style="{ top: headerNavigationHeight + 'px' }"
    >
      <div>
        <svg
          class="waves"
          xmlns="http://www.w3.org/2000/svg"
          xmlns:xlink="http://www.w3.org/1999/xlink"
          viewBox="0 24 150 28"
          preserveAspectRatio="none"
          shape-rendering="auto"
        >
          <defs>
            <path
              id="gentle-wave"
              d="M-160 44c30 0 58-18 88-18s 58 18 88 18 58-18 88-18 58 18 88 18 v44h-352z"
            />
          </defs>
          <g class="parallax">
            <use
              xlink:href="#gentle-wave"
              x="48"
              y="0"
              class="fill-slate-950/70"
            />
            <use
              xlink:href="#gentle-wave"
              x="48"
              y="3"
              class="fill-slate-950/50"
            />
            <use
              xlink:href="#gentle-wave"
              x="48"
              y="5"
              class="fill-slate-950/30"
            />
            <use
              xlink:href="#gentle-wave"
              x="48"
              y="7"
              class="fill-slate-950"
            />
          </g>
        </svg>
      </div>
    </div>
  </div>
</template>

<style scoped>
canvas {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 100vw;
  width: 100dvw;
  height: 100vh;
  height: 100dvh;
}

.waves {
  position: relative;
  width: 100%;
  height: 15vh;
  margin-bottom: -7px; /* fix for safari gap */
  min-height: 100px;
  max-height: 150px;
}

/* Animation */

.parallax > use {
  animation: move-forever 25s cubic-bezier(0.55, 0.5, 0.45, 0.5) infinite;
}
.parallax > use:nth-child(1) {
  animation-delay: -2s;
  animation-duration: 7s;
}
.parallax > use:nth-child(2) {
  animation-delay: -3s;
  animation-duration: 10s;
}
.parallax > use:nth-child(3) {
  animation-delay: -4s;
  animation-duration: 13s;
}
.parallax > use:nth-child(4) {
  animation-delay: -5s;
  animation-duration: 20s;
}
@keyframes move-forever {
  0% {
    transform: translate3d(-90px, 0, 0);
  }
  100% {
    transform: translate3d(85px, 0, 0);
  }
}

/*Shrinking for mobile*/
@media (max-width: 768px) {
  .waves {
    height: 40px;
    min-height: 40px;
  }
}
</style>
