<template>
  <div :class="$style.btns">
    <button v-if="playBtn" type="button" :aria-label="$t('list__play')" @contextmenu.capture.stop @click.stop="handleClick('play')">
      <svg-icon size="100%" name="testPlay" />
    </button>
    <button v-if="listAddBtn" type="button" :aria-label="$t('list__add_to')" @contextmenu.capture.stop @click.stop="handleClick('listAdd')">
      <svg-icon size="100%" name="addTo" />
    </button>
    <button v-if="downloadBtn && appSetting['download.enable']" type="button" :aria-label="$t('list__download')" @contextmenu.capture.stop @click.stop="handleClick('download')">
      <svg-icon size="100%" name="download" />
    </button>
    <button v-if="startBtn" type="button" :aria-label="$t('list__start')" @contextmenu.capture.stop @click.stop="handleClick('start')">
      <svg-icon size="100%" name="play" />
    </button>
    <button v-if="pauseBtn" type="button" :aria-label="$t('list__pause')" @contextmenu.capture.stop @click.stop="handleClick('pause')">
      <svg-icon size="100%" name="pause" />
    </button>
    <button v-if="fileBtn" type="button" :aria-label="$t('list__file')" @contextmenu.capture.stop @click.stop="handleClick('file')">
      <svg-icon size="100%" name="musicFile" />
    </button>
    <button v-if="searchBtn" type="button" :aria-label="$t('list__search')" @contextmenu.capture.stop @click.stop="handleClick('search')">
      <svg-icon size="100%" name="search" />
    </button>
    <button v-if="removeBtn" type="button" :aria-label="$t('list__remove')" @click.stop="handleClick('remove')">
      <svg-icon size="100%" name="delete" />
    </button>
  </div>
</template>

<script>
import { appSetting } from '@renderer/store/setting'

export default {
  props: {
    index: {
      type: Number,
      required: true,
    },
    startBtn: {
      type: Boolean,
      default: false,
    },
    pauseBtn: {
      type: Boolean,
      default: false,
    },
    removeBtn: {
      type: Boolean,
      default: false,
    },
    downloadBtn: {
      type: Boolean,
      default: true,
    },
    playBtn: {
      type: Boolean,
      default: true,
    },
    listAddBtn: {
      type: Boolean,
      default: true,
    },
    searchBtn: {
      type: Boolean,
      default: false,
    },
    fileBtn: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['btn-click'],
  setup() {
    return {
      appSetting,
    }
  },
  methods: {
    handleClick(action) {
      this.$emit('btn-click', { action, index: this.index })
    },
  },
}
</script>


<style lang="less" module>
@import '@renderer/assets/styles/layout.less';

.btns {
  display: inline-flex;
  flex-flow: row nowrap;
  align-items: center;
  gap: @spacing-xs;
  line-height: 1.2;

  button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    background-color: transparent;
    border: none;
    border-radius: @radius-control;
    cursor: pointer;
    padding: @spacing-xs;
    color: var(--color-button-font);
    outline: none;
    transition: background-color @transition-ui, color @transition-ui, box-shadow @transition-ui;
    line-height: 0;

    svg {
      height: 16px;
    }

    &:hover {
      background-color: var(--color-surface-hover);
      color: var(--color-text-primary);
    }
    &:active {
      background-color: var(--color-surface-active);
    }
    &:focus-visible {
      box-shadow: inset 0 0 0 2px var(--color-focus-ring);
    }
  }
}

</style>
