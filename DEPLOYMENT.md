# 部署手册 — 多机环境搭建实录

> 每次在新机器上完整跑通一遍就记录在此:实际环境、每一步命令与验证结果。
> 换新机器/重装系统后照此执行即可。日常写作与发布流程见 `README.md`,仓库规则见 `AGENTS.md`。

## 环境快照(两台机器均验证通过)

| 项 | MacBook(2026-09-15) | Ubuntu 工作站(2026-09-15) |
|---|---|---|
| 主机 | 作者个人 Mac | `tttt-cfd-ganggang` |
| 系统 | macOS 12.7.4 (Monterey),Intel x86_64 | Ubuntu 20.04.6 LTS,内核 5.15.0-139-generic,x86_64 |
| Node.js | v22.23.2(经 nvm 安装) | v22.23.2 |
| npm | 10.9.8 | 10.9.8 |
| git | 2.37.1(Apple Git) | 2.25.1 |
| 仓库路径 | `~/tttt_file/hugh-tong.github.io`,分支 `dev_tttt` | `~/work/git_code/tttt/hugh-tong.github.io`,分支 `dev_tttt` |
| Hexo | 6.3.0 | 6.3.0(hexo-cli 4.3.1) |
| 主题 | Butterfly 5.7.0(npm)+ NexT v8.20.0(git clone,commit `ba7ec07`) | 同左 |
| 额外系统依赖 | **无**(pandoc 已不需要,渲染器是 hexo-renderer-marked) | 同左 |

前置条件只有两个:Node.js ≥ 14(两台机均为 22)和 git。SSH key 已在本机配置(deploy 走 SSH 推 main 分支)。

**结论:Mac 上可以正常部署**。两台机器步骤完全一致,仅后台常驻预览命令有平台差异(见第 5 步)。

## 从零部署的完整步骤

以下每条都在两台机器(MacBook / Ubuntu 工作站)上实际执行并验证过。

### 1. 克隆仓库并切到源码分支

```bash
git clone git@github.com:hugh-tong/hugh-tong.github.io.git
cd hugh-tong.github.io
git checkout dev_tttt     # 一切修改只在 dev_tttt;main 是部署产物,master 是旧残留
```

注意:若 clone 默认检出 `master`,那是 2023 年的旧部署输出,不代表源码,务必先切 `dev_tttt`。

### 2. 安装依赖

```bash
npm install
```

结果:266 个包,Hexo 6.3.0(与 `package.json` 锁定一致)。npm 末尾可能提示 audit 漏洞,属 Hexo 6 老版本依赖链的已知情况,不影响本地使用,可忽略。

### 3. 补齐 NexT 主题(必踩的坑,别跳过)

clone 仓库后 `themes/next` 是**空目录**(裸 gitlink,不带文件)。不补的话 `hexo g` 直接报主题找不到:

```bash
git clone https://github.com/next-theme/hexo-theme-next.git themes/next
git -C themes/next checkout v8.20.0   # 确认 HEAD 在 ba7ec07 "Release v8.20.0"
```

> Mac 实测:clone + checkout 约 10 秒完成,HEAD 落在 `ba7ec07 Release v8.20.0`,与仓库 gitlink 指向一致。

只用 Butterfly 的话理论上可跳过,但 `npm run build:next` 等脚本会失败,建议照做。

### 4. 验证构建

```bash
npx hexo clean
npx hexo generate              # 默认主题(butterfly)
npm run build:next             # NexT
```

实测数据(两机接近,数量一致即正常):

| 主题 | Mac | Ubuntu |
|---|---|---|
| Butterfly | 152 files / 1.29s | 152 files / 1.19s |
| NexT | 163 files / 2.61s | 184 files / 1.88s |

> NexT 生成文件数 Mac(163)与 Ubuntu(184)不同:本地化缓存 `.gitignore` 过的 `db.json` 等会影响部分页面生成,数量小幅波动属正常,无报错即可。

两套主题都能完整生成即环境正常。生成产物在 `public/`,临时合并配置 `_multiconfig.yml` 属正常现象(已 gitignore)。

### 5. 验证本地预览

```bash
npx hexo server -p 4321        # 或 npm run server:butterfly
# 另开终端:
curl -s -o /dev/null -w "%{http_code}" http://localhost:4321/   # 期望 200
```

本次实测(两机一致):HTTP 200,首页 39KB,`<title>tttt's</title>` 渲染正常。

后台常驻预览(终端关了不死,**按平台二选一**):

```bash
# Linux(Ubuntu):
setsid nohup npx hexo server > /tmp/hexo-server.log 2>&1 < /dev/null &

# macOS(无 setsid,用 nohup 即可):
nohup npx hexo server > /tmp/hexo-server.log 2>&1 &
```

### 6. 部署上线(写完文章后)

```bash
npx hexo clean && npm run deploy:butterfly   # force-push 静态页到 main
git add ... && git commit -m "..." && git push origin dev_tttt   # 别忘了推源码
```

GitHub Pages 生效约 1 分钟延迟。deploy 走 SSH(`git@github.com:...`),需要本机 SSH key 已注册到 GitHub 账号。

## 常见问题(按部署阶段)

| 症状 | 原因与解法 |
|---|---|
| `hexo g` 报主题找不到 | 第 3 步没做,`themes/next` 是空的,补 clone |
| clone GitHub 超时 | `git -c http.version=HTTP/1.1 clone ...` 或改用 SSH |
| push 没权限 | SSH key 未注册到 GitHub → Settings → SSH and GPG keys |
| 改配置后站点异常 | 先 `npx hexo clean` 再生成,九成是缓存 |
| `hexo s` 起不来/巨慢 | 仓库在 /mnt/c(WSL 挂 Windows 盘)时文件监听极慢,等 "Hexo is running" 再访问;Mac/原生 Linux 无此问题 |
| 分类/标签页 404 | `source/categories/index.md`、`source/tags/index.md` 已建好,别删 |
| Mac 上 `setsid: command not found` | macOS 没有 setsid,后台预览直接用 `nohup ... &`(见第 5 步) |

## 验证记录

### MacBook(2026-09-15)

- ✅ 前置检查:分支 `dev_tttt` 且工作区干净;`registry.npmjs.org` / `github.com` 可达
- ✅ `npm install`:无 error(audit 提示为 Hexo 6 依赖链已知情况,可忽略)
- ✅ `themes/next`:v8.20.0(ba7ec07)就位
- ✅ Butterfly 构建:152 files / 1.29s
- ✅ NexT 构建:163 files / 2.61s
- ✅ 本地预览:`hexo s -p 4321` → HTTP 200,`<title>tttt's</title>`,首页 39KB
- ⏸ 部署上线:本次未执行(未改内容,无需 deploy)

### Ubuntu 工作站(2026-09-15)

- ✅ `npm install`:266 包,无 error
- ✅ `themes/next`:v8.20.0(ba7ec07)就位
- ✅ Butterfly 构建:152 files / 1.19s
- ✅ NexT 构建:184 files / 1.88s
- ✅ 本地预览:HTTP 200,标题渲染正常
- ⏸ 部署上线:本次未执行(未改内容,无需 deploy)

## 一年一次的健康检查

```bash
npm outdated                            # 依赖更新概览
npm update hexo-theme-butterfly         # 主题小版本升级(覆盖式配置不丢)
npx hexo --version                      # Hexo 大版本升级看官方迁移文档
npm run server:butterfly                # 升级后全站预览过一遍
```
