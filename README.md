# S

S-Music 是一个基于 Electron 和 Vue 3 的桌面音乐应用项目。

## 项目地址

- GitHub 仓库：https://github.com/Z-Savior-66/Music.git

## 技术栈

- Electron
- Vue 3
- Webpack
- Less

## 开发环境

- Node.js 22 及以上
- npm 8.5.2 及以上

## 启动项目

```bash
npm install
npm run dev
```

## 打包项目

```bash
npm run pack
```

说明：

- Windows 打包依赖 Visual Studio Build Tools。
- 需要安装 `使用 C++ 的桌面开发` 工作负载。

## 项目结构

```text
S-music/
├─ build/                    # 打包输出目录与自动更新发布文件
│  ├─ Release/               # 原生模块与构建中间产物
│  └─ win-unpacked/          # Windows 解包后的运行目录
├─ build-config/             # Electron 与 Webpack 构建配置
│  ├─ lib/                   # 预置原生库与平台二进制
│  ├─ main/                  # 主进程构建配置
│  ├─ renderer/              # 主渲染进程构建配置
│  ├─ renderer-lyric/        # 桌面歌词渲染进程构建配置
│  └─ renderer-scripts/      # 渲染侧脚本构建配置
├─ dist/                     # 编译后的前后端产物
│  ├─ media/                 # 音频资源输出
│  ├─ static/                # 静态资源输出
│  ├─ theme_images/          # 主题图片输出
│  └─ userApi/               # 用户 API 页面产物
├─ licenses/                 # 许可证资源
├─ publish/                  # 发布脚本与版本描述文件
│  └─ utils/                 # 发布流程辅助脚本
├─ resources/                # 打包资源目录
│  └─ icons/                 # 应用图标资源
└─ src/                      # 项目源码
   ├─ common/                # 主进程与渲染进程共享代码
   │  ├─ theme/              # 主题定义与主题资源
   │  ├─ types/              # 全局类型声明
   │  └─ utils/              # 通用工具函数
   ├─ lang/                  # 多语言文案
   ├─ main/                  # Electron 主进程源码
   │  ├─ event/              # 主进程事件定义
   │  ├─ modules/            # 主进程功能模块
   │  ├─ types/              # 主进程类型声明
   │  ├─ utils/              # 主进程工具函数
   │  └─ worker/             # 主进程工作线程
   ├─ renderer/              # 主界面渲染进程源码
   │  ├─ assets/             # 主界面静态资源
   │  ├─ components/         # 通用与布局组件
   │  ├─ core/               # 核心业务逻辑
   │  ├─ event/              # 渲染进程事件封装
   │  ├─ plugins/            # 插件与扩展能力
   │  ├─ store/              # 状态管理
   │  ├─ types/              # 渲染进程类型声明
   │  ├─ utils/              # 渲染进程工具函数
   │  ├─ views/              # 页面视图
   │  └─ worker/             # 渲染进程工作线程
   ├─ renderer-lyric/        # 桌面歌词窗口源码
   │  ├─ assets/             # 桌面歌词静态资源
   │  ├─ components/         # 桌面歌词组件
   │  ├─ core/               # 桌面歌词核心逻辑
   │  ├─ plugins/            # 桌面歌词插件
   │  ├─ store/              # 桌面歌词状态管理
   │  ├─ types/              # 桌面歌词类型声明
   │  ├─ useApp/             # 桌面歌词应用级组合逻辑
   │  └─ utils/              # 桌面歌词工具函数
   └─ static/                # 源码中的静态资源
      └─ images/             # 图片资源
```

## 当前状态

- 已完成仓库初始化并推送到 GitHub
- 已统一应用品牌、打包名称与更新源
- 已移除设置页中的“关于”入口
- 本地开发环境可正常启动
- Windows 安装包可正常构建

## 许可证

本项目当前沿用仓库中的 `LICENSE` 文件。
