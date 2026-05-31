<template>
  <component
    :is="iconComponent"
    class="svg-icon"
    aria-hidden="true"
    :size="size"
    :stroke-width="strokeWidth"
  />
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { getIconComponent } from './iconMap'

const props = withDefaults(defineProps<{
  name: string
  size?: number | string
  strokeWidth?: number | string
}>(), {
  size: '1.2em',
  strokeWidth: 2,
})

const iconName = computed(() => props.name.replace(/^#icon-/, ''))
const iconComponent = computed(() => getIconComponent(iconName.value))
</script>

<style>
.svg-icon {
  display: block;
  flex: none;
  vertical-align: middle;
  fill: none;
  stroke: currentColor;
  overflow: hidden;
}
</style>
