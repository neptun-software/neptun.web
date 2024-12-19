<script lang="ts" setup>
const props = defineProps({
  typeData: {
    type: Array as () => string[],
    required: true,
  },
  period: {
    type: Number,
    default: 2000,
  },
})

class TxtType {
  el: HTMLElement
  toRotate: string[]
  period: number
  txt: string
  loopNum: number
  isDeleting: boolean
  timeoutId: number | null

  constructor(el: HTMLElement, toRotate: string[], period: number) {
    this.el = el
    this.toRotate = toRotate
    this.period = period || 2000
    this.txt = ''
    this.loopNum = 0
    this.isDeleting = false
    this.timeoutId = null
    this.tick()
  }

  tick() {
    const i = this.loopNum % this.toRotate.length
    const fullTxt = this.toRotate[i]

    if (this.isDeleting) {
      this.txt = fullTxt.substring(0, this.txt.length - 1)
    }
    else {
      this.txt = fullTxt.substring(0, this.txt.length + 1)
    }

    this.el.innerHTML = `<span class="wrap">${this.txt.replace(
      /\n/g,
      '<br>',
    )}</span>`

    let delta = 200 - Math.random() * 100
    if (this.isDeleting) {
      delta /= 2
    }

    if (!this.isDeleting && this.txt === fullTxt) {
      delta = this.period
      this.isDeleting = true
    }
    else if (this.isDeleting && this.txt === '') {
      this.isDeleting = false
      this.loopNum++
      delta = 500
    }

    this.timeoutId = window.setTimeout(() => this.tick(), delta)
  }

  stop() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId)
    }
  }
}

onMounted(() => {
  const elements = document.getElementsByClassName('typewrite')
  for (let i = 0; i < elements.length; i++) {
    if (props.typeData) {
      new TxtType(elements[i] as HTMLElement, props.typeData, props.period)
    }
  }
})
</script>

<template>
  <div class="flex flex-col items-center max-w-full my-6">
    <div>
      <p
        class="max-w-full px-4 py-2 mb-1 rounded-md min-w-72 lg:max-w-96 bg-secondary min-h-24"
      >
        <a href="" class="typewrite">
          <span class="wrap" />
        </a>
      </p>
      <div class="flex gap-2">
        <slot />
      </div>
    </div>
  </div>
</template>

<style scoped>
body {
  text-align: center;
  padding-top: 10em;
}

:deep(.typewrite > .wrap) {
  border-right: 0.08em solid #fff;
}
</style>
