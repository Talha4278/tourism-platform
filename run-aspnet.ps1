# PowerShell script to run the ASP.NET Core application
Write-Host "Starting ASP.NET Core Tourism Platform..." -ForegroundColor Green

# Change to the API directory
Set-Location "TourismPlatform.API"

# Restore packages
Write-Host "Restoring NuGet packages..." -ForegroundColor Yellow
dotnet restore

# Build the project
Write-Host "Building the project..." -ForegroundColor Yellow
dotnet build

# Run the application
Write-Host "Starting the application on https://localhost:5001 and http://localhost:5000..." -ForegroundColor Green
Write-Host "Swagger UI will be available at: https://localhost:5001/swagger" -ForegroundColor Cyan
Write-Host "Press Ctrl+C to stop the application" -ForegroundColor Red

dotnet run
