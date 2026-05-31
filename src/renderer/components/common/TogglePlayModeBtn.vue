<template>
  <material-popup-btn ref="btn_ref" :class="$style.btnContent">
    <button :class="$style.btn" :aria-label="nextTogglePlayName">
      <svg-icon v-if="appSetting['player.togglePlayMethod'] == 'listLoop'" size="80%" name="list-loop" />
      <svg-icon v-else-if="appSetting['player.togglePlayMethod'] == 'random'" size="100%" name="list-random" />
      <svg-icon v-else-if="appSetting['player.togglePlayMethod'] == 'list'" size="100%" name="list-order" />
      <svg-icon v-else-if="appSetting['player.togglePlayMethod'] == 'singleLoop'" size="100%" name="single-loop" />
      <svg-icon v-else size="100%" name="single" />
    </button>
    <template #content>
      <div :class="$style.setting">
        <button :class="$style.btn" :aria-label="$t('player__play_toggle_mode_list_loop')" @click="toggleMode('listLoop')">
          <svg-icon size="100%" name="list-loop" />
        </button>
        <button :class="$style.btn" :aria-label="$t('player__play_toggle_mode_random')" @click="toggleMode('random')">
          <svg-icon size="100%" name="list-random" />
        </button>
        <button :class="$style.btn" :aria-label="$t('player__play_toggle_mode_list')" @click="toggleMode('list')">
          <svg-icon size="100%" name="list-order" />
        </button>
        <button :class="$style.btn" :aria-label="$t('player__play_toggle_mode_single_loop')" @click="toggleMode('singleLoop')">
          <svg-icon size="100%" name="single-loop" />
        </button>
        <button :class="$style.btn" :aria-label="$t('player__play_toggle_mode_off')" @click="toggleMode('none')">
          <svg-icon size="100%" name="single" />
        </button>
      </div>
    </template>
  </material-popup-btn>
</template>

<script setup>
import { ref } from '@common/utils/vueTools'
// import useNextTogglePlay from '@renderer/utils/compositions/useNextTogglePlay'
// import useToggleDesktopLyric from '@renderer/utils/compositions/useToggleDesktopLyric'
// import { musicInfo, playMusicInfo } from '@renderer/store/player/state'
import { appSetting } from '@renderer/store/setting'
import useNextTogglePlay from '@renderer/utils/compositions/useNextTogglePlay'

const btn_ref = ref(null)

const {
  nextTogglePlayName,
  toggleNextPlayMode,
} = useNextTogglePlay()

const toggleMode = (mode) => {
  btn_ref.value.hide()
  toggleNextPlayMode(mode)
}

</script>

<style lang="less" module>
@import '@renderer/assets/styles/layout.less';
.btnContent {
  flex: none;
  height: 100%;
}

.btn {
  position: relative;
  // color: var(--color-button-font);
  justify-content: center;
  align-items: center;
  transition: color @transition-normal;
  cursor: pointer;
  background-color: transparent;
  border: none;
  width: 30px;
  height: 30px;
  display: flex;
  flex-flow: column nowrap;
  padding: 0;

  :global(.svg-icon) {
    width: 20px;
    height: 20px;
    transition: opacity @transition-fast;
    opacity: .6;
    filter: drop-shadow(0 0 1px rgba(0, 0, 0, 0.2));
  }
  &:hover {
    :global(.svg-icon) {
      opacity: .9;
    }
  }
  &:active {
    :global(.svg-icon) {
      opacity: 1;
    }
  }
}

.setting {
  display: flex;
  flex-flow: row nowrap;
  font-size: 14px;
  gap: 10px;
}


</style>
