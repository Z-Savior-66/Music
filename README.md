# Lx

Lx-Music 是一个基于 Electron 和 Vue 3 的桌面音乐应用项目。

## 项目地址

- GitHub 仓库：https://github.com/Z-Savior-66/Music.git

## 技术栈

- Electron 37
- Vue 3
- Webpack 5
- Less

## 测试与代码规范

```bash
npx vitest run   # 单元测试
npm run lint     # ESLint 检查
```

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

## 代理环境

`dp` / `up` 两个脚本用于在代理下执行打包与依赖安装，代理地址不再写死在 `package.json` 中，改为运行时读取：

1. 环境变量 `HTTPS_PROXY` / `https_proxy` / `HTTP_PROXY` / `http_proxy`（按此顺序取第一个非空值）；
2. 项目根目录的 `.env.local` 或 `.env`（只识别上述代理变量与 `NO_PROXY`，不覆盖已存在的环境变量）。

```bash
# 设置代理后使用
npm run up   # 代理下安装依赖
npm run dp   # 代理下执行打包

# 或写入项目根目录 .env
# HTTPS_PROXY=http://127.0.0.1:7890
```

未检测到代理地址时脚本会直接报错并提示，不会静默直连；确实不需要代理时请直接执行 `npm install` / `npm run pack`，或设置 `DP_NO_PROXY=1`。

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
│  ├─ renderer-scripts/      # 渲染侧脚本构建配置
│  └─ withProxy.js           # dp / up 脚本的代理读取与命令转发
├─ dist/                     # 编译后的前后端产物
│  ├─ media/                 # 音频资源输出
│  ├─ static/                # 静态资源输出
│  ├─ theme_images/          # 主题图片输出
│  └─ userApi/               # 用户 API 页面产物
├─ docs/                     # 设计与实施计划文档
│  └─ superpowers/plans/     # 按日期归档的实施计划
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

## 许可证

本项目以 Apache License 2.0 授权发行，完整条款见仓库中的 `LICENSE` 文件。

本项目基于 [lx-music-desktop](https://github.com/lyswhut/lx-music-desktop)（作者 lyswhut，Apache-2.0）派生，原项目的版权声明继续有效。
