$ErrorActionPreference = 'Stop'

$containerName = 'ppij-postgres'

$dockerCommand = Get-Command docker -ErrorAction SilentlyContinue

if ($null -eq $dockerCommand) {
    throw 'Docker is not installed or is not available on PATH.'
}

$existingContainerId = docker ps -aq --filter "name=^${containerName}$"

if ([string]::IsNullOrWhiteSpace($existingContainerId)) {
    throw "PostgreSQL container '$containerName' does not exist."
}

docker logs $containerName

if ($LASTEXITCODE -ne 0) {
    throw "Failed to read logs for PostgreSQL container '$containerName'."
}
