---
title: npm 笔记(占位)
date: 2026-09-15 16:10:00
published: false
categories:
  - [工具, Linux]
tags:
  - npm
  - Node
  - 占位待充实
description: npm 常用命令笔记占位,正文待充实。
mathjax: true
---

# 101_npm

`npm` 是 **Node Package Manager**（Node 包管理器）的缩写，它是 **JavaScript 运行时环境 Node.js** 的默认包管理工具。

简单来说，**npm 主要做两件事**：

1.  **包管理仓库 (Registry)**：
    *   它是一个巨大的在线仓库，存放了全球开发者共享的、可复用的 JavaScript 代码模块（称为“包”或“模块”）。这些包可以是库、框架、工具、命令行程序等等（例如 `React`, `Vue`, `Express`, `Lodash` 等）。
    *   开发者可以把自己的包发布到这个公共仓库供他人使用。

2.  **命令行工具 (CLI - Command Line Interface)**：
    *   它是一个安装在开发者电脑上的命令行程序（通常随 Node.js 一起安装）。
    *   通过运行 `npm` 命令（如 `npm install`, `npm start`, `npm publish` 等），开发者可以：
        *   **安装包**：从 npm 仓库下载所需的包及其依赖到本地项目中。
        *   **管理依赖**：在项目根目录下的 `package.json` 文件中记录项目所依赖的包及其版本信息。
        *   **运行脚本**：定义和执行项目相关的任务（如启动开发服务器、运行测试、构建生产代码等）。
        *   **发布包**：将自己开发的包发布到 npm 仓库供他人使用。
        *   **管理项目版本**：更新包的版本等。

**为什么需要 npm？**

1.  **代码复用**：避免重复造轮子，可以直接使用他人开发好的、经过验证的功能模块。
2.  **依赖管理**：现代 JavaScript 项目依赖众多第三方包，npm 能自动处理这些包及其嵌套依赖的下载、安装和版本控制，确保项目在不同环境中运行一致。
3.  **项目标准化**：`package.json` 文件是项目的“配置清单”，清晰地定义了项目信息、依赖、脚本等，方便团队协作和项目维护。
4.  **构建和自动化**：通过定义 `scripts`，可以方便地执行构建、测试、部署等重复性任务。

**核心概念：**

*   **`package.json`**：项目的核心配置文件，位于项目根目录。它包含：
    *   `name`: 项目名称。
    *   `version`: 项目版本。
    *   `dependencies`: **项目运行时**必须依赖的包列表（如 `React`, `Express`）。
    *   `devDependencies`: **仅在开发阶段**需要的包列表（如测试框架 `Jest`、构建工具 `Webpack`）。
    *   `scripts`: 定义可运行的命令行脚本（如 `"start": "node app.js"`，运行 `npm start` 即可执行）。
*   **`node_modules` 目录**：当你运行 `npm install` 时，npm 会把所有下载的包及其依赖安装到这个目录下。这个目录通常很大，**不应该**提交到版本控制系统（如 Git），而是通过 `package.json` 和 `package-lock.json` 来重现依赖。
*   **`package-lock.json` (或 `npm-shrinkwrap.json`)**：自动生成的文件，精确锁定所有依赖包的**具体版本**及其依赖树。确保在不同环境（开发、测试、生产）或不同时间安装时，得到完全一致的依赖树，避免因版本更新导致的不兼容问题。**应该**提交到版本控制系统。

**常用命令示例：**

*   `npm init`: 初始化一个新项目，创建 `package.json` 文件（或 `npm init -y` 使用默认值快速创建）。
*   `npm install <package_name>`: 安装一个包到当前项目的 `dependencies`（如 `npm install express`）。
*   `npm install --save-dev <package_name>`: 安装一个包到当前项目的 `devDependencies`（如 `npm install --save-dev jest`）。
*   `npm install`: 根据当前目录下的 `package.json` 文件，安装所有依赖项（通常在克隆项目后第一步执行）。
*   `npm update <package_name>`: 更新指定的包。
*   `npm uninstall <package_name>`: 卸载一个包。
*   `npm start`: 运行在 `package.json` 的 `scripts` 部分定义的 `start` 命令。
*   `npm run <script_name>`: 运行在 `package.json` 的 `scripts` 部分定义的任意自定义命令（如 `npm run test`, `npm run build`）。
*   `npm publish`: 将当前项目作为包发布到 npm 仓库（需要注册 npm 账号）。
*   `npm search <keyword>`: 在 npm 仓库中搜索包。
*   `npm view <package_name>`: 查看某个包的详细信息（版本、依赖等）。

**总结：**

npm 是 JavaScript 和 Node.js 生态系统的基石工具。它既是世界上最大的软件注册中心（存放开源代码包），也是一个强大的命令行工具，用于管理这些包在你项目中的依赖关系、安装、版本控制以及执行项目任务。没有 npm，现代 JavaScript 开发将变得极其繁琐和低效。
