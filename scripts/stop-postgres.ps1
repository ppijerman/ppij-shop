$ErrorActionPreference = 'Stop'

$containerName = 'ppij-postgres'

$dockerCommand = Get-Command docker -ErrorAction SilentlyContinue

if ($null -eq $dockerCommand) {
    throw 'Docker is not installed or is not available on PATH.'
}

$runningContainerId = docker ps -q --filter "name=^${containerName}$"

if ([string]::IsNullOrWhiteSpace($runningContainerId)) {
    Write-Host "PostgreSQL container '$containerName' is not running."
    exit 0
}

Write-Host "Stopping PostgreSQL container '$containerName'..."
docker stop $containerName | Out-Null

if ($LASTEXITCODE -ne 0) {
    throw "Failed to stop PostgreSQL container '$containerName'."
}

Write-Host "PostgreSQL container '$containerName' stopped."
