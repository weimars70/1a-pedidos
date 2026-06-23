# Script Maestro para Generar Paquete de Producción - UNO-A Pedidos
# Puerto objetivo en el servidor: 3033
Write-Host "--- Iniciando Proceso de Construcción Completo (unoa-pedidos) ---" -ForegroundColor Cyan

$deployDir = "DEPLOY_PACKAGE"

# 1. Limpiar versiones anteriores
if (Test-Path $deployDir) { 
    Write-Host "Limpiando version anterior del paquete..."
    Remove-Item -Recurse -Force $deployDir 
}
New-Item -ItemType Directory -Path $deployDir | Out-Null

# 2. Construir Frontend
Write-Host "`n[1/3] Construyendo Frontend..." -ForegroundColor Yellow
Set-Location frontend

# Limpiar caché de Vite y dist anterior para forzar build limpio
if (Test-Path "dist") { Remove-Item -Recurse -Force "dist" }
if (Test-Path "node_modules/.vite") { Remove-Item -Recurse -Force "node_modules/.vite" }

npm run build
if ($LASTEXITCODE -ne 0) { Write-Host "ERROR: Fallo el build de Frontend" -ForegroundColor Red; Set-Location ..; exit 1 }
Set-Location ..

# 3. Limpiar y Preparar carpeta estática en Backend
Write-Host "`n[2/3] Preparando archivos estaticos en Backend..." -ForegroundColor Yellow
if (Test-Path "backend/client") { Remove-Item -Recurse -Force "backend/client" }
New-Item -ItemType Directory -Path "backend/client" | Out-Null

# Copiar el build del frontend al backend
Copy-Item -Path "frontend/dist/*" -Destination "backend/client" -Recurse

# 4. Construir Backend
Write-Host "`n[3/3] Construyendo Backend..." -ForegroundColor Yellow
Set-Location backend
npm run build
if ($LASTEXITCODE -ne 0) { Write-Host "ERROR: Fallo el build de Backend" -ForegroundColor Red; Set-Location ..; exit 1 }
Set-Location ..

# 5. Ensamblar Paquete Final
Write-Host "`n[OK] Ensamblando paquete final en '$deployDir'..." -ForegroundColor Green

# Copiar archivos compilados (dist) y el frontend embebido (client)
Copy-Item -Path "backend/dist"   -Destination "$deployDir/dist"   -Recurse
Copy-Item -Path "backend/client" -Destination "$deployDir/client" -Recurse

# Copiar archivos de dependencias
Copy-Item -Path "backend/package.json"      -Destination "$deployDir/"
Copy-Item -Path "backend/package-lock.json" -Destination "$deployDir/"

# Copiar .env (¡IMPORTANTE: editar las variables en el VPS antes de iniciar!)
if (Test-Path "backend/.env") { 
    Copy-Item -Path "backend/.env" -Destination "$deployDir/" 
    Write-Host "  ⚠  .env incluido - recuerda ajustar PORT=3033 y credenciales en el VPS" -ForegroundColor Yellow
}

Write-Host "`n====================================================" -ForegroundColor Cyan
Write-Host "¡PROCESO COMPLETADO CON EXITO!" -ForegroundColor Green
Write-Host "Directorio listo: ./$deployDir"
Write-Host "====================================================" -ForegroundColor Cyan
Write-Host "INSTRUCCIONES PARA EL VPS:" -ForegroundColor Yellow
Write-Host "1. Sube TODO el contenido de '$deployDir' al VPS."
Write-Host "2. En el servidor ejecuta:  npm install --production"
Write-Host "3. Asegurate que el .env tenga PORT=3033"
Write-Host "4. Inicia la app con PM2:   pm2 start dist/main.js --name unoa-pedidos"
Write-Host "5. Guarda la config PM2:    pm2 save"
Write-Host "6. Recuerda configurar el proxy inverso (nginx) para el puerto 3033."
