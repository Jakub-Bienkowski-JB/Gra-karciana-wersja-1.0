param(
  [string]$Source = "ikony",
  [string]$Target = "ikony-opt",
  [int64]$Quality = 82
)

$ErrorActionPreference = "Stop"

New-Item -ItemType Directory -Force -Path $Target | Out-Null
Add-Type -AssemblyName System.Drawing

$codec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() |
  Where-Object { $_.MimeType -eq "image/jpeg" }
$encoderParams = New-Object System.Drawing.Imaging.EncoderParameters(1)
$encoderParams.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter(
  [System.Drawing.Imaging.Encoder]::Quality,
  $Quality
)

Get-ChildItem -LiteralPath $Source -Filter *.png | ForEach-Object {
  $image = [System.Drawing.Image]::FromFile($_.FullName)
  $bitmap = New-Object System.Drawing.Bitmap(
    $image.Width,
    $image.Height,
    [System.Drawing.Imaging.PixelFormat]::Format24bppRgb
  )
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  $graphics.Clear([System.Drawing.Color]::FromArgb(17, 19, 26))
  $graphics.DrawImage($image, 0, 0, $image.Width, $image.Height)

  $output = Join-Path (Resolve-Path $Target) ($_.BaseName + ".jpg")
  $bitmap.Save($output, $codec, $encoderParams)

  $graphics.Dispose()
  $bitmap.Dispose()
  $image.Dispose()
}

$original = (Get-ChildItem -LiteralPath $Source -Filter *.png | Measure-Object -Property Length -Sum).Sum
$optimized = (Get-ChildItem -LiteralPath $Target -Filter *.jpg | Measure-Object -Property Length -Sum).Sum

[PSCustomObject]@{
  Source = $Source
  Target = $Target
  OriginalMB = [Math]::Round($original / 1MB, 2)
  OptimizedMB = [Math]::Round($optimized / 1MB, 2)
  SavedMB = [Math]::Round(($original - $optimized) / 1MB, 2)
}
