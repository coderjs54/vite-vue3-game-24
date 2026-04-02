# Vue 3 + TypeScript + Vite 实现的 24 点小游戏

使用加减乘除与括号，将随机给出的数字凑成 **24** 即可获胜。界面支持中英文切换，并可通过 PWA 安装到本地。

---

## 技术栈

| 类别 | 技术 | 说明 |
|------|------|------|
| 运行时 / 框架 | **Vue 3**（约 3.5.x） | 单页应用；使用 **`<script setup>`** 与 **Composition API**（`ref`、`computed`、`onMounted` 等） |
| 语言 | **TypeScript**（约 5.9） | 严格模式与未使用变量检查等；构建前由 **vue-tsc** 做类型检查 |
| 构建工具 | **Vite**（约 8.x） | 开发与生产打包；**ESM**（`package.json` 中 `"type": "module"`） |
| Vue 集成 | **@vitejs/plugin-vue** | 解析 `.vue` 单文件组件 |
| 国际化 | **vue-i18n**（约 11.x） | `legacy: false`，与 Composition API 配合；文案在 `src/i18n/zh.json`、`en.json`；语言偏好存 **localStorage** |
| 样式 | **SCSS**（**sass-embedded**） | 在 `App.vue` 中使用 `lang="scss"` 的 **scoped** 样式；全局基础样式见 `src/style.css` |
| PWA | **vite-plugin-pwa** + **Workbox** | `registerType: 'autoUpdate'`；开发环境可开启 PWA 调试（`devOptions.enabled`）；配合 **@vite-pwa/assets-generator** 生成应用图标等资源 |
| 类型 / 工程配置 | **@vue/tsconfig** | `tsconfig.app.json` 继承 DOM 场景预设；含 **Vite 客户端类型**（`vite/client`） |
| Node 版本 | **Volta** | 锁定 **Node 20.20.2**（见 `package.json` 的 `volta` 字段） |

**开发依赖说明：** 项目中还包含 **@vue/test-utils**，当前 `package.json` 未配置测试脚本；若需单测，可在此基础上接入 **Vitest** 等。

**部署路径：** `vite.config.ts` 中 `base` 为 `/vite-vue3-game-24/`，与 **GitHub Pages** 常见仓库子路径一致；若仓库名或 Pages 地址不同，需同步修改 `base`。自动部署说明见下文 **GitHub Actions**。

---

## 项目结构（简要）

```
.github/
  workflows/
    deploy.yaml    # 推送到 main 时构建并部署到 GitHub Pages
src/
  App.vue          # 游戏主界面与逻辑（抽数、表达式、校验 24）
  main.ts          # 创建应用、注册 vue-i18n、挂载
  style.css        # 全局样式
  i18n/            # 中英文文案 JSON
  assets/          # 静态资源（如图标）
vite.config.ts     # Vite + Vue + PWA 配置
```

---

## 常用命令

| 命令 | 作用 |
|------|------|
| `npm run dev` | 启动开发服务器（`vite --host`，局域网可访问） |
| `npm run build` | 先执行 `vue-tsc` 再 `vite build` |
| `npm run preview` | 本地预览构建产物 |

---

## GitHub Actions（`.github`）

仓库内通过 **GitHub Actions** 自动构建并发布到 **GitHub Pages**，工作流文件为 [`.github/workflows/deploy.yaml`](.github/workflows/deploy.yaml)。

| 项 | 说明 |
|----|------|
| **工作流名称** | Deploy App to GitHub Pages |
| **触发条件** | 向 **`main`** 分支 **push**；或在 Actions 中 **手动运行**（`workflow_dispatch`） |
| **运行环境** | `ubuntu-latest` |
| **Node** | **20**（`actions/setup-node@v4`，并启用 **npm** 缓存） |
| **安装依赖** | `npm ci --legacy-peer-deps` |
| **构建** | `npm run build`（与本地一致：类型检查 + Vite 打包） |
| **发布** | 将 **`dist`** 目录作为 Pages 产物上传，由 `actions/deploy-pages@v4` 部署 |
| **权限** | `contents: read`，`pages: write`，`id-token: write`（OIDC 部署 Pages） |
| **并发** | `concurrency` 分组为 `pages`，新运行会取消进行中的同组任务，避免重复部署冲突 |

**使用前提：** 在仓库 **Settings → Pages** 中将 **Source** 设为 **GitHub Actions**；首次部署后可在同一页面查看站点地址。若仓库名不是 `vite-vue3-game-24`，请修改 `vite.config.ts` 里的 `base`，使其与 Pages 的 URL 路径一致。

---

## 功能特性

- **中英文切换**：标题、按钮与结果提示随语言切换；选择写入本地存储。
- **PWA**：可离线缓存静态资源（由 Workbox 策略与 manifest 配置决定），支持“类原生”安装体验。
