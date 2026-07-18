param(
  [string]$SitePath = 'site',
  [string]$ExpectedReleaseId = 'smoke-20260718-01',
  [string]$ExpectedCommit = 'BUILD_COMMIT'
)

$ErrorActionPreference = 'Stop'

$required = @('.nojekyll', 'index.html', '404.html', 'release.json')
foreach ($name in $required) {
  if (-not (Test-Path -LiteralPath (Join-Path $SitePath $name))) {
    throw "Missing required publish file: $name"
  }
}

$index = Get-Content -LiteralPath (Join-Path $SitePath 'index.html') -Raw
$notFound = Get-Content -LiteralPath (Join-Path $SitePath '404.html') -Raw
$releaseText = Get-Content -LiteralPath (Join-Path $SitePath 'release.json') -Raw
$release = $releaseText | ConvertFrom-Json

if ($index -notmatch 'name="viewport"') { throw 'index.html has no viewport metadata' }
if ($index -notmatch 'noindex,nofollow') { throw 'index.html is indexable' }
if ($index -notmatch [regex]::Escape($ExpectedReleaseId)) { throw 'index.html has the wrong release ID' }
if ($notFound -notmatch 'name="viewport"') { throw '404.html has no viewport metadata' }
if ($notFound -notmatch 'href="/"') { throw '404.html does not return to the site root' }
if ($release.releaseId -ne $ExpectedReleaseId) { throw 'release.json has the wrong release ID' }
if ($release.type -ne 'deployment-smoke-test') { throw 'release.json has the wrong type' }
if ($release.buildCommit -ne $ExpectedCommit) { throw 'release.json has the wrong build commit' }

$forbidden = '(?i)(github_pat_|ghp_|AKID|secretId|secretKey|D:\\|C:\\Users\\)'
foreach ($file in Get-ChildItem -LiteralPath $SitePath -File -Recurse) {
  if ((Get-Content -LiteralPath $file.FullName -Raw) -match $forbidden) {
    throw "Forbidden secret or local path marker in $($file.Name)"
  }
}

Write-Output 'PASS: smoke site contract'
