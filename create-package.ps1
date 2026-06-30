# Script para crear paquete de despliegue limpio
Write-Host "--- Creando Paquete de Despliegue (Sin CÃ³digo Fuente) ---" -ForegroundColor Cyan

$deployDir = "DEPLOY_PACKAGE"

# 1. Limpiar carpeta anterior
if (Test-Path $deployDir) { 
    Write-Host "Limpiando version anterior..."
    Remove-Item -Recurse -Force $deployDir 
}
New-Item -ItemType Directory -Path $deployDir

# 2. Copiar lo esencial del Backend
Write-Host "Copiando archivos compilados del Backend..."
if (Test-Path "backend/dist") {
    Copy-Item -Path "backend/dist" -Destination "$deployDir/dist" -Recurse
}
else {
    Write-Host "ERROR: No se encuentra backend/dist. Ejecuta ./build-unified.ps1 primero." -ForegroundColor Red
    exit
}

Write-Host "Copiando archivos estaticos del Frontend (client)..."
if (Test-Path "backend/client") {
    Copy-Item -Path "backend/client" -Destination "$deployDir/client" -Recurse
}

Write-Host "Copiando archivos de configuracion..."
Copy-Item -Path "backend/package.json" -Destination "$deployDir/"
Copy-Item -Path "backend/package-lock.json" -Destination "$deployDir/"

if (Test-Path "backend/.env") { 
    Copy-Item -Path "backend/.env" -Destination "$deployDir/" 
    # Forzar puerto 3032
    (Get-Content "$deployDir/.env") -replace 'PORT=\d+', 'PORT=3032' | Set-Content "$deployDir/.env"
}
else {
    Set-Content -Path "$deployDir/.env" -Value "PORT=3032"
}

Write-Host "`nÂ¡Paquete generado con exito en '$deployDir'!" -ForegroundColor Green
Write-Host "INSTRUCCIONES PARA EL VPS:" -ForegroundColor Yellow
Write-Host "1. Sube el contenido de '$deployDir' al servidor."
Write-Host "2. En el servidor, ejecuta: npm install --production"
Write-Host "3. Asegurate de que el puerto en .env sea 3032"
Write-Host "4. Inicia el ejecutable con: pm2 start dist/main.js --name unoa-pedidos"
