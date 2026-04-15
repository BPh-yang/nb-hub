(function initExplorePage() {
  const { getEffectiveResources, getCategories, setupSubmitLinks, getCompactReviewLabel, loadPublishedOverrides } = window.nbHubData;
  const categories = ["全部", ...getCategories()];

  const elements = {
    categoryChips: document.getElementById("category-chips"),
    searchInput: document.getElementById("search-input"),
    featuredOnly: document.getElementById("featured-only"),
    resultSummary: document.getElementById("result-summary"),
    resourceGrid: document.getElementById("results"),
    clearFilters: document.getElementById("clear-filters"),
    submitIssueLink: document.getElementById("submit-issue-link"),
    submitHint: document.getElementById("submit-hint"),
    year: document.getElementById("year")
  };

  const state = {
    keyword: "",
    category: "全部",
    featuredOnly: false
  };

  function getResources() {
    return getEffectiveResources();
  }

  function applyQueryToState() {
    const params = new URLSearchParams(window.location.search);
    const category = params.get("category") || "全部";

    state.keyword = params.get("search") || "";
    state.featuredOnly = params.get("featured") === "true";
    state.category = categories.includes(category) ? category : "全部";
  }

  function syncStateToQuery() {
    const params = new URLSearchParams();

    if (state.category !== "全部") {
      params.set("category", state.category);
    }

    if (state.keyword) {
      params.set("search", state.keyword);
    }

    if (state.featuredOnly) {
      params.set("featured", "true");
    }

    const query = params.toString();
    const nextUrl = `${window.location.pathname}${query ? `?${query}` : ""}`;
    window.history.replaceState({}, "", nextUrl);
  }

  function matchKeyword(item, keyword) {
    if (!keyword) return true;

    const plain = keyword.toLowerCase();
    const target = [item.name, item.description, item.category, item.sourceType, ...(item.tags || [])].join(" ").toLowerCase();
    return target.includes(plain);
  }

  function getFilteredResources() {
    return getResources().filter((item) => {
      const hitKeyword = matchKeyword(item, state.keyword);
      const hitCategory = state.category === "全部" ? true : item.category === state.category;
      const hitFeatured = state.featuredOnly ? item.featured : true;
      return hitKeyword && hitCategory && hitFeatured;
    });
  }

  function renderCategoryChips() {
    elements.categoryChips.innerHTML = categories
      .map(
        (category) => `
          <button
            class="chip ${state.category === category ? "active" : ""}"
            type="button"
            data-category="${category}"
          >
            ${category}
          </button>
        `
      )
      .join("");

    elements.categoryChips.querySelectorAll(".chip").forEach((chip) => {
      chip.addEventListener("click", () => {
        state.category = chip.dataset.category || "全部";
        renderAll();
      });
    });
  }

  function renderResources() {
    const filtered = getFilteredResources();
    const summaryParts = [];

    if (filtered.length === 0) {
      elements.resourceGrid.innerHTML = '<div class="empty-state">当前没有匹配结果。你可以尝试清空筛选或换一个关键词。</div>';
    } else {
      elements.resourceGrid.innerHTML = filtered
        .map(
          (item) => `
            <a class="resource-card" href="${item.url}" target="_blank" rel="noreferrer">
              <div class="resource-head">
                <span class="pill">${item.category}</span>
                ${item.featured ? '<span class="pill is-featured">精选</span>' : `<span class="pill">${item.sourceType}</span>`}
              </div>
              <div class="title-row">
                <h3>${item.name}</h3>
                ${item.adminReview ? `<div class="editor-note-pill" title="${item.adminReview}">${getCompactReviewLabel(item.adminReview)}</div>` : ""}
              </div>
              <p class="resource-description">${item.description}</p>
              <div class="resource-meta">
                <span class="tag">${item.sourceType}</span>
                ${(item.tags || []).map((tag) => `<span class="tag">${tag}</span>`).join("")}
              </div>
              <div class="resource-footer">
                <span>${item.score}</span>
                <span>${item.sourceType === "Site" ? "访问站点 ↗" : "访问仓库 ↗"}</span>
              </div>
            </a>
          `
        )
        .join("");
    }

    if (state.category !== "全部") {
      summaryParts.push(state.category);
    }

    if (state.keyword) {
      summaryParts.push(`关键词：${state.keyword}`);
    }

    if (state.featuredOnly) {
      summaryParts.push("仅精选");
    }

    elements.resultSummary.textContent = `共 ${filtered.length} 条结果${summaryParts.length > 0 ? ` · ${summaryParts.join(" · ")}` : ""}`;
  }

  function bindEvents() {
    elements.searchInput.addEventListener("input", (event) => {
      state.keyword = event.target.value.trim();
      renderAll();
    });

    elements.featuredOnly.addEventListener("change", (event) => {
      state.featuredOnly = Boolean(event.target.checked);
      renderAll();
    });

    elements.clearFilters.addEventListener("click", () => {
      state.keyword = "";
      state.category = "全部";
      state.featuredOnly = false;
      renderAll();
    });
  }

  function renderYear() {
    elements.year.textContent = String(new Date().getFullYear());
  }

  function renderAll() {
    elements.searchInput.value = state.keyword;
    elements.featuredOnly.checked = state.featuredOnly;
    renderCategoryChips();
    renderResources();
    syncStateToQuery();
  }

  async function init() {
    await loadPublishedOverrides();
    applyQueryToState();
    bindEvents();
    renderAll();
    renderYear();
    setupSubmitLinks(elements.submitIssueLink, null, elements.submitHint);
  }

  init();
})();
