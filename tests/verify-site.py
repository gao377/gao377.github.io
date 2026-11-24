"""Validate hierarchical public handbook, redirect stubs, zero binary media, and modern web invariants."""
from __future__ import annotations

from html.parser import HTMLParser
import json
from pathlib import Path
import re
from urllib.parse import unquote, urlparse

SITE_ROOT = Path(__file__).resolve().parents[1] / "site"
REPO_ROOT = Path(__file__).resolve().parents[1]

FORBIDDEN_RE = re.compile(
    r"/home/lenovo|/home/gnc|/mnt/robot-data|(?:^|[\s`'\"(])\.local/"
    r"|docs/handoff|docs/archive|docs/superpowers|artifacts/research"
    r"|\.am-toolbar|\bam-source\b"
    r"|\b(?:sk-[A-Za-z0-9]{20,}|gh[pousr]_[A-Za-z0-9]{30,}|dckr_pat_[A-Za-z0-9_-]{20,})\b"
)


class SiteHtmlAuditor(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.refs: list[str] = []
        self.has_color_scheme_meta = False
        self.has_site_nav = False
        self.has_until_found = False
        self.videos: list[dict[str, str | None]] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        amap = dict(attrs)
        for key in ("href", "src", "poster", "data"):
            val = amap.get(key)
            if val:
                self.refs.append(val)
        if tag == "meta" and amap.get("name") == "color-scheme" and amap.get("content") == "light dark":
            self.has_color_scheme_meta = True
        if tag == "nav" and amap.get("aria-label") == "主导航":
            self.has_site_nav = True
        if amap.get("hidden") == "until-found":
            self.has_until_found = True
        if tag == "video":
            self.videos.append(amap)


def main() -> None:
    assert (SITE_ROOT / ".nojekyll").is_file(), "Missing site/.nojekyll"
    release_path = SITE_ROOT / "release.json"
    manifest_path = SITE_ROOT / "media-manifest.json"
    assert release_path.is_file(), "Missing site/release.json"
    assert manifest_path.is_file(), "Missing site/media-manifest.json"

    # 1. Zero video binaries anywhere in the git repository / site tree
    for ext in ("*.mp4", "*.webm", "*.mov", "*.mkv"):
        binaries = list(REPO_ROOT.rglob(ext))
        assert not binaries, f"Forbidden binary video files found: {binaries[:5]}"

    # 2. Verify release manifest & media manifest
    release = json.loads(release_path.read_text(encoding="utf-8"))
    pages = release.get("pages", [])
    expected_pages = {row["file"] for row in pages}
    assert len(expected_pages) == 28, f"Expected 28 pages, got {len(expected_pages)}"
    assert "index.html" in expected_pages, "index.html missing from release.json"
    redirects_count = int(release.get("redirects_count", 0))
    assert redirects_count == 109, f"Expected 109 redirects, got {redirects_count}"

    media = json.loads(manifest_path.read_text(encoding="utf-8"))
    clips = media.get("clips", [])
    assert len(clips) == 12, f"Expected 12 curated clips in media-manifest.json, got {len(clips)}"
    for clip in clips:
        url = clip.get("url", "")
        assert url.startswith("https://github.com/gao377/gao377.github.io/releases/download/media-v2.1/"), url
        poster_rel = clip.get("poster", "")
        assert poster_rel and (SITE_ROOT / "assets" / poster_rel).is_file(), f"Missing poster for {clip.get('id')}: {poster_rel}"

    # 3. Verify all generated HTML files & internal links
    all_html = sorted(SITE_ROOT.rglob("*.html"))
    assert len(all_html) == len(expected_pages) + redirects_count, (
        f"HTML count mismatch: on disk={len(all_html)}, expected={len(expected_pages)}+{redirects_count}"
    )

    site_resolved = SITE_ROOT.resolve()
    for html_file in all_html:
        rel = html_file.relative_to(SITE_ROOT).as_posix()
        text = html_file.read_text(encoding="utf-8")
        assert not FORBIDDEN_RE.search(text), f"Forbidden private or slop content in {rel}"

        auditor = SiteHtmlAuditor()
        auditor.feed(text)

        for ref in auditor.refs:
            parsed = urlparse(ref)
            if parsed.scheme or not parsed.path or ref.startswith("#"):
                continue
            target = (html_file.parent / unquote(parsed.path)).resolve()
            assert target.is_relative_to(site_resolved) and target.is_file(), f"Broken link in {rel}: {ref}"

        if rel in expected_pages:
            assert auditor.has_color_scheme_meta, f"Missing <meta name='color-scheme'> in {rel}"
            assert auditor.has_site_nav, f"Missing semantic <nav aria-label='主导航'> in {rel}"
            if rel == "index.html":
                assert auditor.has_until_found, "Portal index.html must use hidden='until-found' for accessible switcher"
                assert auditor.videos, "Portal index.html missing showcase <video> elements"
                assert auditor.videos[0].get("loading") is None, "Above-the-fold portal hero video must NOT have loading='lazy'"
                assert auditor.videos[0].get("width") and auditor.videos[0].get("height"), "Hero video must specify width & height"
                for offscreen in auditor.videos[1:]:
                    assert offscreen.get("loading") == "lazy", "Secondary portal switcher video should use loading='lazy'"
            else:
                for vid in auditor.videos:
                    assert vid.get("loading") == "lazy", f"Below-fold video in {rel} should use loading='lazy'"
                    assert vid.get("width") and vid.get("height"), f"Video in {rel} must specify explicit width & height"

    print(
        f"Verified {len(expected_pages)} handbook pages, {redirects_count} redirect stubs, "
        f"{len(clips)} external media refs, and 0 repo video binaries."
    )


if __name__ == "__main__":
    main()
