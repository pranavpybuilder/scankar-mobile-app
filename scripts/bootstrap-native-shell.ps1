param(
  [string]$TempAppName = "SCANkarNativeShell",
  [string]$ReactNativeVersion = "0.72.6"
)

$ErrorActionPreference = "Stop"

Write-Host "Creating temporary React Native shell: $TempAppName ..."
npx @react-native-community/cli@latest init $TempAppName --version $ReactNativeVersion --skip-install

Write-Host "Copying native folders into current project ..."
if (!(Test-Path ".\android")) {
  New-Item -Path ".\android" -ItemType Directory | Out-Null
}
if (!(Test-Path ".\ios")) {
  New-Item -Path ".\ios" -ItemType Directory | Out-Null
}

Get-ChildItem -Path "$TempAppName\android" -Force | Move-Item -Destination ".\android" -Force
Get-ChildItem -Path "$TempAppName\ios" -Force | Move-Item -Destination ".\ios" -Force

Write-Host "Cleaning temporary shell ..."
Remove-Item -Path ".\$TempAppName" -Recurse -Force

Write-Host "Done. Next:"
Write-Host "1) npm install"
Write-Host "2) cd ios; pod install (macOS only)"
Write-Host "3) npm run android or npm run ios"
