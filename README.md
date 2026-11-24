# FACRI 具身智能系统文档门户

公开访问地址：https://gao377.github.io/

本仓库仅托管经审核的静态文档站点产物（`site/`），不承载 `FACRI-Platform` 源码、内部研发记录或大体积视频二进制。

## 源码维护与构建流水线

- 文档源稿位于 `FACRI-Platform/docs/handbook/`（门户首页 `index.md` + 六大专题目录，共 28 篇专页），菜单与重定向配置位于 `FACRI-Platform/docs/manifests/`。
- 受控中文检查：`python3 tools/docs/check_docs.py` 与 `python3 tools/docs/check_architecture.py`（基于 `tech-doc-style-chinese` 规则与扁平化源码树实效核验）。
- 双轨构建输出：`python3 tools/docs/build.py --output <gao377.github.io>/site`（基于 `huashu-md-html` 与 `pandoc` 编译：`index.md` 走方向 A Pentagram 设计师模板，27 篇内页走 `article` / `report` / `interactive` 主题外链样式表，并生成 `109` 条旧版 URL 静态跳转桩）。

## 外置实证视频托管

- 为防止 Git 历史二进制膨胀，站点内**严禁**提交 `.mp4` 或 `.webm` 视频文件。
- 全量 `12` 部 2026-11 实证录屏经去元数据与 `H.264 +faststart` 标准化转码后，统一托管在本仓库 GitHub Release `media-v2.1`，页面通过 `site/media-manifest.json` 映射外置链接与本地 `.webp` 海报图。

## 发布前校验

`.github/workflows/pages.yml` 在推送至 `main` 时运行 `python3 tests/verify-site.py`，强制核验：
1. `site/` 目录下 `.mp4` / `.webm` 视频二进制数量为 `0`；
2. 全部 28 篇手册专页与 109 条历史链接跳转桩均存在且站内相对引用无断链；
3. 无私有本机路径、内部审稿组件（`.am-toolbar` / `#am-source`）或敏感凭证特征泄露。
