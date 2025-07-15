# TRANSLATEAI 多语种 AI 互译工具

## 项目简介

TRANSLATEAI 是一个基于 React + Vite + TypeScript + Ant Design + Zustand + Axios 的极简多语种 AI 互译 Web 工具，支持 OpenAI/Google/DeepSeek/阿里通义 等多模型，支持 API Key 配置、历史记录、自动检测、极简互译、深色主题等。

- 在线体验：支持 Vercel 一键部署
- Chrome 插件：可作为浏览器扩展快速访问

---

## 主要特性
- 支持多语种互译，自动检测语种
- 支持 OpenAI、Google、DeepSeek、阿里通义 等多种模型
- API Key 灵活配置，安全本地存储
- 历史记录本地保存，支持一键清空/删除
- 输入区/结果区高度自适应，极简交互
- 全局字体、主题风格统一，支持深色模式
- 支持 Chrome 插件形态，随时随地翻译

---

## 技术栈
- React 18 + Vite 4 + TypeScript
- Ant Design 5
- Zustand（状态管理）
- Express（API 服务器）
- 支持现代浏览器和移动端

---

## 快速开始

### 本地运行

```bash
# 安装依赖
npm install

# 启动完整开发环境（API服务器 + 前端）
npm run dev:all

# 或使用脚本启动
./start-dev.sh

# 仅启动前端（不包含API服务器）
npm run dev

# 仅启动API服务器
npm run api-server
```

访问 http://localhost:5173 即可体验。

### Vercel 部署
1. 推送代码到 GitHub
2. 登录 [Vercel](https://vercel.com/)，导入仓库，一键部署
3. 构建命令：`npm run build`，输出目录：`dist`
4. 部署成功后获得在线访问地址

---

## API 服务说明

本项目包含一个 API 服务器，用于代理请求到各种翻译 API，避免跨域问题：

- 本地开发：API 服务器运行在 http://localhost:3000
- Vercel 部署：使用 Vercel Serverless Functions（/api 目录）

支持的 API 端点：
- `/api/aliyun-proxy` - 阿里通义 API 代理
- `/api/google-translate` - Google 翻译 API 代理

在本地开发时，必须同时运行 API 服务器和前端开发服务器，推荐使用 `npm run dev:all` 命令。

---

## Chrome 插件用法建议
- 可将本项目部署到 Vercel 后，制作 Chrome 插件快捷入口，点击插件图标即打开在线翻译页面
- 进阶可开发划词翻译、右键菜单等功能

---

## API Key 配置
- 支持 OpenAI、Google、DeepSeek、阿里通义 等多种 API Key
- 在"API Key 配置"页面输入并保存，数据仅本地存储，安全可靠
- 不同模型需对应的 Key，有问题可查阅官方文档

---

## 常见问题

### 1. 如何切换模型？
在页面顶部选择模型即可，需提前配置对应 API Key。

### 2. 历史记录如何管理？
所有翻译历史均本地保存，支持一键清空和单条删除。

### 3. 如何自定义主题/字体？
全局通过 CSS 变量 --app-font-size 控制，支持深色主题。

### 4. 如何作为 Chrome 插件使用？
可用"快捷入口"插件方式，或将前端打包为 popup 页面，详见 Vercel 部署和插件开发说明。

### 5. 遇到 API 请求错误怎么办？
- 确保 API Key 正确且有效
- 本地开发时确保同时运行了 API 服务器（`npm run dev:all`）
- 检查控制台是否有 CORS 或网络错误
- 阿里通义 API 需确保已在阿里云控制台开通相应模型的访问权限

---

## 贡献与反馈

欢迎提 issue、PR 或建议！

---

## License

MIT
