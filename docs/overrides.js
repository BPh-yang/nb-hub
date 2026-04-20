(function initNbHubOverrides() {
  const data = window.nbHubData;

  if (!data || typeof data.getBaseResources !== "function") {
    return;
  }

  const PUBLISHED_OVERRIDES_PATH = "./admin-overrides.json";

  let publishedOverridesState = createEmptyOverrides();
  let workingOverridesState = createEmptyOverrides();
  let publishedOverridesLoaded = false;

  function createEmptyOverrides() {
    return {
      featured: {},
      reviews: {},
      updatedAt: null
    };
  }

  function cloneOverridesState(input) {
    const safeInput = sanitizePublishedOverrides(input);
    return {
      featured: { ...safeInput.featured },
      reviews: { ...safeInput.reviews },
      updatedAt: safeInput.updatedAt
    };
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
      return createEmptyOverrides();
    }

    return {
      featured: sanitizeFeaturedOverrides(input.featured || {}),
      reviews: sanitizeReviewOverrides(input.reviews || {}),
      updatedAt: typeof input.updatedAt === "string" ? input.updatedAt : null
    };
  }

  function setPublishedOverrides(input) {
    publishedOverridesState = cloneOverridesState(input);
    workingOverridesState = cloneOverridesState(publishedOverridesState);
    publishedOverridesLoaded = true;
    return getPublishedOverrides();
  }

  function setWorkingOverrides(input) {
    workingOverridesState = cloneOverridesState(input);
    return getAdminResources();
  }

  function shallowEqualObjects(left, right) {
    const leftKeys = Object.keys(left);
    const rightKeys = Object.keys(right);

    if (leftKeys.length !== rightKeys.length) {
      return false;
    }

    return leftKeys.every((key) => Object.hasOwn(right, key) && left[key] === right[key]);
  }

  function hasPendingOverrideChanges() {
    return !shallowEqualObjects(workingOverridesState.featured, publishedOverridesState.featured)
      || !shallowEqualObjects(workingOverridesState.reviews, publishedOverridesState.reviews);
  }

  function getPublishedOverrides() {
    return cloneOverridesState(publishedOverridesState);
  }

  function getFeaturedOverrides() {
    return { ...workingOverridesState.featured };
  }

  function getReviewOverrides() {
    return { ...workingOverridesState.reviews };
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
        setPublishedOverrides(createEmptyOverrides());
      } else {
        setPublishedOverrides(await response.json());
      }
    } catch {
      setPublishedOverrides(createEmptyOverrides());
    }

    return getPublishedOverrides();
  }

  function getPublishedResources() {
    return applyOverrides(data.getBaseResources(), publishedOverridesState.featured, publishedOverridesState.reviews);
  }

  function getAdminResources() {
    return applyOverrides(data.getBaseResources(), workingOverridesState.featured, workingOverridesState.reviews);
  }

  function getEffectiveResources() {
    return getAdminResources();
  }

  function updateFeaturedOverride(resourceId, featured) {
    const defaults = getDefaultMaps().featured;

    if (typeof defaults[resourceId] !== "boolean") {
      return getAdminResources();
    }

    const nextState = cloneOverridesState(workingOverridesState);

    if (featured === defaults[resourceId]) {
      delete nextState.featured[resourceId];
    } else {
      nextState.featured[resourceId] = featured;
    }

    return setWorkingOverrides(nextState);
  }

  function setFeaturedOverridesForIds(resourceIds, featured) {
    const defaults = getDefaultMaps().featured;
    const nextState = cloneOverridesState(workingOverridesState);

    resourceIds.forEach((resourceId) => {
      if (typeof defaults[resourceId] !== "boolean") {
        return;
      }

      if (featured === defaults[resourceId]) {
        delete nextState.featured[resourceId];
      } else {
        nextState.featured[resourceId] = featured;
      }
    });

    return setWorkingOverrides(nextState);
  }

  function clearFeaturedOverrides() {
    return setWorkingOverrides({
      ...workingOverridesState,
      featured: {}
    });
  }

  function updateAdminReviewOverride(resourceId, reviewText) {
    const defaults = getDefaultMaps().reviews;
    const normalizedReview = typeof reviewText === "string" ? reviewText.trim() : "";

    if (typeof defaults[resourceId] !== "string") {
      return getAdminResources();
    }

    const nextState = cloneOverridesState(workingOverridesState);

    if (!normalizedReview || normalizedReview === defaults[resourceId]) {
      delete nextState.reviews[resourceId];
    } else {
      nextState.reviews[resourceId] = normalizedReview;
    }

    return setWorkingOverrides(nextState);
  }

  function clearAdminReviewOverrides() {
    return setWorkingOverrides({
      ...workingOverridesState,
      reviews: {}
    });
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
      setWorkingOverrides(parsed);
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

  function inferGitHubRepo() {
    const host = window.location.hostname;
    const pathParts = window.location.pathname.split("/").filter(Boolean);

    if (host.endsWith("github.io") && pathParts.length > 0) {
      const owner = host.replace(".github.io", "");
      const repo = pathParts[0];
      return {
        owner,
        repo
      };
    }

    return null;
  }

  function inferPublishSettings() {
    const inferredRepo = inferGitHubRepo();

    if (!inferredRepo) {
      return {
        owner: "",
        repo: "",
        branch: "main"
      };
    }

    return {
      owner: inferredRepo.owner,
      repo: inferredRepo.repo,
      branch: "main"
    };
  }

  function getPublishSettings() {
    return inferPublishSettings();
  }

  function savePublishSettings(settings) {
    return sanitizePublishSettings(settings);
  }

  function encodeBase64Utf8(input) {
    const bytes = new TextEncoder().encode(input);
    let binary = "";

    bytes.forEach((byte) => {
      binary += String.fromCharCode(byte);
    });

    return btoa(binary);
  }

  async function publishOverridesToGitHub({ token, owner, repo, branch, message }) {
    if (!token || !owner || !repo || !branch) {
      throw new Error("缺少 GitHub 发布所需的 token / owner / repo / branch。");
    }

    if (publishedOverridesLoaded && !hasPendingOverrideChanges()) {
      return {
        payload: getPublishedOverrides(),
        commitSha: "",
        fileUrl: "",
        branch,
        skipped: true
      };
    }

    const payload = sanitizePublishedOverrides(buildPublishedOverridesPayload());
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
    setPublishedOverrides(payload);

    return {
      payload,
      commitSha: publishJson.commit?.sha || "",
      fileUrl: publishJson.content?.html_url || "",
      branch,
      skipped: false
    };
  }

  Object.assign(window.nbHubData, {
    loadPublishedOverrides,
    getPublishedOverrides,
    getPublishedResources,
    getAdminResources,
    getEffectiveResources,
    getFeaturedOverrides,
    getReviewOverrides,
    updateFeaturedOverride,
    setFeaturedOverridesForIds,
    clearFeaturedOverrides,
    updateAdminReviewOverride,
    clearAdminReviewOverrides,
    exportFeaturedOverrides,
    importFeaturedOverrides,
    getPublishSettings,
    savePublishSettings,
    publishOverridesToGitHub,
    hasPendingOverrideChanges
  });
})();
