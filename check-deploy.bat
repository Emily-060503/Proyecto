@echo off
echo ========================================
echo   VERIFICACION PRE-DESPLIEGUE
echo ========================================
echo.

echo [1/6] Verificando Node.js...
node --version
if %errorlevel% neq 0 (
    echo ERROR: Node.js no esta instalado
    exit /b 1
)
echo OK - Node.js instalado
echo.

echo [2/6] Verificando dependencias...
if not exist "node_modules\" (
    echo ADVERTENCIA: node_modules no existe. Ejecuta: npm install
) else (
    echo OK - node_modules existe
)
echo.

echo [3/6] Verificando archivos criticos...
if not exist "index.js" (
    echo ERROR: index.js no encontrado
    exit /b 1
)
echo OK - index.js existe

if not exist "package.json" (
    echo ERROR: package.json no encontrado
    exit /b 1
)
echo OK - package.json existe

if not exist ".env" (
    echo ADVERTENCIA: .env no encontrado (necesario para desarrollo local)
) else (
    echo OK - .env existe
)

if not exist ".env.example" (
    echo ADVERTENCIA: .env.example no encontrado
) else (
    echo OK - .env.example existe
)
echo.

echo [4/6] Verificando .gitignore...
if not exist ".gitignore" (
    echo ADVERTENCIA: .gitignore no encontrado
) else (
    findstr /C:".env" .gitignore >nul
    if %errorlevel% equ 0 (
        echo OK - .env esta en .gitignore
    ) else (
        echo ADVERTENCIA: .env NO esta en .gitignore
    )
)
echo.

echo [5/6] Verificando estructura de carpetas...
if exist "views\" (
    echo OK - Carpeta views existe
) else (
    echo ERROR: Carpeta views no existe
    exit /b 1
)

if exist "public\" (
    echo OK - Carpeta public existe
) else (
    echo ADVERTENCIA: Carpeta public no existe
)
echo.

echo [6/6] Estado de Git...
git status >nul 2>&1
if %errorlevel% equ 0 (
    echo OK - Repositorio Git inicializado
    echo.
    echo Archivos sin commit:
    git status --short
) else (
    echo ADVERTENCIA: No es un repositorio Git
    echo Ejecuta: git init
)
echo.

echo ========================================
echo   RESUMEN
echo ========================================
echo.
echo Proximos pasos:
echo 1. Asegurate de tener cuenta en Render.com
echo 2. Sube tu codigo a GitHub
echo 3. Lee DEPLOY.md para instrucciones completas
echo 4. Configura las variables de entorno en Render
echo.
echo Variables que necesitas configurar en Render:
echo - FIREBASE_API_KEY
echo - FIREBASE_AUTH_DOMAIN
echo - FIREBASE_PROJECT_ID
echo - FIREBASE_STORAGE_BUCKET
echo - FIREBASE_MESSAGING_SENDER_ID
echo - FIREBASE_APP_ID
echo - FIREBASE_MEASUREMENT_ID
echo - NODE_ENV=production
echo.
echo Copia los valores desde tu archivo .env local
echo.

pause
