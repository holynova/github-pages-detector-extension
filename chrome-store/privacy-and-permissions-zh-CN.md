# 隐私与权限说明 - 中文

## 单一用途
GitHub Pages Detector 用于检测当前 GitHub 仓库是否启用了 GitHub Pages，并帮助用户打开或复制检测到的 Pages URL。

## 权限说明

### `storage`
用于保存可选的 GitHub token。只有当用户希望更准确地检测私有仓库 Pages 状态时，才需要填写 token；token 保存在 Chrome sync storage 中。

### 主机权限：`https://github.com/*`
用于在 GitHub 仓库页面运行 content script，并在页面内显示 GitHub Pages 状态。

### 主机权限：`https://api.github.com/*`
用于请求当前仓库对应的 GitHub Pages API。

### 主机权限：`https://*.github.io/*`
当 API 无法给出明确结果时，用于验证推导出的 GitHub Pages URL 是否存在。

## 数据收集说明
插件不会为了广告或分析目的收集、出售或共享用户数据。

插件处理的数据包括：
- 当前 GitHub 仓库 URL：仅用于识别 owner 和 repo 名称。
- 可选 GitHub token：仅在用户主动填写时保存到 Chrome sync storage。
- GitHub API 和推导 Pages URL 的响应：仅用于显示 Pages 检测状态。

## 远程代码
不使用远程代码。所有 JavaScript 都随插件包一起发布。

## Limited Use 声明
从 Google API 获得的信息使用将遵守 Chrome Web Store User Data Policy，包括 Limited Use 要求。

## 开发者后台隐私表单建议
- 是否收集个人身份信息：否
- 是否收集健康信息：否
- 是否收集金融和支付信息：否
- 是否收集身份验证信息：是，仅当用户主动保存 GitHub token 用于私有仓库检测
- 是否收集个人通信：否
- 是否收集位置信息：否
- 是否收集网页历史：否；插件只读取当前 GitHub 仓库 URL，用于页面上明确展示的检测功能
- 是否用于广告：否
- 是否出售数据：否
