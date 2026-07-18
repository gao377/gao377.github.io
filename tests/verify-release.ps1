param(
  [string]$SitePath = 'site'
)

$ErrorActionPreference = 'Stop'

$required = @(
  '.nojekyll',
  'index.html',
  '404.html',
  'release.json',
  'robots.txt',
  'sitemap.xml',
  'pagefind/pagefind.js',
  'pagefind/pagefind-ui.js'
)
foreach ($name in $required) {
  if (-not (Test-Path -LiteralPath (Join-Path $SitePath $name))) {
    throw "Missing required publish file: $name"
  }
}

$index = Get-Content -LiteralPath (Join-Path $SitePath 'index.html') -Raw -Encoding utf8
$notFound = Get-Content -LiteralPath (Join-Path $SitePath '404.html') -Raw -Encoding utf8
$release = Get-Content -LiteralPath (Join-Path $SitePath 'release.json') -Raw -Encoding utf8 | ConvertFrom-Json
$sitemap = Get-Content -LiteralPath (Join-Path $SitePath 'sitemap.xml') -Raw -Encoding utf8
$robots = Get-Content -LiteralPath (Join-Path $SitePath 'robots.txt') -Raw -Encoding utf8

if ($index -notmatch 'name="viewport"') { throw 'index.html has no viewport metadata' }
if ($index -notmatch 'rel="canonical" href="https://gao377.github.io/"') { throw 'index.html has the wrong canonical URL' }
if ($index -match 'noindex') { throw 'index.html must be indexable' }
if ($index -notmatch '<html lang="zh-CN"') { throw 'index.html has the wrong document language' }
if ($index -match 'deployment-smoke-test|smoke-20260718-01') { throw 'smoke-page content remains in index.html' }
if ($notFound -notmatch 'name="viewport"') { throw '404.html has no viewport metadata' }
if ($notFound -notmatch 'href="/"') { throw '404.html does not return to the site root' }

if ($release.releaseId -notmatch '^[0-9a-f]{40}$') { throw 'release.json has no immutable source revision' }
if ($release.releaseId -ne $release.contentRevision) { throw 'release and content revisions disagree' }
if ($release.routeCount -ne 406) { throw 'release.json has the wrong route count' }
if ($release.indexableRouteCount -ne 211) { throw 'release.json has the wrong indexable route count' }
if ($release.storyPageCount -ne 196) { throw 'release.json has the wrong story page count' }
if ($release.answerPageCount -ne 195) { throw 'release.json has the wrong answer page count' }

$htmlCount = (Get-ChildItem -LiteralPath $SitePath -File -Recurse -Filter '*.html').Count
$indexCount = (Get-ChildItem -LiteralPath $SitePath -File -Recurse -Filter 'index.html').Count
$sitemapCount = ([regex]::Matches($sitemap, '<loc>')).Count
if ($htmlCount -ne 407) { throw "Expected 407 HTML files, found $htmlCount" }
if ($indexCount -ne $release.routeCount) { throw "Route files do not match release.json: $indexCount" }
if ($sitemapCount -ne $release.indexableRouteCount) { throw "Sitemap URLs do not match release.json: $sitemapCount" }
if ($robots -notmatch 'Sitemap: https://gao377.github.io/sitemap.xml') { throw 'robots.txt has the wrong sitemap URL' }

$forbidden = '(?i)(github_pat_|ghp_|AKID|secretId|secretKey|example\.invalid|localhost|127\.0\.0\.1|D:\\tutorial\\|C:\\Users\\)'
$textExtensions = @('.html', '.css', '.js', '.mjs', '.json', '.xml', '.txt', '.svg', '.map')
foreach ($file in Get-ChildItem -LiteralPath $SitePath -File -Recurse) {
  if ($textExtensions -notcontains $file.Extension) { continue }
  if ((Get-Content -LiteralPath $file.FullName -Raw -Encoding utf8) -match $forbidden) {
    throw "Forbidden secret, test origin, or local path marker in $($file.FullName)"
  }
}

Write-Output "PASS: formal tutorial release $($release.releaseId) / $htmlCount HTML / $sitemapCount sitemap URLs"
