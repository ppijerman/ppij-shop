$ErrorActionPreference = 'Stop'

$containerName = 'ppij-postgres'
$databaseName = 'ppij_shop'
$databaseUser = 'postgres'
$databasePassword = 'password'
$databasePort = '5433'
$imageName = 'postgres:16'

$dockerCommand = Get-Command docker -ErrorAction SilentlyContinue

if ($null -eq $dockerCommand) {
    throw 'Docker is not installed or is not available on PATH.'
}

$existingContainerId = docker ps -aq --filter "name=^${containerName}$"

if ([string]::IsNullOrWhiteSpace($existingContainerId)) {
    Write-Host "Creating PostgreSQL container '$containerName'..."

    docker run `
        --name $containerName `
        --env "POSTGRES_USER=$databaseUser" `
        --env "POSTGRES_PASSWORD=$databasePassword" `
        --env "POSTGRES_DB=$databaseName" `
        --publish "${databasePort}:5432" `
        --detach `
        $imageName

    if ($LASTEXITCODE -ne 0) {
        throw "Failed to create PostgreSQL container '$containerName'."
    }

    Write-Host "PostgreSQL container '$containerName' created."
    exit 0
}

$runningContainerId = docker ps -q --filter "name=^${containerName}$"

if ([string]::IsNullOrWhiteSpace($runningContainerId)) {
    Write-Host "Starting PostgreSQL container '$containerName'..."
    docker start $containerName | Out-Null

    if ($LASTEXITCODE -ne 0) {
        throw "Failed to start PostgreSQL container '$containerName'."
    }

    Write-Host "PostgreSQL container '$containerName' started."
    exit 0
}

Write-Host "PostgreSQL container '$containerName' is already running."
