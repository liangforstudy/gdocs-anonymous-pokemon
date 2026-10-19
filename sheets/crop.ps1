# Cuts the Pokémon listed in cells.txt out of the Shuffle sheets into ../sprites/<dex>.png at 128x128.
# Run from anywhere:  powershell -File sheets\crop.ps1
param([int]$Size = 128)
Add-Type -AssemblyName System.Drawing
$here = Split-Path -Parent $MyInvocation.MyCommand.Path
$outDir = Join-Path (Split-Path -Parent $here) 'sprites'
New-Item -ItemType Directory -Force $outDir | Out-Null
$sheets = @{}
$count = 0
foreach ($line in Get-Content (Join-Path $here 'cells.txt')) {
  if ($line -match '^\s*#' -or $line -notmatch '^\s*(\S+)\s+(\d+)\s+(\d+),(\d+)') { continue }
  $id, $gen, $c, $r = $Matches[1], $Matches[2], [int]$Matches[3], [int]$Matches[4]
  if (-not $sheets[$gen]) { $sheets[$gen] = [System.Drawing.Image]::FromFile((Join-Path $here "gen$gen.png")) }
  $bmp = New-Object System.Drawing.Bitmap $Size, $Size, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.InterpolationMode = 'HighQualityBicubic'
  $g.PixelOffsetMode = 'HighQuality'
  $g.CompositingQuality = 'HighQuality'
  $g.DrawImage($sheets[$gen], (New-Object System.Drawing.Rectangle 0, 0, $Size, $Size), (261 * $c + 5), (261 * $r + 5), 256, 256, [System.Drawing.GraphicsUnit]::Pixel)
  $g.Dispose()
  $bmp.Save((Join-Path $outDir "$id.png"), [System.Drawing.Imaging.ImageFormat]::Png)
  $bmp.Dispose()
  $count++
}
$sheets.Values | ForEach-Object { $_.Dispose() }
"$count sprites written to $outDir"
