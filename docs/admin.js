(function initAdminPage() {
  const {
    getAdminResources,
    getFeaturedOverrides,
    getReviewOverrides,
    getCategories,
    updateFeaturedOverride,
    setFeaturedOverridesForIds,
    clearFeaturedOverrides,
    updateAdminReviewOverride,
    clearAdminReviewOverrides,
    exportFeaturedOverrides,
    getPublishSettings,
    savePublishSettings,
    publishOverridesToGitHub,
    loadPublishedOverrides,
    categoryIcons
  } = window.nbHubData;

  const elements = {
    searchInput: document.getElementById("admin-search"),
    showOverrides: document.getElementById("admin-show-overrides"),
    categoryChips: document.getElementById("admin-category-chips"),
    resultSummary: document.getElementById("admin-result-summary"),
    scopeSummary: document.getElementById("admin-scope-summary"),
    statusSummary: document.getElementById("admin-status-summary"),
    feedback: document.getElementById("admin-feedback"),
    adminGrid: document.getElementById("admin-grid"),
    markCurrentFeatured: document.getElementById("mark-current-featured"),
    unmarkCurrentFeatured: document.getElementById("unmark-current-featured"),
    resetFeatured: document.getElementById("reset-featured"),
    resetReviews: document.getElementById("reset-reviews"),
    copyOverrides: document.getElementById("copy-overrides"),
    publishOwner: document.getElementById("publish-owner"),
    publishRepo: document.getElementById("publish-repo"),
    publishBranch: document.getElementById("publish-branch"),
    publishToken: document.getElementById("publish-token"),
    publishMessage: document.getElementById("publish-message"),
    reloadPublished: document.getElementById("reload-published"),
    publishOverrides: document.getElementById("publish-overrides"),
    publishFeedback: document.getElementById("publish-feedback"),
    confirmDialog: document.getElementById("confirm-dialog"),
    confirmTitle: document.getElementById("confirm-title"),
    confirmMessage: document.getElementById("confirm-message"),
    confirmAccept: document.getElementById("confirm-accept"),
    year: document.getElementById("year")
  };

  const categories = ["全部", ...getCategories()];

  const state = {
    keyword: "",
    category: "全部",
    overridesOnly: false
  };

  function getResources() {
    return getAdminResources();
  }

  function setPublishFeedback(message) {
    if (elements.publishFeedback) {
      elements.publishFeedback.textContent = message;
    }
  }

  function populatePublishSettings() {
    const settings = getPublishSettings();
    elements.publishOwner.value = settings.owner || "";
    elements.publishRepo.value = settings.repo || "";
    elements.publishBranch.value = settings.branch || "main";
    elements.publishMessage.value = "Update admin overrides";
  }

  function persistPublishSettingsFromForm() {
    return savePublishSettings({
      owner: elements.publishOwner.value,
      repo: elements.publishRepo.value,
      branch: elements.publishBranch.value
    });
  }

  function matchKeyword(item, keyword) {
    if (!keyword) return true;

    const plain = keyword.toLowerCase();
    const target = [item.name, item.description, item.category, ...(item.tags || [])].join(" ").toLowerCase();
    return target.includes(plain);
  }

  function getFilteredResources() {
    return getResources().filter((item) => {
      const hitKeyword = matchKeyword(item, state.keyword);
      const hitCategory = state.category === "全部" ? true : item.category === state.category;
      const hitOverride = state.overridesOnly ? item.hasFeaturedOverride : true;
      return hitKeyword && hitCategory && hitOverride;
    });
  }

  function getScopeLabel() {
    if (state.category !== "全部" && state.keyword) {
      return `当前类别 ${state.category} 的搜索结果`;
    }

    if (state.category !== "全部") {
      return `当前类别 ${state.category}`;
    }

    if (state.keyword) {
      return "当前搜索结果";
    }

    return "当前结果";
  }

  function setFeedback(message) {
    elements.feedback.textContent = message;
  }

  function openConfirmDialog({ title, message, confirmLabel }) {
    if (!elements.confirmDialog || typeof elements.confirmDialog.showModal !== "function") {
      return Promise.resolve(window.confirm(`${title}\n\n${message}`));
    }

    elements.confirmTitle.textContent = title;
    elements.confirmMessage.textContent = message;
    elements.confirmAccept.textContent = confirmLabel;
    elements.confirmDialog.showModal();

    return new Promise((resolve) => {
      const handleClose = () => {
        elements.confirmDialog.removeEventListener("close", handleClose);
        resolve(elements.confirmDialog.returnValue === "confirm");
      };

      elements.confirmDialog.addEventListener("close", handleClose);
    });
  }

  function renderCategoryChips() {
    elements.categoryChips.innerHTML = categories
      .map(
        (category) => `
          <button class="chip ${state.category === category ? "active" : ""}" type="button" data-category="${category}">
            ${category === "全部" ? "全部" : (categoryIcons[category] || "") + " " + category}
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

  function renderSummary() {
    const resources = getResources();
    const overrides = getFeaturedOverrides();
    const reviewOverrides = getReviewOverrides();
    const featuredCount = resources.filter((item) => item.featured).length;
    const featuredOverrideCount = Object.keys(overrides).length;
    const reviewOverrideCount = Object.keys(reviewOverrides).length;
    const filtered = getFilteredResources();
    const scopeLabel = getScopeLabel();
    const statusLabel = featuredOverrideCount > 0 || reviewOverrideCount > 0 ? "已启用本地覆盖" : "当前使用默认配置";

    elements.statusSummary.textContent = `${statusLabel} · ${featuredCount} 个当前精选 · ${featuredOverrideCount} 条精选覆盖 / ${reviewOverrideCount} 条短评覆盖`;
    elements.scopeSummary.textContent = `${scopeLabel}中共有 ${filtered.length} 个项目，批量操作会先弹出确认框。`;
    elements.markCurrentFeatured.textContent = `${scopeLabel}一键全部精选`;
    elements.unmarkCurrentFeatured.textContent = `${scopeLabel}一键全部取消精选`;
    elements.markCurrentFeatured.disabled = filtered.length === 0;
    elements.unmarkCurrentFeatured.disabled = filtered.length === 0;
  }

  function renderGrid() {
    const filtered = getFilteredResources();
    elements.resultSummary.textContent = `共 ${filtered.length} 条结果`;

    if (filtered.length === 0) {
      elements.adminGrid.innerHTML = '<div class="empty-state">当前没有匹配项目。你可以清空筛选或取消“只看本地改动”。</div>';
      return;
    }

    elements.adminGrid.innerHTML = filtered
      .map(
        (item) => `
          <article class="admin-card ${item.featured ? "is-featured-card" : ""}">
            <div class="card-category-bar" data-cat="${item.category}"></div>
            <div class="admin-card-top">
              <div class="card-head">
                <span class="pill" data-cat="${item.category}">${categoryIcons[item.category] || ""} ${item.category}</span>
                <span class="pill ${item.featured ? "is-featured" : ""}">${item.featured ? "当前精选" : item.sourceType}</span>
              </div>
              <button
                type="button"
                class="admin-toggle-btn ${item.featured ? "is-danger" : ""}"
                data-resource-id="${item.id}"
                data-next-featured="${item.featured ? "false" : "true"}"
                data-resource-name="${item.name}"
              >
                ${item.featured ? "取消精选" : "设为精选"}
              </button>
            </div>
            <h3>${item.name}</h3>
            <p class="card-copy">${item.description}</p>
            <div class="admin-state-row">
              <span class="tag">默认：${item.defaultFeatured ? "精选" : "非精选"}</span>
              ${item.hasFeaturedOverride ? '<span class="tag">已覆盖</span>' : '<span class="tag">未覆盖</span>'}
              ${item.hasAdminReviewOverride ? '<span class="tag">短评已覆盖</span>' : '<span class="tag">短评默认</span>'}
              <span class="tag">${item.sourceType}</span>
            </div>
            <label class="admin-review-field" for="review-${item.id}">
              <span>管理员短评</span>
              <textarea id="review-${item.id}" data-review-id="${item.id}" rows="3" placeholder="写一句你对这个项目的真实看法，前台会以小标签形式附加显示。">${item.adminReview || ""}</textarea>
            </label>
            <div class="admin-inline-actions">
              <button type="button" class="text-btn admin-save-review" data-review-id="${item.id}" data-resource-name="${item.name}">保存短评</button>
              <button type="button" class="text-btn admin-clear-review" data-review-id="${item.id}" data-resource-name="${item.name}">恢复默认介绍</button>
            </div>
            <div class="entry-meta">
              ${(item.tags || []).slice(0, 4).map((tag) => `<span class="tag">${tag}</span>`).join("")}
            </div>
            <div class="resource-footer">
              <span>${item.score}</span>
              <a class="text-link" href="${item.url}" target="_blank" rel="noreferrer">打开项目 ↗</a>
            </div>
          </article>
        `
      )
      .join("");

    elements.adminGrid.querySelectorAll(".admin-toggle-btn[data-resource-id]").forEach((button) => {
      button.addEventListener("click", async () => {
        const resourceId = button.dataset.resourceId || "";
        const resourceName = button.dataset.resourceName || "该项目";
        const nextFeatured = button.dataset.nextFeatured === "true";

        const confirmed = await openConfirmDialog({
          title: nextFeatured ? "确认加入精选" : "确认取消精选",
          message: nextFeatured
            ? `确定要把「${resourceName}」加入编辑精选吗？首页和资源页会立即更新。`
            : `确定要把「${resourceName}」移出编辑精选吗？首页和资源页会立即更新。`,
          confirmLabel: nextFeatured ? "确认加入" : "确认取消"
        });

        if (!confirmed) {
          setFeedback(`已取消对「${resourceName}」的精选状态修改。`);
          return;
        }

        updateFeaturedOverride(resourceId, nextFeatured);
        setFeedback(nextFeatured ? `已将「${resourceName}」加入编辑精选。` : `已将「${resourceName}」移出编辑精选。`);
        renderAll();
      });
    });

    elements.adminGrid.querySelectorAll(".admin-save-review[data-review-id]").forEach((button) => {
      button.addEventListener("click", async () => {
        const reviewId = button.dataset.reviewId || "";
        const resourceName = button.dataset.resourceName || "该项目";
        const textarea = elements.adminGrid.querySelector(`textarea[data-review-id="${reviewId}"]`);
        const nextReview = textarea instanceof HTMLTextAreaElement ? textarea.value.trim() : "";

        const confirmed = await openConfirmDialog({
          title: "确认保存管理员短评",
          message: `确定要保存「${resourceName}」的管理员短评吗？前台会以小标签形式附加显示。`,
          confirmLabel: "确认保存"
        });

        if (!confirmed) {
          setFeedback(`已取消保存「${resourceName}」的管理员短评。`);
          return;
        }

        updateAdminReviewOverride(reviewId, nextReview);
        setFeedback(nextReview ? `已保存「${resourceName}」的管理员短评。` : `已将「${resourceName}」恢复为默认项目介绍。`);
        renderAll();
      });
    });

    elements.adminGrid.querySelectorAll(".admin-clear-review[data-review-id]").forEach((button) => {
      button.addEventListener("click", async () => {
        const reviewId = button.dataset.reviewId || "";
        const resourceName = button.dataset.resourceName || "该项目";

        const confirmed = await openConfirmDialog({
          title: "确认恢复默认介绍",
          message: `确定要清空「${resourceName}」的管理员短评，并恢复为默认项目介绍吗？`,
          confirmLabel: "确认恢复"
        });

        if (!confirmed) {
          setFeedback(`已取消恢复「${resourceName}」的默认介绍。`);
          return;
        }

        updateAdminReviewOverride(reviewId, "");
        setFeedback(`已将「${resourceName}」恢复为默认项目介绍。`);
        renderAll();
      });
    });
  }

  async function copyOverrides() {
    const text = exportFeaturedOverrides();

    try {
      await navigator.clipboard.writeText(text);
      setFeedback("已复制当前本地覆盖 JSON，可用于手动备份或跨设备同步。");
    } catch {
      setFeedback("复制失败，请检查浏览器剪贴板权限。");
    }
  }

  async function applyBatchFeatured(featured) {
    const scopedResources = getFilteredResources();
    const scopeLabel = getScopeLabel();

    if (scopedResources.length === 0) {
      setFeedback("当前没有可批量处理的项目。");
      return;
    }

    const confirmed = await openConfirmDialog({
      title: featured ? "确认批量加入精选" : "确认批量取消精选",
      message: featured
        ? `确定要把 ${scopeLabel}中的 ${scopedResources.length} 个项目全部设为编辑精选吗？`
        : `确定要把 ${scopeLabel}中的 ${scopedResources.length} 个项目全部取消编辑精选吗？`,
      confirmLabel: featured ? "确认全部精选" : "确认全部取消"
    });

    if (!confirmed) {
      setFeedback(`已取消对${scopeLabel}的批量操作。`);
      return;
    }

    setFeaturedOverridesForIds(
      scopedResources.map((item) => item.id),
      featured
    );

    setFeedback(
      featured
        ? `已将 ${scopeLabel}中的 ${scopedResources.length} 个项目全部设为编辑精选。`
        : `已将 ${scopeLabel}中的 ${scopedResources.length} 个项目全部取消编辑精选。`
    );

    renderAll();
  }

  function bindEvents() {
    elements.searchInput.addEventListener("input", (event) => {
      state.keyword = event.target.value.trim();
      renderAll();
    });

    elements.showOverrides.addEventListener("change", (event) => {
      state.overridesOnly = Boolean(event.target.checked);
      renderAll();
    });

    elements.markCurrentFeatured.addEventListener("click", () => {
      applyBatchFeatured(true);
    });

    elements.unmarkCurrentFeatured.addEventListener("click", () => {
      applyBatchFeatured(false);
    });

    elements.resetFeatured.addEventListener("click", async () => {
      const confirmed = await openConfirmDialog({
        title: "确认恢复默认精选",
        message: "确定要清空所有本地覆盖并恢复到 docs/data.js 中的默认精选状态吗？",
        confirmLabel: "确认恢复"
      });

      if (!confirmed) {
        setFeedback("已取消恢复默认精选。");
        return;
      }

      clearFeaturedOverrides();
      setFeedback("已恢复默认精选配置。");
      renderAll();
    });

    elements.resetReviews.addEventListener("click", async () => {
      const confirmed = await openConfirmDialog({
        title: "确认清空全部短评覆盖",
        message: "确定要清空所有管理员短评覆盖，并恢复前台默认项目介绍吗？",
        confirmLabel: "确认清空"
      });

      if (!confirmed) {
        setFeedback("已取消清空全部短评覆盖。");
        return;
      }

      clearAdminReviewOverrides();
      setFeedback("已清空全部管理员短评覆盖。");
      renderAll();
    });

    elements.copyOverrides.addEventListener("click", () => {
      copyOverrides();
    });

    elements.reloadPublished.addEventListener("click", async () => {
      await loadPublishedOverrides(true);
      setFeedback("已重新读取已发布配置，并保留当前本地草稿。");
      setPublishFeedback("已从 docs/admin-overrides.json 重新加载公开配置。");
      renderAll();
    });

    elements.publishOverrides.addEventListener("click", async () => {
      const settings = persistPublishSettingsFromForm();
      const token = elements.publishToken.value.trim();

      const confirmed = await openConfirmDialog({
        title: "确认发布后台配置",
        message: "确定要把当前草稿写入 docs/admin-overrides.json 吗？发布后所有访客刷新页面都能看到。",
        confirmLabel: "确认发布"
      });

      if (!confirmed) {
        setPublishFeedback("已取消发布到 GitHub。");
        return;
      }

      try {
        const result = await publishOverridesToGitHub({
          token,
          owner: settings.owner,
          repo: settings.repo,
          branch: settings.branch,
          message: elements.publishMessage.value.trim() || "Update admin overrides"
        });

        elements.publishToken.value = "";
        setFeedback("已将当前草稿发布为公开配置。");
        setPublishFeedback(`发布成功：${result.commitSha || "已创建提交"}`);
        renderAll();
      } catch (error) {
        setPublishFeedback(error instanceof Error ? error.message : "发布失败。");
      }
    });
  }

  function renderYear() {
    elements.year.textContent = String(new Date().getFullYear());
  }

  function renderAll() {
    elements.searchInput.value = state.keyword;
    elements.showOverrides.checked = state.overridesOnly;
    renderCategoryChips();
    renderSummary();
    renderGrid();
  }

  async function init() {
    await loadPublishedOverrides();
    bindEvents();
    populatePublishSettings();
    renderAll();
    renderYear();
    setFeedback("你可以先切换分类，再执行当前视图范围的一键精选或一键取消精选。");
    setPublishFeedback("发布完成后，所有访客刷新页面即可看到新的精选与短评。");
  }

  init();
})();
