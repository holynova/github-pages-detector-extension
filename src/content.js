const STATUS_ID = "github-pages-detector-status";
const KNOWN_NON_REPO_PATHS = new Set([
  "about",
  "account",
  "codespaces",
  "collections",
  "dashboard",
  "events",
  "explore",
  "features",
  "gist",
  "issues",
  "login",
  "marketplace",
  "new",
  "notifications",
  "orgs",
  "pricing",
  "pulls",
  "search",
  "settings",
  "sponsors",
  "topics",
  "trending"
]);

let lastRepoKey = "";
let currentRequestId = 0;
const repoCache = new Map();
const pendingRepoKeys = new Set();

run();
installNavigationWatcher();

function run() {
  const repo = getRepoFromLocation();
  if (!repo) {
    removeStatus();
    lastRepoKey = "";
    return;
  }

  const repoKey = `${repo.owner}/${repo.repo}`;
  if (repoKey === lastRepoKey) {
    const cachedResult = repoCache.get(repoKey);
    if (cachedResult && !document.getElementById(STATUS_ID)) {
      renderStatus(cachedResult);
    } else if (pendingRepoKeys.has(repoKey) && !document.getElementById(STATUS_ID)) {
      renderStatus({ state: "checking" });
    }
    return;
  }

  lastRepoKey = repoKey;
  removeStatus();

  const cachedResult = repoCache.get(repoKey);
  if (cachedResult) {
    renderStatus(cachedResult);
    return;
  }

  if (pendingRepoKeys.has(repoKey)) {
    renderStatus({ state: "checking" });
    return;
  }

  renderStatus({ state: "checking" });
  checkRepo(repo);
}

function getRepoFromLocation() {
  if (location.hostname !== "github.com") {
    return null;
  }

  const [owner, repo] = location.pathname.split("/").filter(Boolean);
  if (!owner || !repo || KNOWN_NON_REPO_PATHS.has(owner.toLowerCase())) {
    return null;
  }

  if (!/^[A-Za-z0-9_.-]+$/.test(owner) || !/^[A-Za-z0-9_.-]+$/.test(repo)) {
    return null;
  }

  return { owner, repo };
}

async function checkRepo(repo) {
  const requestId = ++currentRequestId;
  const repoKey = `${repo.owner}/${repo.repo}`;
  pendingRepoKeys.add(repoKey);

  try {
    const result = await chrome.runtime.sendMessage({
      type: "CHECK_REPO_PAGES",
      owner: repo.owner,
      repo: repo.repo
    });

    pendingRepoKeys.delete(repoKey);
    if (requestId !== currentRequestId) {
      return;
    }

    const normalizedResult = normalizeResult(result);
    repoCache.set(repoKey, normalizedResult);
    renderStatus(normalizedResult);
  } catch (error) {
    pendingRepoKeys.delete(repoKey);
    const errorResult = {
      state: "error",
      hasPages: false,
      pagesUrl: null,
      label: "Pages check failed"
    };
    repoCache.set(repoKey, errorResult);
    renderStatus(errorResult);
    console.warn("[GitHub Pages Detector] Failed to check repository pages.", error);
  }
}

function normalizeResult(result) {
  if (result?.hasPages && result.pagesUrl) {
    return {
      ...result,
      state: "found",
      label: "GitHub Pages"
    };
  }

  if (result?.source === "error") {
    return {
      ...result,
      state: "error",
      label: "Pages check failed"
    };
  }

  return {
    ...(result || {}),
    state: "not-found",
    hasPages: false,
    pagesUrl: null,
    label: "No GitHub Pages"
  };
}

function renderStatus(result) {
  removeStatus();

  const titleArea = findTitleArea();
  if (!titleArea) {
    return;
  }

  const status = document.createElement("span");
  status.id = STATUS_ID;
  status.className = `github-pages-detector-status github-pages-detector-status-${result.state}`;

  if (result.state === "checking") {
    status.append(createStatusLabel("Checking Pages"));
    titleArea.append(status);
    return;
  }

  if (result.state === "found") {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "btn btn-sm github-pages-detector-open";
    button.textContent = "GitHub Pages";
    button.title = `Open ${result.pagesUrl}`;
    button.addEventListener("click", () => {
      window.open(result.pagesUrl, "_blank", "noopener,noreferrer");
    });

    const copyButton = document.createElement("button");
    copyButton.type = "button";
    copyButton.className = "btn btn-sm github-pages-detector-copy";
    copyButton.title = `Copy ${result.pagesUrl}`;
    copyButton.setAttribute("aria-label", "Copy GitHub Pages URL");
    copyButton.append(createCopyIcon());
    copyButton.addEventListener("click", async () => {
      await copyText(result.pagesUrl);
      copyButton.classList.add("github-pages-detector-copy-done");
      copyButton.title = "Copied";
      setTimeout(() => {
        copyButton.classList.remove("github-pages-detector-copy-done");
        copyButton.title = `Copy ${result.pagesUrl}`;
      }, 1400);
    });

    status.append(button, copyButton);
    titleArea.append(status);
    return;
  }

  status.append(createStatusLabel(result.label || "No GitHub Pages"));
  titleArea.append(status);
}

function findTitleArea() {
  return (
    document.querySelector("strong[itemprop='name']")?.closest(".d-flex") ||
    document.querySelector("[data-testid='repository-container-header'] .d-flex") ||
    document.querySelector("#repository-container-header .d-flex") ||
    document.querySelector("h1")?.parentElement
  );
}

function createStatusLabel(text) {
  const label = document.createElement("span");
  label.className = "github-pages-detector-label";
  label.textContent = text;
  return label;
}

function createCopyIcon() {
  const icon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  icon.setAttribute("viewBox", "0 0 16 16");
  icon.setAttribute("width", "16");
  icon.setAttribute("height", "16");
  icon.setAttribute("aria-hidden", "true");

  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute("fill", "currentColor");
  path.setAttribute(
    "d",
    "M0 6.75C0 5.784.784 5 1.75 5h1.5a.75.75 0 0 1 0 1.5h-1.5a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-1.5a.75.75 0 0 1 1.5 0v1.5A1.75 1.75 0 0 1 9.25 16h-7.5A1.75 1.75 0 0 1 0 14.25Zm5-5C5 .784 5.784 0 6.75 0h7.5C15.216 0 16 .784 16 1.75v7.5A1.75 1.75 0 0 1 14.25 11h-7.5A1.75 1.75 0 0 1 5 9.25Zm1.75-.25a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-7.5a.25.25 0 0 0-.25-.25Z"
  );

  icon.append(path);
  return icon;
}

async function copyText(text) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.left = "-9999px";
  document.body.append(textarea);
  textarea.select();
  document.execCommand("copy");
  textarea.remove();
}

function removeStatus() {
  document.getElementById(STATUS_ID)?.remove();
}

function installNavigationWatcher() {
  const rerun = debounce(run, 250);
  const originalPushState = history.pushState;
  const originalReplaceState = history.replaceState;

  history.pushState = function pushState(...args) {
    const result = originalPushState.apply(this, args);
    rerun();
    return result;
  };

  history.replaceState = function replaceState(...args) {
    const result = originalReplaceState.apply(this, args);
    rerun();
    return result;
  };

  window.addEventListener("popstate", rerun);

  const observer = new MutationObserver(rerun);
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true
  });
}

function debounce(callback, delay) {
  let timeoutId;
  return () => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(callback, delay);
  };
}
