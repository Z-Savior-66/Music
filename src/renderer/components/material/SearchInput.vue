<template>
  <div :class="$style.container">
    <div :class="[$style.search, {[$style.active]: focus}, {[$style.big]: big}, {[$style.small]: small}, {[$style.disabled]: disabled}]">
      <div :class="$style.form">
        <input
          ref="dom_input"
          v-model.trim="text"
          :placeholder="placeholder"
          :disabled="disabled"
          @focus="handleFocus"
          @blur="handleBlur"
          @input="$emit('update:modelValue', text)"
          @change="sendEvent('change')"
          @keyup.enter="handleSearch"
          @keydown.arrow-down.arrow-up.prevent
          @keyup.arrow-down.prevent="handleKeyDown"
          @keyup.arrow-up.prevent="handleKeyUp"
          @contextmenu="handleContextMenu"
        >
        <transition enter-active-class="animated zoomIn" leave-active-class="animated zoomOut">
          <button v-show="text" type="button" @click="handleClearList">
            <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xlink="http://www.w3.org/1999/xlink" height="100%" viewBox="0 0 24 24" space="preserve">
              <use xlink:href="#icon-window-close" />
            </svg>
          </button>
        </transition>
        <button type="button" :disabled="disabled" @click="handleSearch">
          <slot>
            <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xlink="http://www.w3.org/1999/xlink" height="100%" viewBox="0 0 30.239 30.239" space="preserve">
              <use xlink:href="#icon-search" />
            </svg>
          </slot>
        </button>
      </div>
      <div v-if="list" :class="$style.list" :style="listStyle">
        <ul ref="dom_list" @mouseleave="selectIndex = -1">
          <li
            v-for="(item, index) in list"
            :key="item"
            :class="{[$style.select]: selectIndex === index }"
            @mouseenter="selectIndex = index"
            @click="handleTemplistClick(index)"
          >
            <span>{{ item }}</span>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
import { clipboardReadText } from '@common/utils/electron'
import { HOTKEY_COMMON } from '@common/hotKey'
import { appSetting } from '@renderer/store/setting'

export default {
  props: {
    placeholder: {
      type: String,
      default: () => window.i18n?.t('search__input_placeholder') ?? 'Search for something...',
    },
    list: {
      type: Array,
      default() {
        return []
      },
    },
    visibleList: {
      type: Boolean,
      default: false,
    },
    modelValue: {
      type: String,
      default: '',
    },
    big: {
      type: Boolean,
      default: false,
    },
    small: {
      type: Boolean,
      default: false,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['update:modelValue', 'event'],
  data() {
    return {
      isShow: false,
      text: '',
      selectIndex: -1,
      focus: false,
      listStyle: {
        height: 0,
      },
    }
  },
  watch: {
    list(n) {
      if (!this.visibleList) return
      if (this.selectIndex > -1) this.selectIndex = -1
      this.$nextTick(() => {
        this.listStyle.height = this.$refs.dom_list.scrollHeight + 'px'
      })
    },
    modelValue(n) {
      this.text = n
    },
    visibleList(n) {
      n ? this.showList() : this.hideList()
    },
  },
  mounted() {
    if (appSetting['search.isFocusSearchBox']) this.handleFocusInput()
    this.handleRegisterEvent('on')
  },
  beforeUnmount() {
    this.handleRegisterEvent('off')
  },
  methods: {
    handleRegisterEvent(action) {
      let eventHub = window.key_event
      let name = action == 'on' ? 'on' : 'off'
      // eslint-disable-next-line @typescript-eslint/unbound-method
      eventHub[name](HOTKEY_COMMON.focusSearchInput.action, this.handleFocusInput)
    },
    handleFocusInput() {
      if (this.disabled) return
      this.$refs.dom_input.focus()
    },
    handleTemplistClick(index) {
      console.log(index)
      this.sendEvent('listClick', index)
    },
    handleFocus() {
      if (this.disabled) return
      this.focus = true
      this.sendEvent('focus')
    },
    handleBlur() {
      setTimeout(() => {
        this.focus = false
        this.sendEvent('blur')
      }, 80)
    },
    handleSearch() {
      if (this.disabled) return
      this.hideList()
      if (this.selectIndex < 0) {
        this.sendEvent('submit')
        return
      }
      this.sendEvent('listClick', this.selectIndex)
    },
    showList() {
      this.isShow = true
      this.listStyle.height = this.$refs.dom_list.scrollHeight + 'px'
    },
    hideList() {
      this.isShow = false
      this.listStyle.height = 0
      this.$nextTick(() => {
        this.selectIndex = -1
      })
    },
    sendEvent(action, data) {
      this.$emit('event', {
        action,
        data,
      })
    },
    handleKeyDown() {
      if (this.disabled) return
      if (this.list.length) {
        this.selectIndex = this.selectIndex + 1 < this.list.length ? this.selectIndex + 1 : 0
      } else if (this.selectIndex > -1) {
        this.selectIndex = -1
      }
    },
    handleKeyUp() {
      if (this.disabled) return
      if (this.list.length) {
        this.selectIndex = this.selectIndex - 1 < -1 ? this.list.length - 1 : this.selectIndex - 1
      } else if (this.selectIndex > -1) {
        this.selectIndex = -1
      }
    },
    handleContextMenu() {
      if (this.disabled) return
      let str = clipboardReadText()
      str = str.trim()
      str = str.replace(/\t|\r\n|\n|\r/g, ' ')
      str = str.replace(/\s+/g, ' ')
      let dom_input = this.$refs.dom_input
      this.text = this.text.substring(0, dom_input.selectionStart) + str + this.text.substring(dom_input.selectionEnd, this.text.length)
      this.$emit('update:modelValue', this.text)
    },
    handleClearList() {
      if (this.disabled) return
      this.text = ''
      this.$emit('update:modelValue', this.text)
      this.sendEvent('submit')
    },
  },
}
</script>


<style lang="less" module>
@import '@renderer/assets/styles/layout.less';

.container {
  position: relative;
  width: 35%;
  height: @height-toolbar * 0.52;
  -webkit-app-region: no-drag;
}

.search {
  position: absolute;
  width: 100%;
  border: 1px solid transparent;
  border-radius: @radius-control;
  transition: border-color @transition-ui, box-shadow @transition-ui, background-color @transition-ui, opacity @transition-ui;
  display: flex;
  flex-flow: column nowrap;
  background-color: var(--color-primary-light-300-alpha-700);

  &:hover {
    background-color: var(--color-surface-hover);
    border-color: var(--color-border-base);
  }

  &.active {
    background-color: var(--color-primary-light-600-alpha-100);
    border-color: var(--color-focus-ring);
    box-shadow: 0 0 0 2px var(--color-primary-alpha-100);
    .form {
      input {
        border-bottom-left-radius: 0;

      }
      button {
        border-bottom-right-radius: 0;
      }
    }
  }

  &.disabled {
    opacity: .58;
    pointer-events: none;
  }

  .form {
    display: flex;
    height: @height-toolbar * 0.52;
    position: relative;
    input {
      flex: auto;
      // border: 1px solid;
      border-top-left-radius: @radius-control;
      border-bottom-left-radius: @radius-control;
      background-color: transparent;
      // border-bottom: 2px solid var(--color-primary);
      // border-color: var(--color-primary);
      border: none;
      min-width: 0;

      outline: none;
      // height: @height-toolbar * .7;
      padding: 0 @spacing-sm;
      overflow: hidden;
      font-size: 13.5px;
      line-height: @height-toolbar * 0.52 + 5px;
      color: var(--color-text-primary);
      &::placeholder {
        color: var(--color-text-secondary);
        font-size: .98em;
      }
    }
    button {
      flex: none;
      border: none;
      // background-color: @color-search-form-background;
      background-color: transparent;
      outline: none;
      cursor: pointer;
      height: 100%;
      min-width: 30px;
      padding: @spacing-xs @spacing-sm;
      color: var(--color-button-font);
      transition: background-color @transition-ui, color @transition-ui;

      &:last-child {
        border-top-right-radius: @radius-control;
        border-bottom-right-radius: @radius-control;
      }

      &:hover {
        background-color: var(--color-surface-hover);
        color: var(--color-text-primary);
      }
      &:active {
        background-color: var(--color-surface-active);
      }
      &:disabled {
        cursor: default;
      }
    }
  }
  .list {
    // background-color: @color-search-form-background;
    font-size: 13px;
    transition: height @transition-ui;
    height: 0;
    overflow: hidden;
    li {
      cursor: pointer;
      padding: @spacing-sm;
      transition: background-color @transition-ui, color @transition-ui;
      line-height: 1.3;
      color: var(--color-text-primary);
      span {
        .mixin-ellipsis-2();
      }

      &.select {
        background-color: var(--color-surface-active);
        color: var(--color-primary);
      }
      &:last-child {
        border-bottom-left-radius: @radius-control;
        border-bottom-right-radius: @radius-control;
      }
    }
  }
}

.big {
  width: 100%;
  // input {
  //   line-height: 30px;
  // }
  .form {
    height: 30px;
    button {
      padding: @spacing-xs @spacing-md;
    }
  }
}


</style>
