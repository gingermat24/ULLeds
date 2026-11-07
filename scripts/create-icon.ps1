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
$sizes = [int[]]@(16, 20, 24, 32, 40, 48, 64, 128, 256)
$images = [System.Collections.Generic.List[byte[]]]::new()
$entries = [System.Collections.Generic.List[byte[]]]::new()
$offset = 6 + 16 * $sizes.Length

try {
  $side = [Math]::Min($source.Width, $source.Height)
  $sourceRect = [System.Drawing.Rectangle]::new(
    [int](($source.Width - $side) / 2),
    [int](($source.Height - $side) / 2),
    $side,
    $side
  )

  foreach ($size in $sizes) {
    $bitmap = [System.Drawing.Bitmap]::new(
      $size,
      $size,
      [System.Drawing.Imaging.PixelFormat]::Format32bppArgb
    )
    $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
    $stream = [System.IO.MemoryStream]::new()
    try {
      $graphics.Clear([System.Drawing.Color]::Transparent)
      $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
      $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
      $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
      $graphics.DrawImage(
        $source,
        [System.Drawing.Rectangle]::new(0, 0, $size, $size),
        $sourceRect,
        [System.Drawing.GraphicsUnit]::Pixel
      )
      $bitmap.Save($stream, [System.Drawing.Imaging.ImageFormat]::Png)
      [byte[]]$png = $stream.ToArray()
    } finally {
      $stream.Dispose()
      $graphics.Dispose()
      $bitmap.Dispose()
    }

    $images.Add($png)
    $entry = [System.Collections.Generic.List[byte]]::new()
    $entry.Add([byte]($size -band 0xff))
    $entry.Add([byte]($size -band 0xff))
    $entry.Add(0)
    $entry.Add(0)
    $entry.AddRange([BitConverter]::GetBytes([uint16]1))
    $entry.AddRange([BitConverter]::GetBytes([uint16]32))
    $entry.AddRange([BitConverter]::GetBytes([uint32]$png.Length))
    $entry.AddRange([BitConverter]::GetBytes([uint32]$offset))
    $entries.Add($entry.ToArray())
    $offset += $png.Length
  }

  $icon = [System.Collections.Generic.List[byte]]::new()
  $icon.AddRange([byte[]]@(0, 0, 1, 0))
  $icon.AddRange([BitConverter]::GetBytes([uint16]$sizes.Length))
  foreach ($entry in $entries) { $icon.AddRange($entry) }
  foreach ($image in $images) { $icon.AddRange($image) }
  [System.IO.File]::WriteAllBytes($icoPath, $icon.ToArray())
} finally {
  $source.Dispose()
}

Write-Output "Created multi-resolution $icoPath from $pngPath"
