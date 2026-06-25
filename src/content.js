const BUTTON_ID = "github-pages-detector-button";
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
    removeButton();
    lastRepoKey = "";
    return;
  }

  const repoKey = `${repo.owner}/${repo.repo}`;
  if (repoKey === lastRepoKey) {
    const cachedResult = repoCache.get(repoKey);
    if (cachedResult?.hasPages && cachedResult.pagesUrl && !document.getElementById(BUTTON_ID)) {
      injectButton(cachedResult.pagesUrl);
    }
    return;
  }

  lastRepoKey = repoKey;
  removeButton();

  const cachedResult = repoCache.get(repoKey);
  if (cachedResult?.hasPages && cachedResult.pagesUrl) {
    injectButton(cachedResult.pagesUrl);
    return;
  }

  if (cachedResult && !cachedResult.hasPages) {
    return;
  }

  if (pendingRepoKeys.has(repoKey)) {
    return;
  }

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
    if (requestId !== currentRequestId || !result?.hasPages || !result.pagesUrl) {
      repoCache.set(repoKey, result || { hasPages: false });
      return;
    }

    repoCache.set(repoKey, result);
    injectButton(result.pagesUrl);
  } catch (error) {
    pendingRepoKeys.delete(repoKey);
    repoCache.delete(repoKey);
    console.warn("[GitHub Pages Detector] Failed to check repository pages.", error);
  }
}

function injectButton(pagesUrl) {
  removeButton();

  const titleArea = findTitleArea();
  if (!titleArea) {
    return;
  }

  const button = document.createElement("button");
  button.id = BUTTON_ID;
  button.type = "button";
  button.className = "btn btn-sm github-pages-detector-button";
  button.textContent = "GitHub Pages";
  button.title = `Open ${pagesUrl}`;
  button.addEventListener("click", () => {
    window.open(pagesUrl, "_blank", "noopener,noreferrer");
  });

  titleArea.append(button);
}

function findTitleArea() {
  return (
    document.querySelector("strong[itemprop='name']")?.closest(".d-flex") ||
    document.querySelector("[data-testid='repository-container-header'] .d-flex") ||
    document.querySelector("#repository-container-header .d-flex") ||
    document.querySelector("h1")?.parentElement
  );
}

function removeButton() {
  document.getElementById(BUTTON_ID)?.remove();
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
