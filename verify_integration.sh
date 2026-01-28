#!/bin/bash
# Script de verificación de integración Backend-Frontend

echo "========================================"
echo "  Verificación de Integración"
echo "  Backend Completo + Frontend"
echo "========================================"
echo ""

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Verificar Python
if command -v python3 &> /dev/null; then
    echo -e "${GREEN}[OK]${NC} Python instalado: $(python3 --version)"
else
    echo -e "${RED}[ERROR]${NC} Python no está instalado"
    exit 1
fi

# Verificar Node.js
if command -v node &> /dev/null; then
    echo -e "${GREEN}[OK]${NC} Node.js instalado: $(node --version)"
else
    echo -e "${RED}[ERROR]${NC} Node.js no está instalado"
    exit 1
fi

# Verificar PostgreSQL
if command -v psql &> /dev/null; then
    echo -e "${GREEN}[OK]${NC} PostgreSQL instalado"
else
    echo -e "${YELLOW}[ADVERTENCIA]${NC} PostgreSQL no encontrado en PATH"
fi

# Verificar archivo .env en raíz
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}[INFO]${NC} Creando .env desde .env.example..."
    cp .env.example .env
fi
echo -e "${GREEN}[OK]${NC} Archivo .env presente"

# Verificar configuración del backend
if [ ! -f "back_completo/.env" ]; then
    echo -e "${YELLOW}[INFO]${NC} Creando .env para el backend..."
    cp back_completo/.env.example back_completo/.env
fi

# Verificar dependencias del frontend
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}[INFO]${NC} Instalando dependencias del frontend..."
    npm install
fi
echo -e "${GREEN}[OK]${NC} Dependencias del frontend instaladas"

# Verificar estructura del backend
if [ ! -f "back_completo/backend/app/main.py" ]; then
    echo -e "${RED}[ERROR]${NC} main.py no encontrado"
    exit 1
fi
echo -e "${GREEN}[OK]${NC} Estructura del backend verificada"

# Verificar servicios del frontend
if [ ! -f "src/services/documentService.js" ]; then
    echo -e "${RED}[ERROR]${NC} Servicios del frontend no encontrados"
    exit 1
fi
echo -e "${GREEN}[OK]${NC} Servicios del frontend verificados"

echo ""
echo "========================================"
echo "  VERIFICACIÓN COMPLETADA"
echo "========================================"
echo ""
echo "Siguientes pasos:"
echo ""
echo "1. Backend:"
echo "   - Configurar DATABASE_URL en back_completo/.env"
echo "   - Ejecutar: cd back_completo && ./start_backend.sh"
echo ""
echo "2. Frontend:"
echo "   - Verificar VITE_API_URL en .env"
echo "   - Ejecutar: npm run dev"
echo ""
echo "3. Verificar integración:"
echo "   - Backend: http://127.0.0.1:8000/docs"
echo "   - Frontend: http://localhost:5173"
echo ""
