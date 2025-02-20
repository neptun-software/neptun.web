<script lang="js" setup>
import { gsap } from 'gsap'

const width = 26
const amount = 20
const sineDots = Math.floor(amount * 0.3)
const idleTimeout = 150

const scrollElement = ref(null)
const isScrolling = ref(false)
const { x: scrollX, y: scrollY } = useWindowScroll() // needed, so that the bubbles are set to the right position, when the user scrolls
const { x: mouseX, y: mouseY } = useMouse()
const cursor = ref(null)
let lastFrame = 0
let dots = []
let timeoutID
let idle = false

class Dot {
  constructor(index = 0) {
    this.index = index
    this.angleSpeed = 0.05
    this.x = mouseX.value - width / 2 - (scrollX.value || 0) // Initialize at current mouse position
    this.y = mouseY.value - width / 2 - (scrollY.value || 0)
    this.scale = 1 - 0.05 * index
    this.range = width / 2 - (width / 2) * this.scale + 2
    this.limit = width * 0.75 * this.scale
    this.element = document.createElement('span')
    this.idleProgress = 0

    // Add initial fade-in animation
    gsap.set(this.element, {
      scale: this.scale,
      opacity: 0,
      x: this.x,
      y: this.y,
    })
    gsap.to(this.element, {
      opacity: 1,
      duration: 0.3,
      delay: index * 0.02, // Stagger the fade-in of dots
      ease: 'power2.out',
    })
    cursor.value.appendChild(this.element)
  }

  lock() {
    this.lockX = this.x
    this.lockY = this.y
    this.angleX = Math.PI * 2 * Math.random()
    this.angleY = Math.PI * 2 * Math.random()
  }

  draw() {
    if (this.index <= sineDots) {
      // First few dots always follow cursor directly
      gsap.set(this.element, { x: this.x, y: this.y })
      return
    }

    // Calculate idle position
    const idleX = this.lockX + Math.sin(this.angleX) * this.range
    const idleY = this.lockY + Math.sin(this.angleY) * this.range

    // Transition between direct and idle positions
    const finalX = gsap.utils.interpolate(this.x, idleX, this.idleProgress)
    const finalY = gsap.utils.interpolate(this.y, idleY, this.idleProgress)

    gsap.set(this.element, { x: finalX, y: finalY })

    // Update angles for next frame
    this.angleX += this.angleSpeed
    this.angleY += this.angleSpeed
  }
}

function startIdleTimer() {
  timeoutID = setTimeout(goInactive, idleTimeout)
  idle = false
  // Animate back to non-idle state
  dots.forEach((dot) => {
    gsap.to(dot, {
      idleProgress: 0,
      duration: 0.4,
      ease: 'power2.out',
    })
  })
}

function resetIdleTimer() {
  clearTimeout(timeoutID)
  startIdleTimer()
}

function goInactive() {
  idle = true
  dots.forEach((dot) => {
    dot.lock()
    // Animate the transition to idle state
    gsap.to(dot, {
      idleProgress: 1,
      duration: 0.8,
      ease: 'power2.inOut',
    })
  })
}

function buildDots() {
  dots = []
  for (let i = 0; i < amount; i++) {
    dots.push(new Dot(i))
  }
}

function positionCursor(delta) {
  let x = mouseX.value - width / 2
  let y = mouseY.value - width / 2

  const currentScrollX = scrollX.value || 0
  const currentScrollY = scrollY.value || 0
  x -= currentScrollX
  y -= currentScrollY

  dots.forEach((dot, index) => {
    const nextDot = dots[index + 1] || dots[0]
    dot.x = x
    dot.y = y
    dot.draw(delta)

    if (!idle || index <= sineDots) {
      const dx = (nextDot.x - dot.x) * 0.35
      const dy = (nextDot.y - dot.y) * 0.35
      x += dx
      y += dy
    }
  })
}

function render(timestamp) {
  const delta = timestamp - lastFrame
  positionCursor(delta)
  lastFrame = timestamp
  requestAnimationFrame(render)
}

onMounted(() => {
  // Add a small delay to ensure mouse position is captured
  setTimeout(() => {
    buildDots()
    lastFrame = performance.now()
    requestAnimationFrame(render)
  }, 50)

  document.getElementById('home').style.cursor = 'none'

  scrollElement.value = window
  if (scrollElement.value) {
    const { isScrolling: scrollStatus } = useScroll(scrollElement.value, {
      throttle: 16,
    })

    watch(scrollStatus, (scrolling) => {
      isScrolling.value = scrolling
      if (!scrolling) {
        resetIdleTimer()
      }
    })
  }

  const resizeObserver = new ResizeObserver(() => {
    resetIdleTimer()
  })
  resizeObserver.observe(document.documentElement)

  onUnmounted(() => {
    clearTimeout(timeoutID)
    resizeObserver.disconnect()
  })
})

// Add cleanup for page transitions
onBeforeUnmount(() => {
  // Fade out dots before removal
  dots.forEach((dot, index) => {
    gsap.to(dot.element, {
      opacity: 0,
      duration: 0.2,
      delay: index * 0.01,
      ease: 'power2.in',
    })
  })
})

watch([mouseX, mouseY, scrollX, scrollY], resetIdleTimer)
</script>

<template>
  <div>
    <svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="800">
      <defs>
        <filter id="cursor-mask">
          <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur" />
          <feColorMatrix
            in="blur"
            mode="matrix"
            values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 35 -15"
            result="cursor-mask"
          />
          <feComposite in="SourceGraphic" in2="cursor-mask" operator="atop" />
        </filter>
      </defs>
    </svg>

    <div ref="cursor" class="cursor" />
    <DevOnly>
      <div class="fixed top-0 left-0 z-50">
        {{ mouseX }}, {{ mouseY }} VS {{ scrollX }}, {{ scrollY }} ({{
          isScrolling
        }})
      </div>
    </DevOnly>
  </div>
</template>

<style scoped>
svg {
  display: none;
}
</style>
