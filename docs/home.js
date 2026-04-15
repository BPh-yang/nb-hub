(function initHomePage() {
  const { trendNarrative, categoryMeta, getCategories, buildExploreUrl, setupSubmitLinks, getEffectiveResources, getCompactReviewLabel, loadPublishedOverrides } = window.nbHubData;

  const elements = {
    categoryGrid: document.getElementById("category-grid"),
    routeGrid: document.getElementById("route-grid"),
    featureGrid: document.getElementById("feature-grid"),
    insightGrid: document.getElementById("insight-grid"),
    metricTotal: document.getElementById("metric-total"),
    metricFeatured: document.getElementById("metric-featured"),
    metricCategories: document.getElementById("metric-categories"),
    submitIssueLink: document.getElementById("submit-issue-link"),
    submitHint: document.getElementById("submit-hint"),
    year: document.getElementById("year")
  };

  let resourceData = [];
  const categories = getCategories();

  function renderMetrics() {
    elements.metricTotal.textContent = String(resourceData.length);
    elements.metricFeatured.textContent = String(resourceData.filter((item) => item.featured).length);
    elements.metricCategories.textContent = String(categories.length);
  }

  function renderCategoryCards() {
    elements.categoryGrid.innerHTML = categories
      .map((category) => {
        const items = resourceData.filter((item) => item.category === category);
        return `
          <a class="entry-card" href="${buildExploreUrl({ category })}">
            <div class="card-head">
              <span class="meta-chip">${items.length} 个条目</span>
              <span class="pill">${category}</span>
            </div>
            <h3>${category}</h3>
            <p class="card-copy">${categoryMeta[category]}</p>
            <div class="entry-meta">
              ${items
                .slice(0, 3)
                .map((item) => `<span class="tag">${item.name}</span>`)
                .join("")}
            </div>
            <div class="entry-footer">
              <span>进入该分类</span>
              <span>→</span>
            </div>
          </a>
        `;
      })
      .join("");
  }

  function renderRouteCards() {
    const routes = [
      {
        title: "浏览全部资源",
        description: "从完整资源库页开始，适合已经知道自己要找什么的人。",
        href: buildExploreUrl(),
        badge: "全量入口"
      },
      {
        title: "只看编辑精选",
        description: "优先查看当前最值得先读、先试、先收藏的项目。",
        href: buildExploreUrl({ featured: true }),
        badge: "精选路线"
      },
      {
        title: "直达 MCP 生态",
        description: "只看 MCP 相关规范、服务器和导航站，适合最近在接工具链的人。",
        href: buildExploreUrl({ category: "MCP" }),
        badge: "协议专题"
      },
      {
        title: "Claude Code 相关",
        description: "快速聚焦 Claude Code 生态项目、技能与资源集合。",
        href: buildExploreUrl({ search: "Claude" }),
        badge: "关键词入口"
      }
    ];

    elements.routeGrid.innerHTML = routes
      .map(
        (route) => `
          <a class="route-card" href="${route.href}">
            <span class="meta-chip is-bright">${route.badge}</span>
            <h3>${route.title}</h3>
            <p class="card-copy">${route.description}</p>
            <div class="card-action">
              <span>跳转浏览页</span>
              <span>→</span>
            </div>
          </a>
        `
      )
      .join("");
  }

  function renderFeatureCards() {
    const features = resourceData.filter((item) => item.featured).slice(0, 4);
    elements.featureGrid.innerHTML = features
      .map(
        (item) => `
          <a class="feature-card" href="${buildExploreUrl({ search: item.name })}">
            <div class="card-head">
              <span class="pill is-featured">精选</span>
              <span class="pill">${item.category}</span>
            </div>
            <div class="title-row">
              <h3>${item.name}</h3>
              ${item.adminReview ? `<div class="editor-note-pill" title="${item.adminReview}">${getCompactReviewLabel(item.adminReview)}</div>` : ""}
            </div>
            <p class="card-copy">${item.description}</p>
            <div class="entry-meta">
              ${(item.tags || []).slice(0, 3).map((tag) => `<span class="tag">${tag}</span>`).join("")}
            </div>
            <div class="entry-footer">
              <span>查看该项目所在上下文</span>
              <span>→</span>
            </div>
          </a>
        `
      )
      .join("");
  }

  function renderInsights() {
    elements.insightGrid.innerHTML = trendNarrative
      .map(
        (item) => `
          <article class="insight-card">
            <p class="eyebrow-inline">趋势观察</p>
            <h3>${item.title}</h3>
            <p class="card-copy">${item.body}</p>
          </article>
        `
      )
      .join("");
  }

  function renderYear() {
    elements.year.textContent = String(new Date().getFullYear());
  }

  async function init() {
    await loadPublishedOverrides();
    resourceData = getEffectiveResources();
    renderMetrics();
    renderCategoryCards();
    renderRouteCards();
    renderFeatureCards();
    renderInsights();
    renderYear();
    setupSubmitLinks(elements.submitIssueLink, null, elements.submitHint);
  }

  init();
})();
