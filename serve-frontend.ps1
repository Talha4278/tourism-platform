# PowerShell script to serve the frontend files
Write-Host "Starting simple HTTP server for frontend..." -ForegroundColor Green
Write-Host "Make sure the ASP.NET Core API is running on https://localhost:5001" -ForegroundColor Yellow

# Check if Python is available
$pythonCmd = $null
if (Get-Command python -ErrorAction SilentlyContinue) {
    $pythonCmd = "python"
} elseif (Get-Command python3 -ErrorAction SilentlyContinue) {
    $pythonCmd = "python3"
}

if ($pythonCmd) {
    Write-Host "Using Python HTTP server..." -ForegroundColor Cyan
    Write-Host "Frontend will be available at: http://localhost:8000" -ForegroundColor Green
    Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Red
    & $pythonCmd -m http.server 8000
} else {
    Write-Host "Python not found. Please install Python or use any other web server to serve the files." -ForegroundColor Red
    Write-Host "Alternatively, you can:" -ForegroundColor Yellow
    Write-Host "1. Use Live Server extension in VS Code" -ForegroundColor Yellow
    Write-Host "2. Use any other local web server" -ForegroundColor Yellow
    Write-Host "3. Open index.html directly in browser (may have CORS issues)" -ForegroundColor Yellow
}
