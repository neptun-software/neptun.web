<template>
  <div class="container">
    <div class="tabs">
      <div v-for="tabName in tabs" :key="tabName" class="tab-item">
        <input
          :id="'radio-' + tabName"
          v-model="selectedTab"
          type="radio"
          name="tabs"
          :value="tabName"
        />
        <label class="tab" :for="'radio-' + tabName">
          {{ tabName.replace(/_/g, ' ') }}
        </label>
      </div>
      <span class="glider" :style="gliderStyle" />
    </div>
    <div class="tab-content">
      <slot :name="selectedTab" />
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  tabs: {
    type: Array,
    required: true,
  },
});

const tabs = props.tabs;
const selectedTab = ref(tabs[0]);

const gliderStyle = computed(() => {
  const index = tabs.indexOf(selectedTab.value);
  return {
    transform: `translateX(${index * 100}%)`,
  };
});
</script>

<style lang="scss" scoped>
$primary-color: hsl(var(--primary-foreground));
$glider-background-color: hsl(var(--primary));
$text-color: hsl(var(--secondary-foreground));
$tab-background-color: hsl(var(--secondary));

*,
*:after,
*:before {
  box-sizing: border-box;
}

.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.tabs {
  display: flex;
  position: relative;
  padding: 0.75rem;
  border-radius: 99px;
  background-color: $tab-background-color;

  * {
    z-index: 2;
  }
}

input[type='radio'] {
  display: none;

  &:checked + label {
    color: $primary-color;
  }
}

.tab {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 54px;
  width: 200px;
  font-size: 1.25rem;
  font-weight: 500;
  border-radius: 99px;
  cursor: pointer;
  transition: color 0.15s ease-in;
  color: $text-color;
}

.glider {
  position: absolute;
  display: flex;
  height: 54px;
  width: 200px;
  background-color: $glider-background-color;
  z-index: 1;
  border-radius: 99px;
  transition: 0.25s ease-out;
}

.tab-content {
  margin-top: 20px;
  font-size: 1.5rem;
  font-weight: 400;
  color: $text-color;
}

@media (max-width: 700px) {
  .tabs {
    transform: scale(0.6);
  }
}
</style>
