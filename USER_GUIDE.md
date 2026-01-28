# 🎯 Guía de Uso Completa - CRM Legal Migration

## 📋 Tabla de Contenidos

1. [Configuración Inicial](#configuración-inicial)
2. [Iniciar el Sistema](#iniciar-el-sistema)
3. [Uso de las Funcionalidades](#uso-de-las-funcionalidades)
4. [Solución de Problemas](#solución-de-problemas)
5. [Despliegue en Producción](#despliegue-en-producción)

---

## 🔧 Configuración Inicial

### Requisitos Previos

- ✅ Python 3.8+ instalado
- ✅ Node.js 18+ instalado
- ✅ PostgreSQL 14+ instalado y corriendo
- ✅ Git instalado

### Paso 1: Clonar y Configurar

```bash
# 1. Clonar el repositorio (si aún no lo has hecho)
git clone <tu-repo-url>
cd CRM

# 2. Ejecutar script de verificación
# Windows:
verify_integration.bat

# Linux/Mac:
chmod +x verify_integration.sh
./verify_integration.sh
```

### Paso 2: Configurar Base de Datos

```bash
# Crear base de datos PostgreSQL
createdb vortex_crm

# O usando psql:
psql -U postgres
CREATE DATABASE vortex_crm;
\q
```

### Paso 3: Configurar Variables de Entorno

#### Backend (`back_completo/.env`)

```bash
cd back_completo
cp .env.example .env
```

Editar `back_completo/.env`:
```bash
DATABASE_URL=postgresql://postgres:tu_password@localhost:5432/vortex_crm
ENVIRONMENT=development
UPLOAD_DIR=uploads
TEMP_DIR=temp
```

#### Frontend (`.env` en raíz)

```bash
# Ya existe el archivo .env, verificar:
VITE_API_URL=http://127.0.0.1:8000
VITE_USE_MOCK=false
```

---

## 🚀 Iniciar el Sistema

### Opción A: Inicio Automático (Recomendado)

#### Windows

```bash
# Terminal 1 - Backend
cd back_completo
start_backend.bat

# Terminal 2 - Frontend
npm run dev
```

#### Linux/Mac

```bash
# Terminal 1 - Backend
cd back_completo
chmod +x start_backend.sh
./start_backend.sh

# Terminal 2 - Frontend
npm run dev
```

### Opción B: Inicio Manual

#### Backend

```bash
cd back_completo

# Activar entorno virtual
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Instalar dependencias (primera vez)
pip install -r backend/requirements.txt

# Configurar variable de entorno
# Windows PowerShell:
$env:DATABASE_URL="postgresql://postgres:password@localhost:5432/vortex_crm"
# Linux/Mac:
export DATABASE_URL="postgresql://postgres:password@localhost:5432/vortex_crm"

# Iniciar servidor
uvicorn backend.app.main:app --reload --port 8000
```

#### Frontend

```bash
# En la raíz del proyecto

# Instalar dependencias (primera vez)
npm install

# Iniciar servidor de desarrollo
npm run dev
```

### Verificar que Todo Funciona

✅ **Backend:**
- Abrir: http://127.0.0.1:8000/docs
- Deberías ver la documentación interactiva de FastAPI

✅ **Frontend:**
- Abrir: http://localhost:5173
- Deberías ver el login del sistema

✅ **Integración:**
- Abrir consola del navegador (F12)
- No deberían aparecer errores CORS
- Al hacer login, debería aparecer el dashboard

---

## 📱 Uso de las Funcionalidades

### 1. Login

```
Usuario: admin
Contraseña: admin123

O

Usuario: cliente
Contraseña: cliente123
```

### 2. Digital Mailroom (Clasificación de Documentos)

**Objetivo:** Vincular documentos a trámites

1. Ir a **Digital Mailroom** en el menú
2. Seleccionar un documento pendiente
3. Elegir un trámite activo
4. Hacer clic en "Vincular Documento"

**Flujo Backend:**
```
Frontend → POST /tramites/{id}/vincular-documento/{doc_id}
Backend → Actualiza estado del documento a "RECIBIDO"
PostgreSQL → UPDATE documento SET estado='RECIBIDO', id_tramite='...'
```

### 3. OCR Extraction (Procesamiento Inteligente)

**Objetivo:** Extraer datos de documentos automáticamente

1. Ir a **OCR Extraction**
2. Seleccionar un documento de la cola
3. Hacer clic en "Procesar"
4. Ver los datos extraídos
5. Si hay baja confianza, corregir manualmente

**Flujo Backend:**
```
Frontend → POST /ocr/procesar/{doc_id} + archivo
Backend → Procesa con Tesseract OCR
Backend → Extrae campos (Cédula, Nombres, etc.)
PostgreSQL → UPDATE documento SET datos_extraidos={...}
```

### 4. Legal Compliance (Validación Legal)

**Objetivo:** Validar perfiles migratorios

1. Ir a **Legal Compliance**
2. Seleccionar un perfil
3. Hacer clic en "Validar"
4. Ver resultados de validación (Registro Civil, Policía Migración)

### 5. Intelligent Scheduler (Agendamiento de Citas)

**Objetivo:** Agendar citas con agentes

1. Ir a **Intelligent Scheduler**
2. Seleccionar un trámite
3. Elegir fecha y hora
4. Seleccionar agente disponible
5. Confirmar cita

### 6. Deadlines Control Tower (Control de Plazos)

**Objetivo:** Monitorear vencimientos

1. Ir a **Deadlines Control**
2. Ver plazos urgentes y próximos
3. Para resolver un vencimiento:
   - Reagendar: Nueva fecha
   - Cancelar: Motivo de cancelación

**Flujo Backend:**
```
Frontend → POST /dashboard/tareas/{id}/resolver?accion=reagendar
Backend → Actualiza evento y tarea
PostgreSQL → UPDATE evento SET fecha_limite='...'
```

---

## 🐛 Solución de Problemas

### Error: "Cannot connect to database"

**Síntomas:**
```
sqlalchemy.exc.OperationalError: could not connect to server
```

**Solución:**
```bash
# 1. Verificar que PostgreSQL esté corriendo
# Windows:
services.msc → Buscar "PostgreSQL" → Iniciar

# Linux:
sudo systemctl start postgresql

# 2. Verificar credenciales
psql -U postgres -d vortex_crm
# Si falla, verificar usuario y contraseña

# 3. Crear base de datos si no existe
createdb vortex_crm
```

### Error: "CORS policy"

**Síntomas:**
```
Access to fetch at 'http://127.0.0.1:8000' has been blocked by CORS policy
```

**Solución:**
```python
# Verificar en back_completo/backend/app/main.py
# Debe tener:
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Error: "Module not found"

**Backend:**
```bash
cd back_completo
pip install -r backend/requirements.txt
```

**Frontend:**
```bash
npm install
```

### Error: "Tesseract not found"

**Síntomas:**
```
TesseractNotFoundError: tesseract is not installed
```

**Solución:**
```bash
# Windows:
# Descargar e instalar: https://github.com/UB-Mannheim/tesseract/wiki
# Agregar a PATH o configurar en .env

# Linux:
sudo apt-get install tesseract-ocr

# Mac:
brew install tesseract
```

### Error: "Port already in use"

**Backend (puerto 8000):**
```bash
# Windows:
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# Linux/Mac:
lsof -ti:8000 | xargs kill -9
```

**Frontend (puerto 5173):**
```bash
# Cambiar puerto en vite.config.js:
export default defineConfig({
  server: { port: 3000 }
})
```

---

## 🚀 Despliegue en Producción

### Backend en Render

1. **Crear Web Service en Render**
   - Build Command: `pip install -r back_completo/backend/requirements.txt`
   - Start Command: `uvicorn backend.app.main:app --host 0.0.0.0 --port $PORT`
   - Root Directory: `back_completo`

2. **Configurar Variables de Entorno**
   ```
   DATABASE_URL=<postgresql-url-de-render>
   ENVIRONMENT=production
   ```

3. **Crear Base de Datos PostgreSQL en Render**
   - Copiar la URL de conexión
   - Pegarla en DATABASE_URL del Web Service

### Frontend en Netlify/Vercel

1. **Configurar Build Settings**
   - Build Command: `npm run build`
   - Publish Directory: `dist`

2. **Variables de Entorno**
   ```
   VITE_API_URL=https://tu-backend.onrender.com
   VITE_USE_MOCK=false
   ```

3. **Deploy**
   - Conectar repositorio
   - Deploy automático

---

## 📊 Monitoreo

### Logs del Backend

```bash
# Ver logs en tiempo real
tail -f backend.log

# O en Render:
# Dashboard → Service → Logs
```

### Métricas

**Backend:**
- Endpoint: http://127.0.0.1:8000/docs
- Healthcheck: http://127.0.0.1:8000/

**Frontend:**
- Verificar en Network tab (F12)
- Todos los requests deben retornar 200 OK

---

## 📚 Recursos Adicionales

- [BACKEND_COMPLETO_SETUP.md](BACKEND_COMPLETO_SETUP.md) - Setup detallado
- [BACKEND_FRONTEND_INTEGRATION_STATUS.md](BACKEND_FRONTEND_INTEGRATION_STATUS.md) - Estado de integración
- [Docs/Api.md](Docs/Api.md) - Especificación de endpoints
- [back_completo/QUICKSTART.md](back_completo/QUICKSTART.md) - Inicio rápido backend

---

## ✅ Checklist de Producción

Antes de desplegar a producción, verificar:

- [ ] Tests BDD pasando (`behave` en `back_completo/tests`)
- [ ] Frontend sin errores de lint (`npm run build`)
- [ ] Variables de entorno configuradas
- [ ] Base de datos PostgreSQL accesible
- [ ] CORS configurado correctamente
- [ ] HTTPS habilitado en producción
- [ ] Logs configurados
- [ ] Backups de base de datos programados

---

**Última actualización:** 28 de Enero de 2026  
**Versión:** 1.0.0  
**Estado:** ✅ Producción Ready
