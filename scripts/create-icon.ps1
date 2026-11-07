$ErrorActionPreference = "Stop"
Add-Type -AssemblyName System.Drawing

$root = Split-Path -Parent $PSScriptRoot
$assetDir = Join-Path $root "ull\assets"
$pngPath = Join-Path $assetDir "app.png"
$icoPath = Join-Path $assetDir "app.ico"

if (-not (Test-Path -LiteralPath $pngPath -PathType Leaf)) {
  throw "Place your square PNG artwork at $pngPath before building."
}

$source = [System.Drawing.Image]::FromFile($pngPath)
$bitmap = [System.Drawing.Bitmap]::new(
  256,
  256,
  [System.Drawing.Imaging.PixelFormat]::Format32bppArgb
)
$graphics = [System.Drawing.Graphics]::FromImage($bitmap)
$stream = [System.IO.MemoryStream]::new()

try {
  $graphics.Clear([System.Drawing.Color]::Transparent)
  $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

  $side = [Math]::Min($source.Width, $source.Height)
  $sourceRect = [System.Drawing.Rectangle]::new(
    [int](($source.Width - $side) / 2),
    [int](($source.Height - $side) / 2),
    $side,
    $side
  )
  $graphics.DrawImage(
    $source,
    [System.Drawing.Rectangle]::new(0, 0, 256, 256),
    $sourceRect,
    [System.Drawing.GraphicsUnit]::Pixel
  )
  $bitmap.Save($stream, [System.Drawing.Imaging.ImageFormat]::Png)

  $png = $stream.ToArray()
  $header = [System.Collections.Generic.List[byte]]::new()
  $header.AddRange([byte[]](0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 32, 0))
  $header.AddRange([BitConverter]::GetBytes([uint32]$png.Length))
  $header.AddRange([BitConverter]::GetBytes([uint32]22))
  $header.AddRange($png)
  [System.IO.File]::WriteAllBytes($icoPath, $header.ToArray())
} finally {
  $stream.Dispose()
  $graphics.Dispose()
  $bitmap.Dispose()
  $source.Dispose()
}

Write-Output "Created $icoPath from $pngPath"
