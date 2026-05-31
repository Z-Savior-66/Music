<template>
  <div :class="$style.controlBtn">
    <!-- <common-volume-bar /> -->
    <button :class="$style.titleBtn" :aria-label="$t('player__add_music_to')" @click="addMusicTo">
      <svg-icon size="90%" name="add-2" />
    </button>
    <button :class="$style.titleBtn" :aria-label="toggleDesktopLyricBtnTitle" @click="toggleDesktopLyric" @contextmenu="toggleLockDesktopLyric">
      <svg-icon v-show="appSetting['desktopLyric.enable']" size="100%" name="desktop-lyric-on" />
      <svg-icon v-show="!appSetting['desktopLyric.enable']" size="100%" name="desktop-lyric-off" />
    </button>
    <common-volume-btn />
    <common-toggle-play-mode-btn />
    <common-list-add-modal v-model:show="isShowAddMusicTo" :music-info="playMusicInfo.musicInfo" />
  </div>
</template>

<script>
import { ref } from '@common/utils/vueTools'
import useToggleDesktopLyric from '@renderer/utils/compositions/useToggleDesktopLyric'
import { musicInfo, playMusicInfo } from '@renderer/store/player/state'
import { appSetting } from '@renderer/store/setting'

export default {
  setup() {
    const isShowAddMusicTo = ref(false)
    const {
      toggleDesktopLyricBtnTitle,
      toggleDesktopLyric,
      toggleLockDesktopLyric,
    } = useToggleDesktopLyric()
    const addMusicTo = () => {
      if (!musicInfo.id) return
      isShowAddMusicTo.value = true
    }
    return {
      appSetting,
      isShowAddMusicTo,
      toggleDesktopLyricBtnTitle,
      toggleDesktopLyric,
      toggleLockDesktopLyric,
      addMusicTo,
      playMusicInfo,
    }
  },
}
</script>

<style lang="less" module>
@import '@renderer/assets/styles/layout.less';

.controlBtn {
  padding-left: @spacing-md;
  padding-right: @spacing-sm;
  flex: none;
  display: flex;
  flex-flow: row nowrap;
  gap: @spacing-xs;
  align-items: center;

  button {
    color: var(--color-button-font);
  }
}

.titleBtn {
  flex: none;
  height: 30px;
  width: 30px;
  transition: @transition-fast;
  transition-property: background-color, color, opacity;
  // color: var(--color-button-font);
  display: flex;
  flex-flow: column nowrap;
  justify-content: center;
  align-items: center;
  background-color: transparent;
  border: none;
  padding: 0;
  border-radius: 50%;

  opacity: .6;
  cursor: pointer;

  :global(.svg-icon) {
    width: 20px;
    height: 20px;
    filter: drop-shadow(0 0 1px rgba(0, 0, 0, 0.2));
  }
  &:hover {
    opacity: 1;
    background-color: var(--color-primary-light-900-alpha-200);
  }
  &:active {
    opacity: 1;
    background-color: var(--color-primary-light-900-alpha-300);
  }
}


</style>
