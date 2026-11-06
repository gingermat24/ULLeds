$ErrorActionPreference = "Stop"
Add-Type -AssemblyName System.Drawing

$root = Split-Path -Parent $PSScriptRoot
$assetDir = Join-Path $root "ull\assets"
New-Item -ItemType Directory -Path $assetDir -Force | Out-Null
$bitmap = New-Object System.Drawing.Bitmap -ArgumentList 256, 256
$graphics = [System.Drawing.Graphics]::FromImage($bitmap)
$graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$graphics.Clear([System.Drawing.Color]::FromArgb(21, 26, 34))

$background = New-Object System.Drawing.Drawing2D.GraphicsPath
$background.AddArc(20, 20, 42, 42, 180, 90)
$background.AddArc(194, 20, 42, 42, 270, 90)
$background.AddArc(194, 194, 42, 42, 0, 90)
$background.AddArc(20, 194, 42, 42, 90, 90)
$background.CloseFigure()
$backgroundBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(31, 39, 50))
$graphics.FillPath($backgroundBrush, $background)

$bars = @(
  @{ X = 66; Y = 112; Width = 30; Height = 76; Color = [System.Drawing.Color]::FromArgb(232, 121, 168) },
  @{ X = 113; Y = 68; Width = 30; Height = 120; Color = [System.Drawing.Color]::FromArgb(141, 124, 255) },
  @{ X = 160; Y = 91; Width = 30; Height = 97; Color = [System.Drawing.Color]::FromArgb(85, 200, 210) }
)
foreach ($bar in $bars) {
  $path = New-Object System.Drawing.Drawing2D.GraphicsPath
  $path.AddArc($bar.X, $bar.Y, $bar.Width, $bar.Width, 180, 90)
  $path.AddArc($bar.X + $bar.Width - 1, $bar.Y, $bar.Width, $bar.Width, 270, 90)
  $path.AddArc($bar.X + $bar.Width - 1, $bar.Y + $bar.Height - $bar.Width, $bar.Width, $bar.Width, 0, 90)
  $path.AddArc($bar.X, $bar.Y + $bar.Height - $bar.Width, $bar.Width, $bar.Width, 90, 90)
  $path.CloseFigure()
  $brush = New-Object System.Drawing.SolidBrush $bar.Color
  $graphics.FillPath($brush, $path)
  $brush.Dispose()
  $path.Dispose()
}

$pngPath = Join-Path $assetDir "app.png"
$icoPath = Join-Path $assetDir "app.ico"
$bitmap.Save($pngPath, [System.Drawing.Imaging.ImageFormat]::Png)
$graphics.Dispose()
$bitmap.Dispose()
$backgroundBrush.Dispose()
$background.Dispose()

$png = [System.IO.File]::ReadAllBytes($pngPath)
$header = [System.Collections.Generic.List[byte]]::new()
$header.AddRange([byte[]](0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 32, 0))
$header.AddRange([BitConverter]::GetBytes([uint32]$png.Length))
$header.AddRange([BitConverter]::GetBytes([uint32]22))
$header.AddRange($png)
[System.IO.File]::WriteAllBytes($icoPath, $header.ToArray())
Write-Output "Created $icoPath"
