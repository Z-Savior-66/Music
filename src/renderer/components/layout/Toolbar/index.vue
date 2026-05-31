<template>
  <div :class="[$style.toolbar, { [$style.fullscreen]: isFullscreen }, appSetting['common.controlBtnPosition'] == 'left' ? $style.controlBtnLeft : $style.controlBtnRight]">
    <SearchInput />
    <div v-if="appSetting['common.controlBtnPosition'] == 'left'" :class="$style.logo">L X</div>
    <ControlBtns v-else />
  </div>
</template>

<script setup>
import { isFullscreen } from '@renderer/store'
import { appSetting } from '@renderer/store/setting'
import ControlBtns from './ControlBtns.vue'
import SearchInput from './SearchInput.vue'

</script>


<style lang="less" module>
@import '@renderer/assets/styles/layout.less';

.toolbar {
  display: flex;
  height: @height-toolbar;
  align-items: center;
  justify-content: space-between;
  padding: 0 @spacing-sm 0 @spacing-md;
  -webkit-app-region: drag;
  z-index: 2;
  box-sizing: border-box;
  border-bottom: 1px solid var(--color-primary-alpha-900);
  background-color: var(--color-main-background);

  &.fullscreen {
    -webkit-app-region: no-drag;
    .logo {
      display: none;
    }
  }

  &.controlBtnLeft {
    .control {
      display: none;
    }
  }
  &.controlBtnRight {
    justify-content: space-between;
  }
}

.logo {
  box-sizing: border-box;
  padding: 0 @spacing-md;
  height: @height-toolbar - 16px;
  margin-right: @spacing-xs;
  color: var(--color-primary);
  flex: none;
  text-align: center;
  font-weight: bold;
  border-radius: @radius-panel;
  background-color: var(--color-primary-light-900-alpha-200);
  box-shadow: inset 0 0 0 1px var(--color-primary-alpha-900);
  display: flex;
  align-items: center;
  justify-content: center;
  // -webkit-app-region: no-drag;
}

</style>
