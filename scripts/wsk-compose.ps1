#Requires -Version 5.1
# Dot-source this helper; never read the original project's .env or project name.
$WskRoot = Split-Path -Parent $PSScriptRoot
$WskEnvFile = Join-Path $WskRoot '.env.wsk'
$WskComposeArgs = @('compose', '--env-file', $WskEnvFile, '-f', (Join-Path $WskRoot 'docker-compose.yml'), '-p', 'wsk-auto')

function Get-WskConfig {
    $json = & docker @WskComposeArgs config --format json
    if ($LASTEXITCODE -ne 0) { throw 'WSK compose configuration is invalid.' }
    $config = ($json -join "`n") | ConvertFrom-Json
    if ($config.name -ne 'wsk-auto') { throw 'Unexpected Compose project.' }
    return $config
}
