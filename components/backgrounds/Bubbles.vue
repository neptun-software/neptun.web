<script lang="ts" setup></script>

<template>
  <div class="container">
    <div class="bubbles-container">
      <svg
        class="bubbles"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 701 1024"
        style="overflow: visible"
      >
        <g
          class="bubbles-large"
          stroke-width="7"
        >
          <g>
            <g transform="translate(10 940)">
              <circle
                cx="35"
                cy="35"
                r="35"
              />
            </g>
          </g>
          <g>
            <g transform="translate(373 940)">
              <circle
                cx="35"
                cy="35"
                r="35"
              />
            </g>
          </g>
          <g>
            <g transform="translate(408 940)">
              <circle
                cx="35"
                cy="35"
                r="35"
              />
            </g>
          </g>
          <g>
            <g transform="translate(621 940)">
              <circle
                cx="35"
                cy="35"
                r="35"
              />
            </g>
          </g>
          <g>
            <g transform="translate(179 940)">
              <circle
                cx="35"
                cy="35"
                r="35"
              />
            </g>
          </g>
        </g>

        <g
          class="bubbles-small"
          stroke-width="4"
        >
          <g>
            <g transform="translate(147 984)">
              <circle
                cx="15"
                cy="15"
                r="15"
              />
            </g>
          </g>
          <g>
            <g transform="translate(255 984)">
              <circle
                cx="15"
                cy="15"
                r="15"
              />
            </g>
          </g>
          <g>
            <g transform="translate(573 984)">
              <circle
                cx="15"
                cy="15"
                r="15"
              />
            </g>
          </g>
          <g>
            <g transform="translate(429 984)">
              <circle
                cx="15"
                cy="15"
                r="15"
              />
            </g>
          </g>
          <g>
            <g transform="translate(91 984)">
              <circle
                cx="15"
                cy="15"
                r="15"
              />
            </g>
          </g>
          <g>
            <g transform="translate(640 984)">
              <circle
                cx="15"
                cy="15"
                r="15"
              />
            </g>
          </g>
          <g>
            <g transform="translate(321 984)">
              <circle
                cx="15"
                cy="15"
                r="15"
              />
            </g>
          </g>
          <g>
            <g transform="translate(376 984)">
              <circle
                cx="15"
                cy="15"
                r="15"
              />
            </g>
          </g>
          <g>
            <g transform="translate(376 984)">
              <circle
                cx="15"
                cy="15"
                r="15"
              />
            </g>
          </g>
          <g>
            <g transform="translate(497 984)">
              <circle
                cx="15"
                cy="15"
                r="15"
              />
            </g>
          </g>
        </g>
      </svg>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use 'sass:math';

$stroke-width-large: 2px;
$stroke-width-small: 1px;

$total-bubbles-large: 3;
$total-bubbles-small: 7;

/* NOTE: :root cannot be used, because vue compiles css selectors with data-ids */
.container {
  --bubble-stroke-color-1: hsla(200, 100%, 80%, 0.7);
  --bubble-stroke-color-2: hsla(200, 100%, 70%, 0.7);
  --bubble-stroke-color-3: hsla(200, 100%, 60%, 0.7);

  --bubble-fill-color-1: hsla(200, 100%, 80%, 0.3);
  --bubble-fill-color-2: hsla(200, 100%, 70%, 0.3);
  --bubble-fill-color-3: hsla(200, 100%, 60%, 0.3);
}

.dark .container {
  --bubble-stroke-color-1: hsla(210, 50%, 30%, 0.7);
  --bubble-stroke-color-2: hsla(210, 50%, 20%, 0.7);
  --bubble-stroke-color-3: hsla(210, 50%, 10%, 0.7);

  --bubble-fill-color-1: hsla(210, 50%, 30%, 0.3);
  --bubble-fill-color-2: hsla(210, 50%, 20%, 0.3);
  --bubble-fill-color-3: hsla(210, 50%, 10%, 0.3);
}

@keyframes wobble {
  33% {
    transform: translateX(-10px);
  }
  66% {
    transform: translateX(10px);
  }
}

@keyframes up {
  0% {
    opacity: 0;
  }
  10%,
  90% {
    opacity: 1;
  }
  100% {
    opacity: 0;
    transform: translateY(-100vh);
  }
}

// generate a random value for position
@function random-position($limit) {
  @return math.div($limit, 10) * (1 + 0.5 * (1 - 2 * math.random())); // a rough approximation for "random" positioning
}

.container {
  position: absolute;
  top: 0;
  left: 0;
  min-width: 100vw;
  height: 100vh;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  background-blend-mode: multiply;
  background-size: cover;
  overflow: visible;
  z-index: -1;
}

.bubbles-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0.75;
  overflow: visible;
}

.bubbles {
  width: 100%;
  height: auto;
}

.bubbles circle {
  fill: var(--bubble-fill-color-3);
  stroke: var(--bubble-stroke-color-3);
}

.bubbles > g > g:nth-of-type(3n) circle {
  stroke: var(--bubble-stroke-color-2);
  fill: var(--bubble-fill-color-2);
}

.bubbles > g > g:nth-of-type(4n) circle {
  stroke: var(--bubble-stroke-color-1);
  fill: var(--bubble-fill-color-1);
}

.bubbles-large {
  overflow: visible;

  > g {
    position: absolute;
    transform: translateY(100vh);
    opacity: 0;
    will-change: transform, opacity;
  }

  @for $i from 1 through $total-bubbles-large {
    > g:nth-of-type(#{$i}) {
      animation: up 6s #{$i * 0.5}s infinite;
      left: random-position(100vw);
      top: random-position(100vh);

      circle {
        stroke-width: $stroke-width-large;
        animation: wobble 3s infinite ease-in-out;
      }
    }
  }
}

.bubbles-small {
  overflow: visible;

  > g {
    position: absolute;
    transform: translateY(100vh);
    opacity: 0;
    will-change: transform, opacity;
  }

  @for $i from 1 through $total-bubbles-small {
    > g:nth-of-type(#{$i}) {
      animation: up 5s #{$i * 0.5}s infinite;
      left: random-position(100vw);
      top: random-position(100vh);

      circle {
        stroke-width: $stroke-width-small;
        animation: wobble 3s infinite ease-in-out;
      }
    }
  }
}
</style>
