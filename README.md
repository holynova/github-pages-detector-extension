# GitHub Pages Detector

Chrome extension that detects whether the current GitHub repository has GitHub Pages enabled.

## Behavior

- Runs on GitHub repository pages.
- Checks `GET https://api.github.com/repos/{owner}/{repo}/pages` first.
- If the API is unavailable, rate-limited, or unauthenticated, checks the inferred Pages URL:
  - `https://owner.github.io/repo/`
  - `https://owner.github.io/` for repositories named `owner.github.io`
- Adds a `GitHub Pages` button beside the repository title when Pages exists.
- Updates the extension toolbar icon state with a green `ON` badge when Pages exists.

## Private repositories

Public repositories work without setup. For private repositories, open the extension options page and save a GitHub token with repository metadata access. Without a token, GitHub's Pages API usually cannot confirm private repository Pages configuration.

## Load in Chrome

1. Open `chrome://extensions`.
2. Enable Developer mode.
3. Click `Load unpacked`.
4. Select this directory: `/Users/sym/code/github-pages-detector-extension`.

## Notes

The inferred URL check fetches the generated Pages URL and treats GitHub's standard Pages 404 page as "not configured".
