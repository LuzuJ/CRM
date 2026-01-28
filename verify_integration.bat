@echo off
REM Script de verificación de integración Backend-Frontend

echo ========================================
echo   Verificación de Integración
echo   Backend Completo + Frontend
echo ========================================
echo.

REM Verificar si Python está instalado
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python no está instalado
    echo Por favor instala Python 3.8 o superior
    pause
    exit /b 1
)
echo [OK] Python instalado

REM Verificar si Node.js está instalado
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js no está instalado
    echo Por favor instala Node.js 18 o superior
    pause
    exit /b 1
)
echo [OK] Node.js instalado

REM Verificar si PostgreSQL está corriendo
pg_isready >nul 2>&1
if %errorlevel% neq 0 (
    echo [ADVERTENCIA] PostgreSQL no está corriendo o no está en PATH
    echo Asegúrate de que PostgreSQL esté instalado y corriendo
)

REM Verificar archivo .env en raíz
if not exist ".env" (
    echo [ADVERTENCIA] Archivo .env no encontrado en la raíz
    echo Copiando desde .env.example...
    copy .env.example .env >nul
)
echo [OK] Archivo .env presente

REM Verificar configuración del backend
if not exist "back_completo\.env" (
    echo [INFO] Creando .env para el backend...
    copy back_completo\.env.example back_completo\.env >nul
)

REM Verificar dependencias del frontend
if not exist "node_modules" (
    echo [INFO] Instalando dependencias del frontend...
    call npm install
)
echo [OK] Dependencias del frontend instaladas

REM Verificar archivos clave del backend
if not exist "back_completo\backend\app\main.py" (
    echo [ERROR] main.py no encontrado en back_completo\backend\app\
    pause
    exit /b 1
)
echo [OK] Estructura del backend verificada

REM Verificar servicios del frontend
if not exist "src\services\documentService.js" (
    echo [ERROR] Servicios del frontend no encontrados
    pause
    exit /b 1
)
echo [OK] Servicios del frontend verificados

echo.
echo ========================================
echo   VERIFICACIÓN COMPLETADA
echo ========================================
echo.
echo Siguientes pasos:
echo.
echo 1. Backend:
echo    - Configurar DATABASE_URL en back_completo\.env
echo    - Ejecutar: cd back_completo ^& start_backend.bat
echo.
echo 2. Frontend:
echo    - Verificar VITE_API_URL en .env
echo    - Ejecutar: npm run dev
echo.
echo 3. Verificar integración:
echo    - Backend: http://127.0.0.1:8000/docs
echo    - Frontend: http://localhost:5173
echo.
pause
