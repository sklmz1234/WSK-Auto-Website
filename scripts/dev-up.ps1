#Requires -Version 5.1
<# Start WSK backend; print independent frontend commands.
   -Build rebuilds WSK images. -Seed resets WSK demo data (explicit opt-in).
   Frontends run in user terminals, with visible output and Ctrl+C to stop.
#>
[CmdletBinding()]
param([switch]$Build, [switch]$Seed, [switch]$SkipDocker, [switch]$NoFrontend, [switch]$NoBrowser)
$ErrorActionPreference = 'Stop'
. (Join-Path $PSScriptRoot 'wsk-compose.ps1')
$gatewayPort = 18090
if (-not $SkipDocker) {
    if (-not (Test-Path -LiteralPath $WskEnvFile)) {
        Copy-Item -LiteralPath (Join-Path $WskRoot '.env.example') -Destination $WskEnvFile
    }
    $config = Get-WskConfig
    $gatewayPort = $config.services.'api-gateway'.ports[0].published
    $upArgs = @('up', '-d')
    if ($Build) { $upArgs += '--build' }
    & docker @WskComposeArgs @upArgs
    if ($LASTEXITCODE -ne 0) { throw 'WSK compose up failed. Start Docker Desktop manually and retry.' }
    $healthUrl = "http://127.0.0.1:$gatewayPort/healthz"
    $deadline = (Get-Date).AddSeconds(150)
    $healthy = $false
    while ((Get-Date) -lt $deadline) {
        try {
            $response = Invoke-WebRequest -Uri $healthUrl -UseBasicParsing -TimeoutSec 3
            if ($response.StatusCode -eq 200) { $healthy = $true; break }
        } catch { }
        Start-Sleep -Seconds 3
    }
    if (-not $healthy) { throw "WSK gateway did not become healthy: $healthUrl" }
    if ($Seed) {
        & docker @WskComposeArgs run --rm seed
        if ($LASTEXITCODE -ne 0) { throw 'WSK demo seed failed.' }
    }
}
if (-not $NoFrontend) {
    Write-Host 'Run npm ci (first use), then npm run dev in two separate terminals:'
    Write-Host (Join-Path $WskRoot 'frontend')
    Write-Host (Join-Path $WskRoot 'shop')
    Write-Host "If gateway port was customized, set WSK_API_PROXY_TARGET=http://127.0.0.1:$gatewayPort in those terminals."
    Write-Host 'Admin: http://localhost:15173  Website: http://localhost:15174'
    if (-not $NoBrowser) {
        Start-Process 'http://localhost:15173'
        Start-Process 'http://localhost:15174'
    }
}
Write-Host "WSK API: http://localhost:$gatewayPort"
