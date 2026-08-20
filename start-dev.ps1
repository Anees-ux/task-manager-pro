# ==============================================================================
# TaskManagerPro - Unified Development Launcher
# Starts ASP.NET Core WebAPI (Port 5172) and Vite React Frontend (Port 5173)
# ==============================================================================

Write-Host ""
Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host "   TaskManagerPro - Autonomous Execution Engine Dev Server       " -ForegroundColor Cyan
Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host "   Backend API  : http://localhost:5172 (Swagger: /swagger)      " -ForegroundColor Green
Write-Host "   Frontend App : http://localhost:5173                         " -ForegroundColor Magenta
Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host ""

Set-Location -Path $PSScriptRoot
npm start
