<#
.SYNOPSIS
  Restores the bundled Electron app's node_modules into this repository.

.DESCRIPTION
  The recovered source depends on packages that are not on the public npm
  registry (notably @warren-robobloq/quiklight and its native binaries).
  They are copied out of the installed DX Light application.

  The script:
    1. ensures the Electron dev dependency is installed,
    2. extracts app.asar to a temp folder (unless -From is supplied),
    3. copies node_modules into the repository,
    4. overlays the native binaries from app.asar.unpacked.

.PARAMETER InstallDir
  DX Light installation folder. Default: $env:ProgramFiles\DX Light

.PARAMETER From
  Use an already-extracted app folder instead of extracting app.asar.

.PARAMETER Force
  Delete node_modules and start from a clean install.

.EXAMPLE
  powershell -ExecutionPolicy Bypass -File tools/restore-node-modules.ps1

.EXAMPLE
  powershell -ExecutionPolicy Bypass -File tools/restore-node-modules.ps1 `
    -InstallDir "D:\Apps\DX Light" -Force
#>
[CmdletBinding()]
param(
  [string]$InstallDir = (Join-Path $env:ProgramFiles "DX Light"),
  [string]$From = "",
  [switch]$Force
)

$ErrorActionPreference = "Stop"

$repo = Split-Path -Parent $PSScriptRoot
$dest = Join-Path $repo "node_modules"
$resources = Join-Path $InstallDir "resources"
$asar = Join-Path $resources "app.asar"
$unpacked = Join-Path $resources "app.asar.unpacked\node_modules"

function Write-Step($message) {
  Write-Host "==> $message" -ForegroundColor Cyan
}

function Invoke-Robocopy($source, $target) {
  if (-not (Test-Path $source)) { return }
  & robocopy $source $target /E /NFL /NDL /NJH /NJS /NP | Out-Null
  if ($LASTEXITCODE -ge 8) {
    throw "robocopy failed ($LASTEXITCODE) copying $source"
  }
}

# ---------------------------------------------------------------- preflight
Write-Step "Repository: $repo"

if (-not $From) {
  if (-not (Test-Path $asar)) {
    throw "app.asar not found at '$asar'. Pass -InstallDir or -From."
  }
}

if ($Force -and (Test-Path $dest)) {
  Write-Step "Removing existing node_modules"
  Remove-Item $dest -Recurse -Force
}

# ------------------------------------------------------------ electron first
if (-not (Test-Path (Join-Path $dest "electron\dist\electron.exe"))) {
  Write-Step "Installing Electron dev dependency"
  Push-Location $repo
  try {
    & npm install --no-audit --no-fund
    if ($LASTEXITCODE -ne 0) { throw "npm install failed ($LASTEXITCODE)" }
  } finally {
    Pop-Location
  }
} else {
  Write-Step "Electron already present"
}

# ------------------------------------------------------------- extract asar
if (-not $From) {
  $temp = Join-Path $env:TEMP "dxlight-restore"
  if (Test-Path $temp) { Remove-Item $temp -Recurse -Force }
  New-Item -ItemType Directory -Path $temp | Out-Null

  Write-Step "Extracting app.asar (this can take a minute)"
  Push-Location $repo
  try {
    & npx --yes @electron/asar extract $asar $temp
    if ($LASTEXITCODE -ne 0) { throw "asar extraction failed ($LASTEXITCODE)" }
  } finally {
    Pop-Location
  }
  $From = $temp
}

$bundled = Join-Path $From "node_modules"
if (-not (Test-Path $bundled)) {
  throw "No node_modules found in '$From'."
}

# --------------------------------------------------------------- copy files
Write-Step "Copying bundled packages"
Invoke-Robocopy $bundled $dest

if (Test-Path $unpacked) {
  Write-Step "Overlaying native binaries from app.asar.unpacked"
  Invoke-Robocopy $unpacked $dest
} else {
  Write-Warning "app.asar.unpacked not found; native .node binaries may be missing."
}

# ------------------------------------------------------------------- verify
Write-Step "Verifying key packages"
$required = @(
  "@warren-robobloq/quiklight",
  "node-hid",
  "usb",
  "electron-store",
  "electron"
)

$missing = @()
foreach ($pkg in $required) {
  if (Test-Path (Join-Path $dest $pkg)) {
    Write-Host "    ok  $pkg" -ForegroundColor Green
  } else {
    Write-Host "    missing  $pkg" -ForegroundColor Yellow
    $missing += $pkg
  }
}

$native = Join-Path $dest "@warren-robobloq\quiklight\lib\binding\quiklight.node"
if (Test-Path $native) {
  Write-Host "    ok  quiklight.node" -ForegroundColor Green
} else {
  Write-Host "    missing  quiklight.node" -ForegroundColor Yellow
  $missing += "quiklight.node"
}

if ($missing.Count -gt 0) {
  Write-Warning "Still missing: $($missing -join ', ')"
  exit 1
}

Write-Step "Done. Run: npm run build; npm start"
