const DEFAULT_HEADERS = {
  Accept: "application/vnd.github+json",
  "X-GitHub-Api-Version": "2022-11-28"
};

const GITHUB_404_MARKERS = [
  "There isn't a GitHub Pages site here.",
  "For root URLs",
  "GitHub Pages | 404"
];

chrome.runtime.onInstalled.addListener(() => {
  chrome.action.setBadgeText({ text: "" });
  chrome.action.setTitle({ title: "GitHub Pages Detector" });
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type !== "CHECK_REPO_PAGES") {
    return false;
  }

  const tabId = sender.tab?.id;
  checkRepoPages(message.owner, message.repo)
    .then((result) => {
      if (tabId !== undefined) {
        updateActionState(tabId, result);
      }
      sendResponse(result);
    })
    .catch((error) => {
      const result = {
        hasPages: false,
        pagesUrl: null,
        source: "error",
        error: error instanceof Error ? error.message : String(error)
      };
      if (tabId !== undefined) {
        updateActionState(tabId, result);
      }
      sendResponse(result);
    });

  return true;
});

async function checkRepoPages(owner, repo) {
  assertRepoParts(owner, repo);

  const apiResult = await checkViaGitHubApi(owner, repo);
  if (apiResult.hasPages || apiResult.definitive) {
    return apiResult;
  }

  return checkViaInferredUrl(owner, repo, apiResult);
}

function assertRepoParts(owner, repo) {
  const repoPart = /^[A-Za-z0-9_.-]+$/;
  if (!repoPart.test(owner) || !repoPart.test(repo)) {
    throw new Error("Invalid GitHub repository path.");
  }
}

async function checkViaGitHubApi(owner, repo) {
  const token = await getGitHubToken();
  const headers = { ...DEFAULT_HEADERS };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/pages`, {
    headers,
    credentials: "omit"
  });

  if (response.ok) {
    const payload = await response.json();
    return {
      hasPages: true,
      pagesUrl: normalizePagesUrl(payload.html_url || inferPagesUrl(owner, repo)),
      source: "api",
      status: response.status
    };
  }

  if (response.status === 404) {
    return {
      hasPages: false,
      pagesUrl: null,
      source: "api",
      status: response.status,
      definitive: Boolean(token)
    };
  }

  if (response.status === 401 || response.status === 403) {
    return {
      hasPages: false,
      pagesUrl: null,
      source: "api",
      status: response.status,
      definitive: false
    };
  }

  return {
    hasPages: false,
    pagesUrl: null,
    source: "api",
    status: response.status,
    definitive: false
  };
}

async function checkViaInferredUrl(owner, repo, previousResult) {
  const pagesUrl = inferPagesUrl(owner, repo);

  try {
    const response = await fetch(pagesUrl, {
      method: "GET",
      credentials: "include",
      redirect: "follow"
    });
    const contentType = response.headers.get("content-type") || "";
    const text = contentType.includes("text/html") ? await response.text() : "";
    const isGitHub404 = response.status === 404 && GITHUB_404_MARKERS.some((marker) => text.includes(marker));

    return {
      hasPages: response.ok && !isGitHub404,
      pagesUrl: response.ok && !isGitHub404 ? normalizePagesUrl(pagesUrl) : null,
      source: "inferred-url",
      status: response.status,
      apiStatus: previousResult?.status
    };
  } catch (error) {
    return {
      hasPages: false,
      pagesUrl: null,
      source: "inferred-url",
      error: error instanceof Error ? error.message : String(error),
      apiStatus: previousResult?.status
    };
  }
}

function inferPagesUrl(owner, repo) {
  if (repo.toLowerCase() === `${owner.toLowerCase()}.github.io`) {
    return `https://${owner}.github.io/`;
  }

  return `https://${owner}.github.io/${repo}/`;
}

function normalizePagesUrl(url) {
  return url.endsWith("/") ? url : `${url}/`;
}

async function getGitHubToken() {
  const { githubToken } = await chrome.storage.sync.get({ githubToken: "" });
  return githubToken.trim();
}

function updateActionState(tabId, result) {
  if (result.hasPages) {
    chrome.action.setBadgeText({ tabId, text: "ON" });
    chrome.action.setBadgeBackgroundColor({ tabId, color: "#2da44e" });
    chrome.action.setTitle({ tabId, title: `GitHub Pages available: ${result.pagesUrl}` });
    chrome.action.setIcon({ tabId, path: iconPaths("active") });
    return;
  }

  if (result.source === "error") {
    chrome.action.setBadgeText({ tabId, text: "!" });
    chrome.action.setBadgeBackgroundColor({ tabId, color: "#bf8700" });
    chrome.action.setTitle({ tabId, title: "GitHub Pages check failed" });
    chrome.action.setIcon({ tabId, path: iconPaths("warning") });
    return;
  }

  chrome.action.setBadgeText({ tabId, text: "" });
  chrome.action.setTitle({ tabId, title: "No GitHub Pages detected" });
  chrome.action.setIcon({ tabId, path: iconPaths("default") });
}

function iconPaths(state) {
  return {
    16: `icons/icon-${state}-16.png`,
    32: `icons/icon-${state}-32.png`,
    48: `icons/icon-${state}-48.png`,
    128: `icons/icon-${state}-128.png`
  };
}
