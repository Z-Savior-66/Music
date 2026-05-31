<template>
  <div :class="$style.main">
    <div class="scroll" :class="$style.toc">
      <ul :class="$style.tocList" role="toolbar">
        <li v-for="h2 in tocList" :key="h2.id" :class="$style.tocListItem" role="presentation">
          <h2
            :class="[$style.tocH2, {[$style.active]: avtiveComponentName == h2.id }]"
            role="tab" :aria-selected="avtiveComponentName == h2.id"
            :aria-label="h2.title" ignore-tip @click="toggleTab(h2.id)"
          >
            <transition name="list-active">
              <svg-icon v-if="avtiveComponentName == h2.id" name="angle-right-solid" :class="$style.activeIcon" />
            </transition>
            {{ h2.title }}
          </h2>
          <!-- <ul v-if="h2.children.length" :class="$style.tocList">
            <li v-for="h3 in h2.children" :key="h3.id" :class="$style.tocSubListItem">
              <h3 :class="[$style.tocH3, toc.activeId == h3.id ? $style.active : null]" :aria-label="h3.title">
                <a :href="'#' + h3.id" @click.stop="toc.activeId = h3.id">{{ h3.title }}</a>
              </h3>
            </li>
          </ul> -->
        </li>
      </ul>
    </div>
    <div ref="dom_content_ref" class="scroll" :class="$style.setting">
      <dl>
        <component :is="avtiveComponent" />
      </dl>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from '@common/utils/vueTools'
import { useI18n } from '@renderer/plugins/i18n'
import { useRoute } from '@common/utils/vueRouter'

import SettingBasic from './components/SettingBasic.vue'
import SettingPlay from './components/SettingPlay.vue'
import SettingPlayDetail from './components/SettingPlayDetail.vue'
import SettingDesktopLyric from './components/SettingDesktopLyric.vue'
import SettingSearch from './components/SettingSearch.vue'
import SettingList from './components/SettingList.vue'
import SettingDownload from './components/SettingDownload.vue'
import SettingSync from './components/SettingSync/index.vue'
import SettingOpenAPI from './components/SettingOpenAPI.vue'
import SettingHotKey from './components/SettingHotKey.vue'
import SettingNetwork from './components/SettingNetwork.vue'
import SettingOdc from './components/SettingOdc.vue'
import SettingBackup from './components/SettingBackup.vue'
import SettingOther from './components/SettingOther.vue'
import SettingUpdate from './components/SettingUpdate.vue'

const t = useI18n()
const route = useRoute()

const dom_content_ref = ref<HTMLElement | null>(null)

type SettingComponentName =
  | 'SettingBasic'
  | 'SettingPlay'
  | 'SettingPlayDetail'
  | 'SettingDesktopLyric'
  | 'SettingSearch'
  | 'SettingList'
  | 'SettingDownload'
  | 'SettingHotKey'
  | 'SettingSync'
  | 'SettingOpenAPI'
  | 'SettingNetwork'
  | 'SettingOdc'
  | 'SettingBackup'
  | 'SettingOther'
  | 'SettingUpdate'

const settingComponents: Record<SettingComponentName, unknown> = {
  SettingBasic,
  SettingPlay,
  SettingPlayDetail,
  SettingDesktopLyric,
  SettingSearch,
  SettingList,
  SettingDownload,
  SettingHotKey,
  SettingSync,
  SettingOpenAPI,
  SettingNetwork,
  SettingOdc,
  SettingBackup,
  SettingOther,
  SettingUpdate,
}

interface TocItem {
  id: SettingComponentName
  title: string
}

const tocList = computed<TocItem[]>(() => {
  return [
    { id: 'SettingBasic', title: t('setting__basic') },
    { id: 'SettingPlay', title: t('setting__play') },
    { id: 'SettingPlayDetail', title: t('setting__play_detail') },
    { id: 'SettingDesktopLyric', title: t('setting__desktop_lyric') },
    { id: 'SettingSearch', title: t('setting__search') },
    { id: 'SettingList', title: t('setting__list') },
    { id: 'SettingDownload', title: t('setting__download') },
    { id: 'SettingHotKey', title: t('setting__hot_key') },
    { id: 'SettingSync', title: t('setting__sync') },
    { id: 'SettingOpenAPI', title: t('setting__open_api') },
    { id: 'SettingNetwork', title: t('setting__network') },
    { id: 'SettingOdc', title: t('setting__odc') },
    { id: 'SettingBackup', title: t('setting__backup') },
    { id: 'SettingOther', title: t('setting__other') },
    { id: 'SettingUpdate', title: t('setting__update') },
  ]
})

const avtiveComponentName = ref<SettingComponentName>(route.query.name && tocList.value.some(t => t.id == route.query.name)
  ? route.query.name as SettingComponentName
  : tocList.value[0].id)

const avtiveComponent = computed(() => settingComponents[avtiveComponentName.value])

const toggleTab = (id: SettingComponentName) => {
  avtiveComponentName.value = id
  void nextTick(() => {
    dom_content_ref.value?.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  })
}
</script>

<style lang="less" module>
@import '@renderer/assets/styles/layout.less';

.main {
  display: flex;
  flex-flow: row nowrap;
  height: 100%;
  min-height: 0;
  gap: @spacing-md;
  padding: @spacing-md @spacing-md 0;
  border-top: var(--color-list-header-border-bottom);
  box-sizing: border-box;
}

.toc {
  flex: 0 0 184px;
  overflow-y: scroll;
  padding: @spacing-xs 0 @spacing-md;
  border-right: 1px solid var(--color-primary-alpha-900);
  box-sizing: border-box;
}
.tocList {
  padding-right: @spacing-md;
}
.tocListItem {
  + .tocListItem {
    margin-top: 2px;
  }
}
.tocH2 {
  position: relative;
  line-height: 1.5;
  .mixin-ellipsis-1();
  font-size: 13px;
  color: var(--color-font);
  padding: 8px 10px 8px 22px;
  border-radius: @radius-control;
  transition: @transition-ui;
  transition-property: background-color, color, box-shadow;

  &:not(.active) {
    cursor: pointer;
    &:hover {
      color: var(--color-primary);
      background-color: var(--color-primary-light-900-alpha-300);
    }
  }
  &.active {
    color: var(--color-primary);
    background-color: var(--color-primary-light-900-alpha-500);
    box-shadow: inset 0 0 0 1px var(--color-primary-alpha-900);
  }
}
.activeIcon {
  position: absolute;
  left: 8px;
  top: 50%;
  height: .9em;
  width: .9em;
  margin-top: -0.45em;
  vertical-align: -0.05em;
}

.setting {
  flex: 1 1 auto;
  padding: @spacing-md @spacing-xl @spacing-xl;
  font-size: 14px;
  box-sizing: border-box;
  overflow-y: auto;
  height: 100%;
  position: relative;
  width: auto;

  :global {
    dl {
      max-width: 940px;
      padding-bottom: @spacing-xl;
    }

    dt {
      position: relative;
      color: var(--color-font);
      font-size: 15px;
      font-weight: 600;
      line-height: 22px;
      padding: 0 0 0 @spacing-md;
      margin: 4px 0 @spacing-sm;

      &::before {
        content: '';
        position: absolute;
        left: 0;
        top: 2px;
        width: 4px;
        height: 18px;
        border-radius: @radius-border;
        background-color: var(--color-primary-alpha-500);
      }
    }

    dd {
      margin: 0 0 @spacing-md;
      padding: @spacing-md @spacing-lg;
      border-radius: @radius-panel;
      background-color: var(--color-primary-light-1000-alpha-500);
      box-shadow: inset 0 0 0 1px var(--color-primary-alpha-900);
      box-sizing: border-box;

      > div {
        padding: 0;
      }

    }
    h3 {
      color: var(--color-font);
      font-size: 13px;
      font-weight: 600;
      margin: 0 0 @spacing-sm;
    }
    .p {
      padding: 4px 0;
      line-height: 1.5;
      .btn {
        + .btn {
          margin-left: @spacing-sm;
        }
      }
    }

    .help-btn {
      padding: 0;
      margin: 0 0.4em;
      border: none;
      background: none;
      color: var(--color-button-font);
      cursor: pointer;
      transition: opacity 0.2s ease;
      &:hover {
        opacity: 0.7;
      }
    }
    .help-icon {
      margin: 0 0.4em;
    }
  }
}
</style>

