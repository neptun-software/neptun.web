<script lang="js" setup>
import { gsap } from 'gsap';

const width = 26;
const amount = 20;
const sineDots = Math.floor(amount * 0.3);
const idleTimeout = 150;

const { x: mouseX, y: mouseY } = useMouse();
const cursor = ref(null);
let lastFrame = 0;
let dots = [];
let timeoutID;
let idle = false;

class Dot {
  constructor(index = 0) {
    this.index = index;
    this.angleSpeed = 0.05;
    this.x = 0;
    this.y = 0;
    this.scale = 1 - 0.05 * index;
    this.range = width / 2 - (width / 2) * this.scale + 2;
    this.limit = width * 0.75 * this.scale;
    this.element = document.createElement('span');

    gsap.set(this.element, { scale: this.scale });
    cursor.value.appendChild(this.element);
  }

  lock() {
    this.lockX = this.x;
    this.lockY = this.y;
    this.angleX = Math.PI * 2 * Math.random();
    this.angleY = Math.PI * 2 * Math.random();
  }

  draw() {
    if (!idle || this.index <= sineDots) {
      gsap.set(this.element, { x: this.x, y: this.y });
    } else {
      this.angleX += this.angleSpeed;
      this.angleY += this.angleSpeed;
      this.y = this.lockY + Math.sin(this.angleY) * this.range;
      this.x = this.lockX + Math.sin(this.angleX) * this.range;
      gsap.set(this.element, { x: this.x, y: this.y });
    }
  }
}

function startIdleTimer() {
  timeoutID = setTimeout(goInactive, idleTimeout);
  idle = false;
}

function resetIdleTimer() {
  clearTimeout(timeoutID);
  startIdleTimer();
}

function goInactive() {
  idle = true;
  dots.forEach((dot) => dot.lock());
}

function buildDots() {
  dots = [];
  for (let i = 0; i < amount; i++) {
    dots.push(new Dot(i));
  }
}

function positionCursor(delta) {
  let x = mouseX.value - width / 2;
  let y = mouseY.value - width / 2;
  dots.forEach((dot, index) => {
    let nextDot = dots[index + 1] || dots[0];
    dot.x = x;
    dot.y = y;
    dot.draw(delta);
    if (!idle || index <= sineDots) {
      const dx = (nextDot.x - dot.x) * 0.35;
      const dy = (nextDot.y - dot.y) * 0.35;
      x += dx;
      y += dy;
    }
  });
}

function render(timestamp) {
  const delta = timestamp - lastFrame;
  positionCursor(delta);
  lastFrame = timestamp;
  requestAnimationFrame(render);
}

onMounted(() => {
  buildDots();
  lastFrame = performance.now();
  requestAnimationFrame(render);

  document.getElementById('home').style.cursor = 'none';
});

onUnmounted(() => {
  clearTimeout(timeoutID);
});

watch([mouseX, mouseY], resetIdleTimer);
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

    <div ref="cursor" class="cursor"></div>
  </div>
</template>

<style scoped>
svg {
  display: none;
}
</style>
