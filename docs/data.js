(function initNbHubData() {
  const resourceData = [
    {
      name: "New API",
      category: "Infra",
      description: "下一代 LLM 网关与 AI 资产管理系统，支持多模型统一接入、渠道管理、计费和路由控制。",
      tags: ["LLM Gateway", "Proxy", "Billing", "Self-hosted"],
      url: "https://github.com/QuantumNous/new-api",
      sourceType: "GitHub",
      featured: true,
      score: "网关中枢"
    },
    {
      name: "CC Switch",
      category: "Tool",
      description: "面向 Claude Code、Codex、Gemini CLI、OpenCode 等工具的一站式配置切换与管理桌面客户端。",
      tags: ["Claude Code", "CLI Manager", "MCP", "Cross-Platform"],
      url: "https://github.com/farion1231/cc-switch",
      sourceType: "GitHub",
      featured: true,
      score: "开发入口"
    },
    {
      name: "Claude Skills",
      category: "Skill",
      description: "收录大量生产级 Claude Code 技能与 agent 插件，可复用于多种 AI 编码工具工作流。",
      tags: ["Claude Code", "Agent Skills", "Plugin", "Workflow"],
      url: "https://github.com/alirezarezvani/claude-skills",
      sourceType: "GitHub",
      featured: true,
      score: "技能密度"
    },
    {
      name: "mcpservers.org",
      category: "MCP",
      description: "MCP Server 导航站，聚合官方与社区服务器，便于按能力快速发现可接入资源。",
      tags: ["Directory", "Model Context Protocol", "Server List", "Discovery"],
      url: "https://mcpservers.org/",
      sourceType: "Site",
      featured: true,
      score: "生态导航"
    },
    {
      name: "OpenSpec",
      category: "Tool",
      description: "AI 驱动的轻量规范工作流框架，帮助团队在编码前先对齐需求与交付边界。",
      tags: ["Spec Workflow", "AI Coding", "Planning", "Node.js"],
      url: "https://github.com/Fission-AI/OpenSpec",
      sourceType: "GitHub",
      featured: true,
      score: "先规格后编码"
    },
    {
      name: "QwenPaw",
      category: "Agent/App",
      description: "AgentScope 团队推出的个人 AI 助手，支持多渠道接入、多智能体协作与本地模型能力。",
      tags: ["Assistant", "Multi-Agent", "Local Model", "Channels"],
      url: "https://github.com/agentscope-ai/QwenPaw",
      sourceType: "GitHub",
      featured: true,
      score: "助手形态"
    },
    {
      name: "Awesome Claude Skills",
      category: "Collection",
      description: "围绕 Claude Skills 的精选导航清单，适合快速扫一遍官方与社区资源版图。",
      tags: ["Awesome List", "Claude Skills", "Resources", "Community"],
      url: "https://github.com/travisvn/awesome-claude-skills",
      sourceType: "GitHub",
      featured: false,
      score: "导航友好"
    },
    {
      name: "Superpowers",
      category: "Skill",
      description: "面向 AI 编程代理的软件开发工作流技能库，强调 TDD、系统化调试与并行开发。",
      tags: ["TDD", "Coding Agent", "Subagent", "Workflow"],
      url: "https://github.com/obra/superpowers",
      sourceType: "GitHub",
      featured: false,
      score: "工程纪律"
    },
    {
      name: "Sub2API",
      category: "Infra",
      description: "面向订阅额度分发与多账号调度的 AI API 网关平台，支持计费、负载均衡与支付集成。",
      tags: ["API Gateway", "Quota", "Billing", "Load Balance"],
      url: "https://github.com/Wei-Shaw/sub2api",
      sourceType: "GitHub",
      featured: false,
      score: "配额调度"
    },
    {
      name: "Everything Claude Code",
      category: "Collection",
      description: "Claude Code 生态资源聚合库，系统整理工具、集成、模板和最佳实践入口。",
      tags: ["Claude Code", "Resource Hub", "Integration", "Ecosystem"],
      url: "https://github.com/affaan-m/everything-claude-code",
      sourceType: "GitHub",
      featured: false,
      score: "生态索引"
    },
    {
      name: "BestBlogs",
      category: "Collection",
      description: "AI 驱动的技术内容聚合平台，结合 RSS 与 LLM 进行文章评分、摘要和翻译。",
      tags: ["Content Hub", "RSS", "Summarization", "Translation"],
      url: "https://github.com/ginobefun/BestBlogs",
      sourceType: "GitHub",
      featured: false,
      score: "内容发现"
    },
    {
      name: "LangChain",
      category: "Framework",
      description: "最常见的 LLM 应用开发框架之一，适合构建检索增强、工具调用与多步骤编排流程。",
      tags: ["RAG", "Agent", "Workflow"],
      url: "https://github.com/langchain-ai/langchain",
      sourceType: "GitHub",
      featured: true,
      score: "稳定迭代"
    },
    {
      name: "LlamaIndex",
      category: "Framework",
      description: "面向知识库与数据接入的框架，强调文档索引、查询链路与企业数据集成能力。",
      tags: ["Knowledge", "Index", "RAG"],
      url: "https://github.com/run-llama/llama_index",
      sourceType: "GitHub",
      featured: true,
      score: "知识库友好"
    },
    {
      name: "Haystack",
      category: "Framework",
      description: "以生产可维护性见长的 NLP/LLM 框架，适合构建可部署的问答与检索系统。",
      tags: ["Pipeline", "Search", "Production"],
      url: "https://github.com/deepset-ai/haystack",
      sourceType: "GitHub",
      featured: false,
      score: "企业可用"
    },
    {
      name: "Open WebUI",
      category: "Tool",
      description: "本地部署友好的 AI Web 面板，支持多模型接入、会话管理与团队化使用。",
      tags: ["Self-hosted", "UI", "Ops"],
      url: "https://github.com/open-webui/open-webui",
      sourceType: "GitHub",
      featured: true,
      score: "部署友好"
    },
    {
      name: "Flowise",
      category: "Tool",
      description: "可视化编排 LLM 应用流程，降低原型搭建门槛，适合快速验证业务流程。",
      tags: ["Low-code", "Workflow", "Prototype"],
      url: "https://github.com/FlowiseAI/Flowise",
      sourceType: "GitHub",
      featured: false,
      score: "上手快"
    },
    {
      name: "Dify",
      category: "Tool",
      description: "面向团队的 LLM 应用平台，集成提示词、数据集、应用发布与监控链路。",
      tags: ["Platform", "LLMOps", "Team"],
      url: "https://github.com/langgenius/dify",
      sourceType: "GitHub",
      featured: true,
      score: "平台完整"
    },
    {
      name: "modelcontextprotocol",
      category: "MCP",
      description: "MCP 规范官方仓库，定义模型与外部能力（工具、资源、提示）的标准连接方式。",
      tags: ["Protocol", "Standard", "Spec"],
      url: "https://github.com/modelcontextprotocol",
      sourceType: "GitHub",
      featured: true,
      score: "标准核心"
    },
    {
      name: "MCP Servers",
      category: "MCP",
      description: "社区维护的 MCP Server 集合，可快速接入文件系统、数据库、浏览器等能力。",
      tags: ["Server", "Integration", "Ecosystem"],
      url: "https://github.com/modelcontextprotocol/servers",
      sourceType: "GitHub",
      featured: true,
      score: "生态加速"
    },
    {
      name: "FastMCP",
      category: "MCP",
      description: "Python 侧 MCP 服务器开发框架，简化工具暴露、资源注册与协议兼容。",
      tags: ["Python", "Server", "DX"],
      url: "https://github.com/jlowin/fastmcp",
      sourceType: "GitHub",
      featured: false,
      score: "开发体验"
    },
    {
      name: "OpenHands",
      category: "Agent/App",
      description: "面向软件工程任务的智能代理平台，强调可执行、可验证、可迭代的开发流程。",
      tags: ["Coding Agent", "Automation", "Dev"],
      url: "https://github.com/All-Hands-AI/OpenHands",
      sourceType: "GitHub",
      featured: false,
      score: "工程导向"
    },
    {
      name: "AutoGen",
      category: "Framework",
      description: "多智能体协作框架，适合构建复杂任务分工、工具调用与代理间通信实验。",
      tags: ["Multi-Agent", "Experiment", "Framework"],
      url: "https://github.com/microsoft/autogen",
      sourceType: "GitHub",
      featured: false,
      score: "协作能力"
    },
    {
      name: "CrewAI",
      category: "Framework",
      description: "以“角色 + 任务 + 流程”建模代理协作的框架，适合业务流程自动化尝试。",
      tags: ["Role-based", "Agent", "Workflow"],
      url: "https://github.com/crewAIInc/crewAI",
      sourceType: "GitHub",
      featured: false,
      score: "流程抽象"
    },
    {
      name: "LiteLLM",
      category: "Infra",
      description: "统一多家模型服务调用接口，降低模型切换与成本优化门槛。",
      tags: ["Gateway", "Model Router", "Cost"],
      url: "https://github.com/BerriAI/litellm",
      sourceType: "GitHub",
      featured: true,
      score: "多模型路由"
    },
    {
      name: "vLLM",
      category: "Infra",
      description: "高性能推理引擎，适用于大规模并发与吞吐优先的模型服务部署。",
      tags: ["Inference", "Performance", "Serving"],
      url: "https://github.com/vllm-project/vllm",
      sourceType: "GitHub",
      featured: true,
      score: "推理性能"
    },
    {
      name: "Ollama",
      category: "Infra",
      description: "本地大模型运行与分发工具，降低私有化部署与开发测试门槛。",
      tags: ["Local LLM", "Self-hosted", "Dev"],
      url: "https://github.com/ollama/ollama",
      sourceType: "GitHub",
      featured: false,
      score: "本地优先"
    }
  ];

  const trendNarrative = [
    {
      title: "MCP 正从协议走向分发网络",
      body: "规范、服务器实现和导航站正在同时成熟。下一步竞争点不只是“能不能接”，而是谁能把能力发现、权限治理和接入体验做顺。"
    },
    {
      title: "AI 编码栈开始分层",
      body: "从 Claude Code 管理器、技能库到规范工作流，AI Coding 正在形成明确分层：入口工具、工作流资产、再到团队协作规范。"
    },
    {
      title: "网关与本地推理成为基础设施默认项",
      body: "多模型路由、API 配额调度、本地推理与自托管面板一起构成 AI 应用的底座，工程团队越来越需要一体化的基础设施视角。"
    }
  ];

  const categoryMeta = {
    Framework: "用于构建 AI / Agent 应用核心能力的开发框架。",
    Tool: "聚焦工作流、规范、编排与开发效率的实用工具。",
    MCP: "围绕 Model Context Protocol 的规范、服务与目录资源。",
    Skill: "面向 Claude Code / coding agent 的可复用技能与工作流资产。",
    Infra: "提供网关、推理、路由与部署能力的 AI 基础设施。",
    "Agent/App": "直接面向任务执行、助手交互或个人生产力的 AI 应用。",
    Collection: "精选清单、导航站与内容聚合项目，适合快速发现生态。"
  };

  const FEATURED_STORAGE_KEY = "nbHubFeaturedOverrides";

  const preferredCategoryOrder = ["Framework", "Tool", "MCP", "Skill", "Infra", "Agent/App", "Collection"];

  function getResourceId(item) {
    return item.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  function getStorage() {
    try {
      return window.localStorage;
    } catch {
      return null;
    }
  }

  function getBaseResources() {
    return resourceData.map((item) => ({
      ...item,
      id: getResourceId(item)
    }));
  }

  const defaultFeaturedMap = Object.fromEntries(
    getBaseResources().map((item) => [item.id, Boolean(item.featured)])
  );

  function sanitizeFeaturedOverrides(input) {
    if (!input || typeof input !== "object" || Array.isArray(input)) {
      return {};
    }

    return Object.fromEntries(
      Object.entries(input).filter(([key, value]) => Object.hasOwn(defaultFeaturedMap, key) && typeof value === "boolean")
    );
  }

  function getFeaturedOverrides() {
    const storage = getStorage();

    if (!storage) {
      return {};
    }

    try {
      const raw = storage.getItem(FEATURED_STORAGE_KEY);
      if (!raw) {
        return {};
      }

      return sanitizeFeaturedOverrides(JSON.parse(raw));
    } catch {
      return {};
    }
  }

  function persistFeaturedOverrides(overrides) {
    const storage = getStorage();

    if (!storage) {
      return;
    }

    const safeOverrides = sanitizeFeaturedOverrides(overrides);

    if (Object.keys(safeOverrides).length === 0) {
      storage.removeItem(FEATURED_STORAGE_KEY);
      return;
    }

    storage.setItem(FEATURED_STORAGE_KEY, JSON.stringify(safeOverrides));
  }

  function getEffectiveResources() {
    const overrides = getFeaturedOverrides();

    return getBaseResources().map((item) => {
      const hasOverride = typeof overrides[item.id] === "boolean";
      const defaultFeatured = Boolean(item.featured);

      return {
        ...item,
        defaultFeatured,
        featured: hasOverride ? overrides[item.id] : defaultFeatured,
        hasFeaturedOverride: hasOverride
      };
    });
  }

  function updateFeaturedOverride(resourceId, featured) {
    const overrides = getFeaturedOverrides();
    const defaultFeatured = defaultFeaturedMap[resourceId];

    if (typeof defaultFeatured !== "boolean") {
      return getEffectiveResources();
    }

    if (featured === defaultFeatured) {
      delete overrides[resourceId];
    } else {
      overrides[resourceId] = featured;
    }

    persistFeaturedOverrides(overrides);
    return getEffectiveResources();
  }

  function setFeaturedOverridesForIds(resourceIds, featured) {
    const overrides = getFeaturedOverrides();

    resourceIds.forEach((resourceId) => {
      const defaultFeatured = defaultFeaturedMap[resourceId];

      if (typeof defaultFeatured !== "boolean") {
        return;
      }

      if (featured === defaultFeatured) {
        delete overrides[resourceId];
      } else {
        overrides[resourceId] = featured;
      }
    });

    persistFeaturedOverrides(overrides);
    return getEffectiveResources();
  }

  function clearFeaturedOverrides() {
    persistFeaturedOverrides({});
    return getEffectiveResources();
  }

  function exportFeaturedOverrides() {
    return JSON.stringify(getFeaturedOverrides(), null, 2);
  }

  function importFeaturedOverrides(rawText) {
    try {
      const parsed = JSON.parse(rawText);
      persistFeaturedOverrides(parsed);
      return {
        ok: true,
        resources: getEffectiveResources()
      };
    } catch {
      return {
        ok: false,
        resources: getEffectiveResources()
      };
    }
  }

  function getCategories() {
    return preferredCategoryOrder.filter((category) => resourceData.some((item) => item.category === category));
  }

  function buildExploreUrl(options = {}) {
    const params = new URLSearchParams();

    if (options.category && options.category !== "全部") {
      params.set("category", options.category);
    }

    if (options.search) {
      params.set("search", options.search);
    }

    if (options.featured) {
      params.set("featured", "true");
    }

    const query = params.toString();
    return `./explore.html${query ? `?${query}` : ""}`;
  }

  function inferGitHubRepo() {
    const host = window.location.hostname;
    const pathParts = window.location.pathname.split("/").filter(Boolean);

    if (host.endsWith("github.io") && pathParts.length > 0) {
      const owner = host.replace(".github.io", "");
      const repo = pathParts[0];
      return `https://github.com/${owner}/${repo}`;
    }

    return null;
  }

  function setupSubmitLinks(issueEl, prEl, hintEl) {
    const inferredRepo = inferGitHubRepo();

    if (!hintEl) {
      return;
    }

    if (!inferredRepo) {
      hintEl.textContent = "未检测到 GitHub Pages 地址，请在项目部署后自动生成仓库提交链接。";
      return;
    }

    if (issueEl) {
      issueEl.href = `${inferredRepo}/issues/new?title=%5Bnb-hub%20%E6%94%B6%E5%BD%95%5D%20%E9%A1%B9%E7%9B%AE%E5%90%8D`;
    }

    if (prEl) {
      prEl.href = `${inferredRepo}/compare`;
    }

    hintEl.textContent = `已连接仓库：${inferredRepo}`;
  }

  window.nbHubData = {
    resourceData,
    trendNarrative,
    categoryMeta,
    preferredCategoryOrder,
    getBaseResources,
    getEffectiveResources,
    getFeaturedOverrides,
    updateFeaturedOverride,
    setFeaturedOverridesForIds,
    clearFeaturedOverrides,
    exportFeaturedOverrides,
    importFeaturedOverrides,
    getCategories,
    buildExploreUrl,
    setupSubmitLinks
  };
})();
