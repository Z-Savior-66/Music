<template>
  <ul :class="[$style.list, $style[align]]" role="tablist">
    <li
      v-for="item in list"
      :key="item[itemKey]" :class="[$style.listItem, {[$style.active]: modelValue == item[itemKey]}]" tabindex="-1" role="tab"
      :aria-label="item[itemLabel]" ignore-tip :aria-selected="modelValue == item[itemKey]" @click="handleToggle(item[itemKey])"
    >
      <span :class="$style.label">{{ item[itemLabel] }}</span>
    </li>
  </ul>
</template>

<script>

export default {
  props: {
    list: {
      type: Array,
      default() {
        return []
      },
    },
    align: {
      type: String,
      default: 'left',
    },
    itemKey: {
      type: String,
      default: 'id',
    },
    itemLabel: {
      type: String,
      default: 'label',
    },
    modelValue: {
      type: [String, Number],
      default: '',
    },
  },
  emits: ['update:modelValue', 'change'],
  setup(props, { emit }) {
    const handleToggle = id => {
      if (id == props.modelValue) return
      emit('update:modelValue', id)
      emit('change', id)
    }

    return {
      handleToggle,
    }
  },
}
</script>

<style lang="less" module>
@import '@renderer/assets/styles/layout.less';

.list {
  display: flex;
  flex-flow: row nowrap;
  font-size: 12px;
  gap: @spacing-xs;
  padding: 0;
  align-items: center;

  &.left {
    justify-content: flex-start;
  }
  &.center {
    justify-content: center;
  }
  &.right {
    justify-content: flex-end;
  }
}
.listItem {
  display: block;
  padding: 0 @spacing-sm;
  cursor: pointer;
  transition: @transition-ui;
  transition-property: background-color, color, opacity, box-shadow;
  border-radius: @radius-control;
  color: var(--color-font-label);
  min-height: 28px;
  line-height: 28px;


  &:hover {
    color: var(--color-primary);
    background-color: var(--color-primary-light-900-alpha-200);
  }


  &.active {
    color: var(--color-primary);
    background-color: var(--color-primary-light-900-alpha-300);
    box-shadow: inset 0 0 0 1px var(--color-primary-alpha-900);
    cursor: default;

    >.label {
      &:after {
        // background-color: var(--color-primary);
        opacity: 1;
        transform: translateY(0);
      }
    }
  }
}

.label {
  display: block;
  position: relative;
  padding: 0;
  &:after {
    .mixin-after();
    left: 0;
    bottom: 3px;
    width: 100%;
    height: 2px;
    border-radius: 20px;
    background-color: transparent;
    transform: translateY(-4px);
    opacity: 0;
    background-color: var(--color-primary-alpha-300);
    transition: @transition-fast;
    transition-property: transform, opacity;
  }
}
</style>
