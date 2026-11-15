# Makes the Desktop and Start menu shortcuts for OpenAct. Run by "Install OpenAct (Windows).cmd".
# The app opens in its own window using Edge or Chrome (whichever is installed), with its own small profile folder,
# so your scripts are kept the same way every time. With neither, the shortcut opens OpenAct.html in your default browser.
param(
  [Parameter(Mandatory = $true)][string]$Dest,
  [string]$Browser = 'none'
)
$ErrorActionPreference = 'Stop'
$page = Join-Path $Dest 'OpenAct.html'
$uri = ([System.Uri]$page).AbsoluteUri
$profileDir = Join-Path $Dest 'profile'
$icon = Join-Path $Dest 'OpenAct.ico'
$shell = New-Object -ComObject WScript.Shell
$startMenu = Join-Path ([Environment]::GetFolderPath('Programs')) 'OpenAct'
New-Item -ItemType Directory -Force -Path $startMenu | Out-Null
$desktop = [Environment]::GetFolderPath('Desktop')

function New-Link([string]$path) {
  $s = $shell.CreateShortcut($path)
  if ($Browser -ne 'none' -and (Test-Path -LiteralPath $Browser)) {
    $s.TargetPath = $Browser
    $s.Arguments = "--app=`"$uri`" --user-data-dir=`"$profileDir`" --no-first-run --no-default-browser-check"
  } else {
    $s.TargetPath = $page
  }
  $s.WorkingDirectory = $Dest
  $s.IconLocation = $icon
  $s.Description = 'OpenAct, the free script editor'
  $s.Save()
}

New-Link (Join-Path $startMenu 'OpenAct.lnk')
New-Link (Join-Path $desktop 'OpenAct.lnk')
$u = $shell.CreateShortcut((Join-Path $startMenu 'Uninstall OpenAct.lnk'))
$u.TargetPath = Join-Path $Dest 'Uninstall OpenAct.cmd'
$u.WorkingDirectory = $Dest
$u.IconLocation = $icon
$u.Description = 'Remove OpenAct from this computer'
$u.Save()
