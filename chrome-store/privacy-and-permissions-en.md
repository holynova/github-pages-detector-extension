# Privacy and Permissions - English

## Single Purpose
GitHub Pages Detector helps users detect whether the current GitHub repository has GitHub Pages enabled, then open or copy the detected Pages URL.

## Permission Justifications

### `storage`
Used to save an optional GitHub token in Chrome sync storage. The token is only used when the user wants more accurate GitHub Pages API checks for private repositories.

### Host permission: `https://github.com/*`
Used to run the content script on GitHub repository pages and display the inline GitHub Pages status.

### Host permission: `https://api.github.com/*`
Used to call the GitHub Pages API endpoint for the repository currently being viewed.

### Host permission: `https://*.github.io/*`
Used to verify inferred GitHub Pages URLs when the API cannot provide a definitive result.

## Data Collection Disclosure
The extension does not collect, sell, or share user data for advertising or analytics.

Data handled by the extension:
- Current GitHub repository URL, used locally to identify owner and repository name.
- Optional GitHub token, stored in Chrome sync storage only if the user enters one.
- GitHub API responses and inferred Pages URL responses, used only to display the Pages detection status.

## Remote Code
No remote code is used. All extension JavaScript is packaged with the extension.

## Limited Use Statement
The use of information received from Google APIs will adhere to the Chrome Web Store User Data Policy, including the Limited Use requirements.

## Recommended Dashboard Privacy Answers
- Collects personally identifiable information: No
- Collects health information: No
- Collects financial and payment information: No
- Collects authentication information: Yes, only if the user voluntarily saves a GitHub token for private repository checks
- Collects personal communications: No
- Collects location: No
- Collects web history: No, except reading the active GitHub repository URL required for the extension's visible feature
- Uses data for advertising: No
- Sells data: No
