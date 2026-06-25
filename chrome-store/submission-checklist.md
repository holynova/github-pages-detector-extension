# Chrome Web Store Submission Checklist

Sources:
- Publish flow: https://developer.chrome.com/docs/webstore/publish
- Image requirements: https://developer.chrome.com/docs/webstore/images
- Privacy policy and Limited Use: https://developer.chrome.com/docs/webstore/program-policies/user-data-faq
- Program policies: https://developer.chrome.com/docs/webstore/program-policies/policies

## Upload Package
- `dist/github-pages-detector-extension-0.1.0.zip`

## Store Listing
- English: `chrome-store/listing-en.md`
- Chinese Simplified: `chrome-store/listing-zh-CN.md`

## Images
- Icon: `icons/icon-default-128.png`
- Screenshot EN: `chrome-store/assets/screenshot-en-1280x800.png`
- Screenshot ZH-CN: `chrome-store/assets/screenshot-zh-CN-1280x800.png`
- Small promo image: `chrome-store/assets/promo-small-440x280.png`

## URLs
- Homepage: https://holynova.github.io/github-pages-detector-extension/
- Privacy Policy: https://holynova.github.io/github-pages-detector-extension/privacy.html
- Support: https://github.com/holynova/github-pages-detector-extension/issues
- Repository: https://github.com/holynova/github-pages-detector-extension

## Suggested Distribution
- Visibility: Public
- Regions: All regions
- Pricing: Free

## Test Instructions
1. Install the extension.
2. Open a GitHub repository with GitHub Pages enabled.
3. Confirm the inline status changes from checking to `GitHub Pages`.
4. Click `GitHub Pages` and confirm the site opens in a new tab.
5. Click the copy icon and confirm the Pages URL is copied.
6. Open a repository without Pages and confirm `No GitHub Pages` appears.
