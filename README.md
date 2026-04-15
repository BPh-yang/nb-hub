# nb-hub

nb-hub 是一个专注于 AI 大模型外围生态的开源合集。项目以中文优先方式聚合 AI Framework、Tool、MCP、Skill 与 Agent/Infra 资源，提供可直接浏览的静态导航首页。

## 项目特性

- **纯静态实现**：无 Node/npm/pnpm 依赖、无构建步骤。
- **首页 / 资源库分层**：首页只做卡片化导航入口，完整浏览与筛选放在独立资源库页。
- **资源可搜索筛选**：资源库页支持关键词搜索、分类筛选、仅看精选，并已内置真实 AI 生态项目示例。
- **数据集中维护**：资源数据集中在 `docs/data.js` 中的 `resourceData`，便于扩展。
- **精选 CMS 面板**：新增 `docs/admin.html`，支持单项确认、当前视图一键精选 / 一键取消精选，并即时同步前台展示。
- **共享发布配置**：`docs/admin-overrides.json` 作为公开配置源，发布后所有访客都能看到新的精选与短评。
- **可直接部署 GitHub Pages**：通过 GitHub Actions 自动将 `docs/` 部署为 Pages 站点。

## 目录结构

```text
.
├─ docs/
│  ├─ index.html      # 首页结构（静态）
│  ├─ explore.html    # 独立资源库页
│  ├─ admin.html      # 精选项目管理页
│  ├─ admin-overrides.json # 已发布的共享精选/短评配置
│  ├─ styles.css      # 设计系统 tokens + 页面样式
│  ├─ data.js         # 资源数据源 + 公共配置
│  ├─ overrides.js    # 已发布配置读取、本地草稿与 GitHub 发布逻辑
│  ├─ home.js         # 首页卡片入口渲染逻辑
│  ├─ explore.js      # 资源库搜索/筛选逻辑
│  ├─ admin.js        # 精选后台管理逻辑
│  └─ .nojekyll       # 禁用 Jekyll 处理
└─ .github/
   └─ workflows/
      └─ deploy-pages.yml  # GitHub Pages 部署工作流
```

## 本地预览

直接打开 `docs/index.html` 即可预览首页，也可以打开 `docs/explore.html` 预览资源库页。

如果你要调整“编辑精选”，打开 `docs/admin.html` 即可。

如果你要让后台改动对所有访客可见：

1. 打开 `docs/admin.html`
2. 填入 GitHub `owner`、`repo`、`branch`
3. 输入一个具有仓库内容写权限的 GitHub Token
4. 点击“发布到 GitHub”
5. 页面会把当前草稿写入 `docs/admin-overrides.json`

说明：

- 前台公开页面只读取 `docs/admin-overrides.json`
- 后台本地草稿不会自动对其他访客可见
- 只有点击“发布到 GitHub”后，其他访客刷新页面才会看到更新

> 说明：页面所有资源路径均为相对路径（如 `./styles.css`、`./data.js`、`./home.js`），可兼容 GitHub Project Pages（`/<repo>/`）路径部署。

## 如何扩展资源

在 `docs/data.js` 的 `resourceData` 中新增条目：

```js
{
  name: "项目名",
  category: "Framework | Tool | MCP | Skill | Infra | Agent/App | Collection",
  description: "一句话说明",
  tags: ["标签1", "标签2"],
  url: "https://github.com/owner/repo",
  sourceType: "GitHub | Site",
  featured: false,
  score: "可选：简短观察"
}
```

当前首页分类包括：

- `Framework`：AI / Agent 应用开发框架
- `Tool`：工作流、规范、编排与效率工具
- `MCP`：Model Context Protocol 规范、服务与目录
- `Skill`：Claude Code / coding agent 技能资产
- `Infra`：网关、推理、路由与部署基础设施
- `Agent/App`：AI 助手、智能体应用
- `Collection`：导航站、精选清单、内容聚合

## GitHub Pages 部署说明

工作流文件：`.github/workflows/deploy-pages.yml`

- 触发方式：
  - push 到 `main`
  - 手动触发 `workflow_dispatch`
- 部署方式：
  - 使用 `actions/upload-pages-artifact` 上传 `docs/`
  - 使用 `actions/deploy-pages` 发布

### 首次启用建议

1. 在 GitHub 仓库中进入 **Settings → Pages**。
2. Source 选择 **GitHub Actions**。
3. 推送到 `main` 后等待 Actions 完成，即可访问 Pages 地址。

## 贡献

欢迎通过 Issue / PR 提交项目收录建议。建议提供：

- 项目定位与适用场景
- 仓库地址与文档入口
- 最近维护状态（是否活跃）
