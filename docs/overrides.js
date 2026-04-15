(function initNbHubOverrides() {
  const data = window.nbHubData;

  if (!data || typeof data.getBaseResources !== "function") {
    return;
  }

  const FEATURED_STORAGE_KEY = "nbHubFeaturedOverrides";
  const REVIEW_STORAGE_KEY = "nbHubAdminReviewOverrides";
  const PUBLISH_SETTINGS_STORAGE_KEY = "nbHubPublishSettings";
  const PUBLISHED_OVERRIDES_PATH = "./admin-overrides.json";

  let publishedOverridesState = {
    featured: {},
    reviews: {},
    updatedAt: null
  };

  let publishedOverridesLoaded = false;

  function getStorage() {
    try {
      return window.localStorage;
    } catch {
      return null;
    }
  }

  function getDefaultMaps() {
    const baseResources = data.getBaseResources();
    return {
      featured: Object.fromEntries(baseResources.map((item) => [item.id, Boolean(item.featured)])),
      reviews: Object.fromEntries(baseResources.map((item) => [item.id, item.adminReview || ""]))
    };
  }

  function sanitizeFeaturedOverrides(input) {
    const defaults = getDefaultMaps().featured;

    if (!input || typeof input !== "object" || Array.isArray(input)) {
      return {};
    }

    return Object.fromEntries(
      Object.entries(input).filter(([key, value]) => Object.hasOwn(defaults, key) && typeof value === "boolean")
    );
  }

  function sanitizeReviewOverrides(input) {
    const defaults = getDefaultMaps().reviews;

    if (!input || typeof input !== "object" || Array.isArray(input)) {
      return {};
    }

    return Object.fromEntries(
      Object.entries(input).filter(([key, value]) => Object.hasOwn(defaults, key) && typeof value === "string")
    );
  }

  function sanitizePublishedOverrides(input) {
    if (!input || typeof input !== "object" || Array.isArray(input)) {
      return {
        featured: {},
        reviews: {},
        updatedAt: null
      };
    }

    return {
      featured: sanitizeFeaturedOverrides(input.featured || {}),
      reviews: sanitizeReviewOverrides(input.reviews || {}),
      updatedAt: typeof input.updatedAt === "string" ? input.updatedAt : null
    };
  }

  function readDraftOverrides(key, sanitize) {
    const storage = getStorage();

    if (!storage) {
      return {};
    }

    try {
      const raw = storage.getItem(key);
      if (!raw) {
        return {};
      }

      return sanitize(JSON.parse(raw));
    } catch {
      return {};
    }
  }

  function writeDraftOverrides(key, sanitize, input) {
    const storage = getStorage();

    if (!storage) {
      return;
    }

    const safeInput = sanitize(input);

    if (Object.keys(safeInput).length === 0) {
      storage.removeItem(key);
      return;
    }

    storage.setItem(key, JSON.stringify(safeInput));
  }

  function getFeaturedDraftOverrides() {
    return readDraftOverrides(FEATURED_STORAGE_KEY, sanitizeFeaturedOverrides);
  }

  function getReviewDraftOverrides() {
    return readDraftOverrides(REVIEW_STORAGE_KEY, sanitizeReviewOverrides);
  }

  function getPublishedOverrides() {
    return {
      featured: { ...publishedOverridesState.featured },
      reviews: { ...publishedOverridesState.reviews },
      updatedAt: publishedOverridesState.updatedAt
    };
  }

  function applyOverrides(baseResources, featuredOverrides, reviewOverrides) {
    return baseResources.map((item) => {
      const defaultFeatured = Boolean(item.featured);
      const defaultAdminReview = item.adminReview || "";
      const hasFeaturedOverride = Object.hasOwn(featuredOverrides, item.id);
      const hasReviewOverride = Object.hasOwn(reviewOverrides, item.id);

      return {
        ...item,
        defaultFeatured,
        defaultAdminReview,
        featured: hasFeaturedOverride ? featuredOverrides[item.id] : defaultFeatured,
        hasFeaturedOverride,
        adminReview: hasReviewOverride ? reviewOverrides[item.id] : defaultAdminReview,
        hasAdminReviewOverride: hasReviewOverride
      };
    });
  }

  async function loadPublishedOverrides(forceReload = false) {
    if (publishedOverridesLoaded && !forceReload) {
      return getPublishedOverrides();
    }

    try {
      const response = await fetch(`${PUBLISHED_OVERRIDES_PATH}?v=${Date.now()}`, { cache: "no-store" });

      if (!response.ok) {
        publishedOverridesState = sanitizePublishedOverrides({});
      } else {
        publishedOverridesState = sanitizePublishedOverrides(await response.json());
      }
    } catch {
      publishedOverridesState = sanitizePublishedOverrides({});
    }

    publishedOverridesLoaded = true;
    return getPublishedOverrides();
  }

  function getPublishedResources() {
    return applyOverrides(data.getBaseResources(), publishedOverridesState.featured, publishedOverridesState.reviews);
  }

  function getAdminResources() {
    return applyOverrides(getPublishedResources(), getFeaturedDraftOverrides(), getReviewDraftOverrides());
  }

  function getEffectiveResources() {
    return getPublishedResources();
  }

  function updateFeaturedOverride(resourceId, featured) {
    const draft = getFeaturedDraftOverrides();
    const publishedResource = getPublishedResources().find((item) => item.id === resourceId);

    if (!publishedResource) {
      return getAdminResources();
    }

    if (featured === publishedResource.featured) {
      delete draft[resourceId];
    } else {
      draft[resourceId] = featured;
    }

    writeDraftOverrides(FEATURED_STORAGE_KEY, sanitizeFeaturedOverrides, draft);
    return getAdminResources();
  }

  function setFeaturedOverridesForIds(resourceIds, featured) {
    const draft = getFeaturedDraftOverrides();
    const publishedResources = getPublishedResources();

    resourceIds.forEach((resourceId) => {
      const publishedResource = publishedResources.find((item) => item.id === resourceId);

      if (!publishedResource) {
        return;
      }

      if (featured === publishedResource.featured) {
        delete draft[resourceId];
      } else {
        draft[resourceId] = featured;
      }
    });

    writeDraftOverrides(FEATURED_STORAGE_KEY, sanitizeFeaturedOverrides, draft);
    return getAdminResources();
  }

  function clearFeaturedOverrides() {
    writeDraftOverrides(FEATURED_STORAGE_KEY, sanitizeFeaturedOverrides, {});
    return getAdminResources();
  }

  function updateAdminReviewOverride(resourceId, reviewText) {
    const draft = getReviewDraftOverrides();
    const publishedResource = getPublishedResources().find((item) => item.id === resourceId);

    if (!publishedResource) {
      return getAdminResources();
    }

    if (reviewText === publishedResource.adminReview) {
      delete draft[resourceId];
    } else {
      draft[resourceId] = reviewText;
    }

    writeDraftOverrides(REVIEW_STORAGE_KEY, sanitizeReviewOverrides, draft);
    return getAdminResources();
  }

  function clearAdminReviewOverrides() {
    writeDraftOverrides(REVIEW_STORAGE_KEY, sanitizeReviewOverrides, {});
    return getAdminResources();
  }

  function buildPublishedOverridesPayload() {
    const currentResources = getAdminResources();
    const defaults = getDefaultMaps();
    const featured = {};
    const reviews = {};

    currentResources.forEach((item) => {
      if (item.featured !== defaults.featured[item.id]) {
        featured[item.id] = item.featured;
      }

      if ((item.adminReview || "") !== defaults.reviews[item.id]) {
        reviews[item.id] = item.adminReview || "";
      }
    });

    return {
      featured,
      reviews,
      updatedAt: new Date().toISOString()
    };
  }

  function exportFeaturedOverrides() {
    return JSON.stringify(buildPublishedOverridesPayload(), null, 2);
  }

  function importFeaturedOverrides(rawText) {
    try {
      const parsed = JSON.parse(rawText);
      const normalized = sanitizePublishedOverrides(parsed);
      writeDraftOverrides(FEATURED_STORAGE_KEY, sanitizeFeaturedOverrides, normalized.featured);
      writeDraftOverrides(REVIEW_STORAGE_KEY, sanitizeReviewOverrides, normalized.reviews);
      return {
        ok: true,
        resources: getAdminResources()
      };
    } catch {
      return {
        ok: false,
        resources: getAdminResources()
      };
    }
  }

  function sanitizePublishSettings(input) {
    if (!input || typeof input !== "object" || Array.isArray(input)) {
      return {
        owner: "",
        repo: "",
        branch: "main"
      };
    }

    return {
      owner: typeof input.owner === "string" ? input.owner.trim() : "",
      repo: typeof input.repo === "string" ? input.repo.trim() : "",
      branch: typeof input.branch === "string" && input.branch.trim() ? input.branch.trim() : "main"
    };
  }

  function inferPublishSettings() {
    const inferredRepo = typeof data.inferGitHubRepo === "function" ? data.inferGitHubRepo() : null;

    if (!inferredRepo) {
      return {
        owner: "",
        repo: "",
        branch: "main"
      };
    }

    const match = inferredRepo.match(/^https:\/\/github\.com\/([^/]+)\/([^/]+)$/);

    return {
      owner: match?.[1] || "",
      repo: match?.[2] || "",
      branch: "main"
    };
  }

  function getPublishSettings() {
    const storage = getStorage();
    const inferred = inferPublishSettings();

    if (!storage) {
      return inferred;
    }

    try {
      const raw = storage.getItem(PUBLISH_SETTINGS_STORAGE_KEY);
      if (!raw) {
        return inferred;
      }

      return {
        ...inferred,
        ...sanitizePublishSettings(JSON.parse(raw))
      };
    } catch {
      return inferred;
    }
  }

  function savePublishSettings(settings) {
    const storage = getStorage();
    const safeSettings = sanitizePublishSettings(settings);

    if (!storage) {
      return safeSettings;
    }

    storage.setItem(PUBLISH_SETTINGS_STORAGE_KEY, JSON.stringify(safeSettings));
    return safeSettings;
  }

  function encodeBase64Utf8(input) {
    return btoa(unescape(encodeURIComponent(input)));
  }

  async function publishOverridesToGitHub({ token, owner, repo, branch, message }) {
    if (!token || !owner || !repo || !branch) {
      throw new Error("缺少 GitHub 发布所需的 token / owner / repo / branch。");
    }

    const payload = buildPublishedOverridesPayload();
    const path = "docs/admin-overrides.json";
    const endpoint = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
    const headers = {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28"
    };

    let sha;
    const currentResponse = await fetch(`${endpoint}?ref=${encodeURIComponent(branch)}`, {
      headers,
      cache: "no-store"
    });

    if (currentResponse.ok) {
      const currentJson = await currentResponse.json();
      sha = currentJson.sha;
    } else if (currentResponse.status !== 404) {
      throw new Error(`读取远端 admin-overrides.json 失败：${currentResponse.status}`);
    }

    const publishResponse = await fetch(endpoint, {
      method: "PUT",
      headers: {
        ...headers,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message: message || "Update admin overrides",
        content: encodeBase64Utf8(`${JSON.stringify(payload, null, 2)}\n`),
        branch,
        sha
      })
    });

    if (!publishResponse.ok) {
      const errorText = await publishResponse.text();
      throw new Error(`发布 admin-overrides.json 失败：${publishResponse.status} ${errorText}`);
    }

    const publishJson = await publishResponse.json();
    publishedOverridesState = sanitizePublishedOverrides(payload);
    publishedOverridesLoaded = true;
    clearFeaturedOverrides();
    clearAdminReviewOverrides();

    return {
      payload,
      commitSha: publishJson.commit?.sha || "",
      fileUrl: publishJson.content?.html_url || "",
      branch
    };
  }

  Object.assign(window.nbHubData, {
    loadPublishedOverrides,
    getPublishedOverrides,
    getPublishedResources,
    getAdminResources,
    getEffectiveResources,
    getFeaturedOverrides: getFeaturedDraftOverrides,
    getReviewOverrides: getReviewDraftOverrides,
    updateFeaturedOverride,
    setFeaturedOverridesForIds,
    clearFeaturedOverrides,
    updateAdminReviewOverride,
    clearAdminReviewOverrides,
    exportFeaturedOverrides,
    importFeaturedOverrides,
    getPublishSettings,
    savePublishSettings,
    publishOverridesToGitHub
  });
})();
