---
title: swak4Foam 资料索引
date: 2026-09-15 15:10:00
updated: 2026-09-16 18:00:00
categories:
  - [CFD, OpenFOAM, 工具链]
tags:
  - CFD/OpenFOAM/工具链
  - 占位待充实
description: swak4Foam 表达式工具库的历史资料索引；当前 OpenFOAM 版本兼容性尚未完成实测。
published: false
mathjax: true
---

> 状态：未发布。当前缺少可信的新版兼容矩阵和本机编译记录，在完成验证前不提供安装建议。

swak4Foam 是一组基于表达式处理 OpenFOAM 数据的社区扩展，历史上包含 `funkySetFields`、`groovyBC` 和一组 function objects。

旧文曾断言“OpenFOAM v23+ 编译不过、OpenFOAM-8 能编过”，但没有记录具体发行线、仓库 commit、编译器或日志，现已撤回。公开仓库和镜像横跨 OpenFOAM 2.x、foam-extend 以及较早的 Foundation/OpenCFD 版本，不能据此推导对当前版本的支持。

## 发布前验证清单

- [ ] 确认上游仓库、许可证、branch/tag 和最后维护时间；
- [ ] 分别写明 Foundation/OpenCFD 发行线，不使用“v23+”这种含混版本；
- [ ] 记录 OpenFOAM、编译器、bison、flex 和 swak4Foam commit；
- [ ] 保存 `Allwmake` 完整日志；
- [ ] 运行上游最小示例，验证 `funkySetFields` 和 `groovyBC`；
- [ ] 对照当前 OpenFOAM 原生表达式/function objects，说明为什么仍需此扩展。

## 资料

- [swak4Foam historical repository](https://github.com/wyldckat/swak4foam)
- [swak4Foam reference](https://github.com/wyldckat/swak4foam/blob/master/Documentation/swak4FoamReference.org)
- [OpenFOAM Wiki training material](https://wiki.openfoam.com/Swak4Foam_and_PyFoam_by_Bruno_Santos)
