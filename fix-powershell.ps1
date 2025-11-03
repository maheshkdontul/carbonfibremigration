# Script to fix PowerShell execution policy issue
# This will allow npm and other scripts to run

Write-Host "Checking current execution policy..." -ForegroundColor Yellow

# Check current policy
$currentPolicy = Get-ExecutionPolicy
Write-Host "Current execution policy: $currentPolicy" -ForegroundColor Cyan

# Set execution policy for current user (doesn't require admin)
Write-Host ""
Write-Host "Setting execution policy to RemoteSigned for CurrentUser..." -ForegroundColor Green
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser -Force

# Verify the change
$newPolicy = Get-ExecutionPolicy -Scope CurrentUser
Write-Host ""
Write-Host "New execution policy: $newPolicy" -ForegroundColor Green
Write-Host ""
Write-Host "You can now run 'npm run dev' successfully!" -ForegroundColor Green
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

