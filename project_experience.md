# 项目经验心得：Investing Notes

## 构建习惯

1.  **环境验证优先：** 在任何环境变更（如 IDE 重启、新项目设置）后，始终首先验证 `git` 和 `npm`（或等效包管理器）的可用性。这能避免后续因环境问题导致的连锁错误。
2.  **Git 身份配置：** 对于新克隆的仓库，立即配置本地 Git 用户名和邮箱，确保提交记录的正确性。
3.  **正确克隆仓库：** 始终使用 `git clone` 命令来获取项目代码，而不是下载 zip 包并解压。`git clone` 会包含 `.git` 目录，确保项目是一个完整的 Git 仓库。
4.  **部署前推送代码：** 在期望 CI/CD 平台（如 Vercel）部署最新更改之前，务必将本地所有修改推送到远程 Git 仓库。CI/CD 平台只会拉取远程仓库的代码。

## 常见错误处理点

1.  **`git` / `npm` 命令未找到：**
    *   **原因：** 环境变量 `PATH` 未包含 Git 或 Node.js 的可执行文件路径，或环境变量未刷新。
    *   **解决方案：**
        *   手动检查系统 `PATH` 环境变量，确保 Git 的 `bin` 目录和 Node.js 的安装目录已添加。
        *   在安装新工具或修改 `PATH` 后，务必重启 IDE 或终端，以刷新环境变量。

2.  **`npm` `PSSecurityException` (PowerShell 安全策略错误)：**
    *   **原因：** PowerShell 的执行策略阻止了 `npm` 脚本的运行。
    *   **解决方案：** 在 PowerShell 中运行 `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned -Force`，允许本地脚本运行。

3.  **`git commit` 命令参数解析问题 (在沙盒环境中)：**
    *   **原因：** 沙盒环境对命令行参数的解析可能与标准终端不同，导致提交消息中的空格被误解为参数分隔符。
    *   **解决方案：** 如果自动化工具中的 `git commit -m "..."` 失败，尝试使用更简单的提交消息，或在本地终端手动执行 `git add`、`git commit` 和 `git push`。

4.  **Firebase `Missing App configuration value` (本地开发环境)：**
    *   **原因：** Vite 项目在本地开发时，`import.meta.env` 无法直接访问系统环境变量。需要通过 `.env` 文件加载。
    *   **解决方案：** 在项目根目录创建一个 `.env` 文件，并将 Firebase 配置以 `VITE_FIREBASE_` 为前缀写入其中（例如 `VITE_FIREBASE_PROJECT_ID=your-project-id`）。确保 `.env` 文件被 `.gitignore` 忽略。

5.  **Firebase `Missing App configuration value` (Vercel/部署环境)：**
    *   **原因：** Vercel 部署时，应用无法获取 Firebase 配置。即使本地有 `.env` 文件，Vercel 也不会自动使用它。
    *   **解决方案：** 在 Vercel 项目设置的 "Environment Variables" 中，手动添加所有 Firebase 配置变量。确保变量名称与代码中使用的 `VITE_` 前缀匹配，并设置正确的环境作用域（如 Production, Preview）。

6.  **Vercel 部署后页面空白：**
    *   **原因：** 可能有多种，包括前端 JavaScript 运行时错误、Firebase 配置错误、Firebase 安全规则阻止数据读取等。
    *   **解决方案：**
        *   打开 Vercel 部署页面的浏览器开发者工具，检查 "Console" 选项卡中的 JavaScript 错误。
        *   检查 Vercel 仪表盘中最新部署的 "Runtime Logs"（运行时日志），查找应用运行时的错误。
        *   确认 Firebase Firestore 安全规则允许 Vercel 部署的应用读取所需数据（例如 `allow read: if true;`）。

7.  **Firebase `db` 实例未导出/导入：**
    *   **原因：** `firebase.js` 文件中可能缺少 `getFirestore` 的导入，或者 `db` 实例没有被明确导出。
    *   **解决方案：** 确保 `firebase.js` 中包含 `import { getFirestore } from "firebase/firestore";`，并且在初始化 `db` 后，使用 `export { db };` 导出。
