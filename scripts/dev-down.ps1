#Requires -Version 5.1
<# Stop WSK containers. -Volumes explicitly removes WSK data.
   -KillFrontend is rejected: ports do not prove process ownership.
#>
[CmdletBinding()]
param([switch]$Volumes, [switch]$KillFrontend)
$ErrorActionPreference = 'Stop'
if ($KillFrontend) { throw '-KillFrontend has been removed. Stop WSK frontend terminals with Ctrl+C; no process will be killed by port.' }
. (Join-Path $PSScriptRoot 'wsk-compose.ps1')
if (-not (Test-Path -LiteralPath $WskEnvFile)) { throw 'Missing .env.wsk. Copy .env.example to .env.wsk first.' }
$null = Get-WskConfig
$downArgs = @('down')
if ($Volumes) { $downArgs += '--volumes' }
& docker @WskComposeArgs @downArgs
if ($LASTEXITCODE -ne 0) { throw 'WSK compose down failed.' }
Write-Host 'WSK containers stopped. Stop WSK frontend terminals with Ctrl+C.'
