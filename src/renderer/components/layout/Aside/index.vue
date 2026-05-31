<template>
  <div :class="[$style.aside, { [$style.fullscreen]: isFullscreen }]">
    <ControlBtns v-if="appSetting['common.controlBtnPosition'] == 'left'" />
    <div v-else :class="$style.logo">S</div>
    <NavBar />
  </div>
</template>

<script setup>
import { isFullscreen } from '@renderer/store'
import { appSetting } from '@renderer/store/setting'

import ControlBtns from './ControlBtns.vue'
import NavBar from './NavBar.vue'

</script>


<style lang="less" module>
@import '@renderer/assets/styles/layout.less';

.aside {
  transition: @transition-normal;
  transition-property: background-color;
  -webkit-app-region: drag;
  -webkit-user-select: none;
  display: flex;
  flex-flow: column nowrap;
  height: 100%;
  padding: @spacing-sm 0;
  box-sizing: border-box;
  background-color: var(--color-app-background);

  &.fullscreen {
    -webkit-app-region: no-drag;
    .logo {
      display: none;
    }
  }
}

.logo {
  box-sizing: border-box;
  width: 38px;
  height: 50px;
  margin: 0 auto @spacing-sm;
  color: var(--color-primary);
  flex: none;
  text-align: center;
  font-weight: bold;
  letter-spacing: 0;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  // -webkit-app-region: no-drag;
}

</style>
