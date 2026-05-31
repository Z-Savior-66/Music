<template>
  <div id="container" class="view-container">
    <layout-aside id="left" />
    <div id="right">
      <layout-toolbar id="toolbar" />
      <layout-view id="view" />
      <layout-play-bar id="player" />
    </div>
    <layout-icons />
    <layout-change-log-modal />
    <layout-update-modal />
    <layout-sync-mode-modal />
    <layout-sync-auth-code-modal />
    <layout-play-detail />
  </div>
</template>

<script setup>
import { onMounted } from '@common/utils/vueTools'
import useApp from '@renderer/core/useApp'

useApp()

onMounted(() => {
  document.getElementById('root').style.display = 'block'
})

</script>


<style lang="less">
@import './assets/styles/index.less';
@import './assets/styles/layout.less';

html {
  height: 100vh;
  width: 100vw;
  overflow: hidden;
}
html, body {
  box-sizing: border-box;
}

body {
  user-select: none;
  height: 100%;
  width: 100%;
  overflow: hidden;
}
#root {
  height: 100%;
  width: 100%;
  position: relative;
  overflow: hidden;
  color: var(--color-font);
  background: var(--background-image) var(--background-image-position) no-repeat;
  background-size: var(--background-image-size);
  transition: background-color @transition-normal, color @transition-normal;
  background-color: var(--color-content-background);
  box-sizing: border-box;
}

.disableAnimation * {
  transition: none !important;
  animation: none !important;
}

.transparent {
  background: transparent;
  padding: @shadow-app;
  #body {
    border-radius: @radius-border;
  }
  #root {
    box-shadow: 0 0 @shadow-app rgba(0, 0, 0, 0.5);
    border-radius: @radius-border;
  }
}
.disableTransparent {
  background-color: var(--color-content-background);

  #body {
    border: 1Px solid var(--color-primary-light-500);
  }

  #right {
    margin: @spacing-sm @spacing-sm @spacing-sm 0;
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
    border-top: 1px solid var(--color-primary-alpha-900);
    border-right: 1px solid var(--color-primary-alpha-900);
    border-bottom: 1px solid var(--color-primary-alpha-900);
  }
}
.fullscreen {
  background-color: var(--color-content-background);

  #right {
    margin: @spacing-sm @spacing-sm @spacing-sm 0;
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
    border-top: 1px solid var(--color-primary-alpha-900);
    border-right: 1px solid var(--color-primary-alpha-900);
    border-bottom: 1px solid var(--color-primary-alpha-900);
  }
}

#container {
  position: relative;
  display: flex;
  height: 100%;
  width: 100%;
  min-width: 0;
  background-color: var(--color-app-background);
  isolation: isolate;
}

#left {
  flex: none;
  width: @width-app-left;
  position: relative;
  z-index: 2;
}
#right {
  flex: auto;
  display: flex;
  flex-flow: column nowrap;
  transition: background-color @transition-normal;
  background-color: var(--color-main-background);
  margin: @spacing-sm @spacing-sm @spacing-sm 0;
  border: 1px solid var(--color-primary-alpha-900);
  border-left-color: var(--color-primary-light-700-alpha-300);
  border-radius: @radius-panel;
  overflow: hidden;
  box-shadow: @shadow-panel;
  min-width: 0;
}
#toolbar {
  flex: none;
  min-width: 0;
  overflow: visible;
}
#player {
  flex: none;
  min-width: 0;
  overflow: hidden;
}
#view {
  position: relative;
  flex: auto;
  // display: flex;
  min-height: 0;
  min-width: 0;
  overflow: hidden;
}

.view-container {
  transition: opacity @transition-normal;
}
#root.show-modal > .view-container {
  opacity: .9;
}
#view.show-modal > .view-container {
  opacity: .2;
}

</style>

