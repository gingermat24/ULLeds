$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$framework = Join-Path $env:WINDIR "Microsoft.NET\Framework64\v4.0.30319"
$compiler = Join-Path $framework "csc.exe"
$runtimeWindows = Join-Path $framework "System.Runtime.WindowsRuntime.dll"
$runtimeCore = Join-Path $framework "System.Runtime.dll"
$unionMetadata = Join-Path ${env:ProgramFiles(x86)} "Windows Kits\10\UnionMetadata"

if (-not (Test-Path $compiler)) {
  throw "The .NET Framework C# compiler was not found at $compiler."
}
if (-not (Test-Path $unionMetadata)) {
  throw "Windows 10 SDK UnionMetadata was not found at $unionMetadata."
}

$windowsMetadata = Get-ChildItem -Path $unionMetadata -Directory |
  Where-Object { $_.Name -ne "Facade" } |
  Sort-Object Name -Descending |
  ForEach-Object {
    $candidate = Join-Path $_.FullName "Windows.winmd"
    if (Test-Path $candidate) { Get-Item $candidate }
  } |
  Select-Object -First 1

if (-not $windowsMetadata) {
  throw "Windows.winmd was not found under $unionMetadata."
}

$source = Join-Path $root "ull\spotify-media.cs"
$output = Join-Path $root "ull\spotify-media.exe"
$arguments = @(
  "/nologo",
  "/target:exe",
  "/out:$output",
  "/reference:$($windowsMetadata.FullName)",
  "/reference:$runtimeWindows",
  "/reference:$runtimeCore",
  $source
)

& $compiler @arguments
if ($LASTEXITCODE -ne 0) {
  throw "Could not build the Spotify media helper."
}

Write-Output "Built ull\spotify-media.exe."
