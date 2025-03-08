<script setup lang="ts">
// Thanks to https://codepen.io/Mamboleoo/pen/obWGYr ♥

const props = defineProps({
  text: String,
})

const colorMode = useColorMode()
const colors = computed(() => {
  return colorMode.preference === 'dark'
    ? ['#00FFFF', '#1E90FF', '#00BFFF', '#00CED1', '#00B2FF']
    : ['#0e7490', '#083344', '#042f2e', '#082f49', '#60a5fa']
})

const { x, y } = useMouse()
const { pressed } = useMousePressed() // touch and click
const { width, height } = useWindowSize()
const mouse = ref<Mouse>({ x: 0, y: 0 })
const radius = ref<number>(1)
const $canvasElement = ref<HTMLCanvasElement | null>(null)
const particles: Particle[] = []
const isLoaded = ref(false)

watch(colors, () => {
  initScene()
})

watch(x, (newX) => {
  mouse.value.x = newX
})

watch(y, (newY) => {
  mouse.value.y = newY
})

watch(pressed, () => {
  radius.value = radius.value === 5 ? 1 : radius.value + 1
})

watch(width, () => {
  initScene()
})

watch(height, () => {
  initScene()
})

interface Mouse {
  x: number
  y: number
}

class Particle {
  x: number
  y: number
  dest: { x: number, y: number }
  r: number
  vx: number
  vy: number
  accX: number
  accY: number
  friction: number
  color: string

  constructor(x: number, y: number, colors: string[]) {
    this.x = Math.random() * window.innerWidth
    this.y = Math.random() * window.innerHeight
    this.dest = { x, y }
    this.r = Math.random() * 5 + 2
    this.vx = (Math.random() - 0.5) * 20
    this.vy = (Math.random() - 0.5) * 20
    this.accX = 0
    this.accY = 0
    this.friction = Math.random() * 0.05 + 0.94
    this.color = colors[Math.floor(Math.random() * colors.length)]
  }

  render(ctx: CanvasRenderingContext2D, mouse: Mouse, radius: number) {
    this.accX = (this.dest.x - this.x) / 300
    this.accY = (this.dest.y - this.y) / 300
    this.vx += this.accX
    this.vy += this.accY
    this.vx *= this.friction
    this.vy *= this.friction
    this.x += this.vx
    this.y += this.vy

    ctx.fillStyle = this.color
    ctx.beginPath()
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2)
    ctx.fill()

    const a = this.x - mouse.x
    const b = this.y - mouse.y
    const distance = Math.sqrt(a * a + b * b)

    // multiplier for the interaction radius
    const multiplier = 15
    if (distance < radius * multiplier) {
      // force calculation
      const force = (radius * multiplier - distance) / (radius * multiplier)

      // divisor for impact strength
      this.accX = ((this.x - mouse.x) * force) / 10
      this.accY = ((this.y - mouse.y) * force) / 10

      this.vx += this.accX
      this.vy += this.accY
    }
  }
}

function initScene() {
  if (!$canvasElement.value) {
    return
  }

  const ctx = $canvasElement.value.getContext('2d', { willReadFrequently: true })
  if (!ctx) {
    return
  }

  const ww = ($canvasElement.value.width = window.innerWidth)
  const wh = ($canvasElement.value.height = window.innerHeight)

  ctx.clearRect(0, 0, $canvasElement.value.width, $canvasElement.value.height)
  ctx.font = `bold ${ww / 4}px sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle' // align text vertically in the middle
  ctx.fillText(props.text || 'Neptun', ww / 2, wh / 2)

  const data = ctx.getImageData(0, 0, ww, wh).data
  ctx.clearRect(0, 0, $canvasElement.value.width, $canvasElement.value.height)
  ctx.globalCompositeOperation = 'screen'

  particles.length = 0
  for (let i = 0; i < ww; i += Math.round(ww / 150)) {
    for (let j = 0; j < wh; j += Math.round(ww / 150)) {
      if (data[(i + j * ww) * 4 + 3] > 150) {
        particles.push(new Particle(i, j, colors.value))
      }
    }
  }
}

function render() {
  if (!$canvasElement.value) {
    return
  }

  const ctx = $canvasElement.value.getContext('2d')
  if (!ctx) {
    return
  }

  requestAnimationFrame(render)
  ctx.clearRect(0, 0, $canvasElement.value.width, $canvasElement.value.height)
  particles.forEach(particle =>
    particle.render(ctx, mouse.value, radius.value),
  )

  isLoaded.value = true
}

const isDesktop = useMediaQuery('(min-width: 1024px)')

onMounted(() => {
  if (isDesktop.value) {
    initScene()
    requestAnimationFrame(render)
  }
})
</script>

<template>
  <div class="overflow-hidden h-full bg-slate-950">
    <canvas id="scene" ref="$canvasElement" class="z-10" />
    <div class="absolute left-0 w-full bg-cyan-600">
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
    <div
      class="flex absolute top-0 left-0 justify-center items-center w-full h-full text-slate-200"
    >
      <slot v-if="!isLoaded" />
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
