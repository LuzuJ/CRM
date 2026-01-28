# 🚀 Guía de Integración Backend Completo

## 📋 Resumen

El backend completo está en `back_completo/backend/app/` usando **FastAPI + SQLModel + PostgreSQL**.

### Endpoints Implementados (100% compatibles con Docs/Api.md)

✅ **Documentos**
- `GET /documentos/` - Listar documentos
- `POST /documentos/` - Crear metadatos
- `POST /documentos/{doc_id}/upload` - Subir archivo

✅ **OCR**
- `POST /ocr/procesar/{doc_id}` - Procesar documento con OCR

✅ **Trámites**
- `GET /tramites/` - Listar trámites
- `POST /tramites/{tramite_id}/vincular-documento/{doc_id}` - Vincular documento

✅ **Dashboard**
- `GET /dashboard/resumen` - Obtener resumen
- `POST /dashboard/monitoreo/ejecutar-manual` - Ejecutar monitoreo
- `POST /dashboard/tareas/{tarea_id}/resolver?accion={accion}` - Resolver tarea

---

## 🔧 Instalación y Configuración

### 1. Instalar Dependencias

```bash
cd back_completo

# Crear entorno virtual (recomendado)
python -m venv venv

# Activar entorno virtual
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Instalar dependencias
pip install fastapi uvicorn sqlmodel psycopg2-binary python-multipart
pip install pytesseract pillow opencv-python  # Para OCR
```

### 2. Configurar Base de Datos PostgreSQL

#### Opción A: PostgreSQL Local

```bash
# Crear base de datos
createdb crm_migratorio

# Configurar variable de entorno
# Windows (PowerShell):
$env:DATABASE_URL="postgresql://usuario:password@localhost:5432/crm_migratorio"

# Linux/Mac:
export DATABASE_URL="postgresql://usuario:password@localhost:5432/crm_migratorio"
```

#### Opción B: PostgreSQL en Render/Neon/Supabase

```bash
# Obtener la URL de conexión desde tu proveedor
# Ejemplo:
$env:DATABASE_URL="postgresql://user:pass@host.render.com/dbname"
```

### 3. Iniciar el Backend

```bash
cd back_completo

# Iniciar servidor (desde la raíz de back_completo)
uvicorn backend.app.main:app --reload --port 8000
```

El servidor estará disponible en: `http://127.0.0.1:8000`

Documentación API: `http://127.0.0.1:8000/docs`

---

## 🔗 Configuración del Frontend

### 1. Crear/Actualizar archivo `.env`

```bash
# En la raíz del proyecto (no en back_completo)
# Archivo: .env

# URL del backend
VITE_API_URL=http://127.0.0.1:8000

# Usar backend real (no mock)
VITE_USE_MOCK=false
```

### 2. Verificar Servicios del Frontend

Los servicios ya están configurados en `src/services/`:
- ✅ `documentService.js` → `/documentos/*`
- ✅ `ocrService.js` → `/ocr/*`
- ✅ `caseService.js` → `/tramites/*`
- ✅ `dashboardService.js` → `/dashboard/*`

### 3. Iniciar Frontend

```bash
# En la raíz del proyecto
npm run dev
```

---

## 🧪 Probar la Integración

### 1. Verificar Backend

```bash
# Abrir navegador en:
http://127.0.0.1:8000/docs

# Probar endpoint básico:
curl http://127.0.0.1:8000/
# Debe retornar: {"mensaje": "Sistema Migratorio Activo", "version": "1.0.0"}
```

### 2. Verificar Frontend

```bash
# Abrir navegador en:
http://localhost:5173

# En la consola del navegador (F12), deberías ver:
# - Llamadas HTTP a http://127.0.0.1:8000
# - Sin errores CORS
```

---

## 📊 Estructura del Backend

```
back_completo/
├── backend/
│   └── app/
│       ├── main.py              # Aplicación principal
│       ├── database.py          # Conexión PostgreSQL
│       ├── models.py            # Modelos SQLModel
│       ├── routers/
│       │   ├── documentos.py    # Endpoints documentos
│       │   ├── ocr.py           # Endpoints OCR
│       │   ├── tramites.py      # Endpoints trámites
│       │   └── dashboard.py     # Endpoints dashboard
│       └── services/
│           ├── tramite_service.py
│           ├── ocr_service.py
│           ├── monitoreo_service.py
│           └── validacion_service.py
├── src/                         # Lógica de negocio (legacy)
├── tests/                       # Tests BDD con Behave
└── requirements.txt
```

---

## 🔄 Flujo de Integración Completo

### Ejemplo: Vincular Documento a Trámite

```javascript
// Frontend (src/pages/MailroomPage.jsx)
import { caseService } from '../services';

await caseService.linkDocument('TR-A01', 'DOC-001');
```

```
↓ HTTP Request
POST http://127.0.0.1:8000/tramites/TR-A01/vincular-documento/DOC-001
```

```python
# Backend (backend/app/routers/tramites.py)
@router.post("/{tramite_id}/vincular-documento/{doc_id}")
def vincular_documento(tramite_id: str, doc_id: str):
    service = TramiteService(session)
    return service.vincular_documento(tramite_id, doc_id)
```

```
↓ Database (PostgreSQL)
UPDATE documento SET estado='RECIBIDO', id_tramite='TR-A01' WHERE id='DOC-001'
```

---

## 🐛 Solución de Problemas

### Error: "Cannot connect to database"

```bash
# Verificar que PostgreSQL esté corriendo
# Verificar variable de entorno DATABASE_URL
echo $env:DATABASE_URL  # Windows PowerShell
echo $DATABASE_URL      # Linux/Mac

# Crear la base de datos si no existe
createdb crm_migratorio
```

### Error: "CORS policy"

El backend ya tiene CORS configurado en `main.py`. Si persiste el error:

```python
# backend/app/main.py
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Vite dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Error: "Module not found: OCRService"

```bash
# Instalar dependencias de OCR
pip install pytesseract pillow opencv-python

# Instalar Tesseract OCR
# Windows: https://github.com/UB-Mannheim/tesseract/wiki
# Linux: sudo apt-get install tesseract-ocr
# Mac: brew install tesseract
```

---

## 📝 Archivos de Configuración

### `back_completo/.env` (crear este archivo)

```bash
# Base de datos
DATABASE_URL=postgresql://usuario:password@localhost:5432/crm_migratorio

# Entorno
ENVIRONMENT=development

# Rutas
UPLOAD_DIR=uploads
TEMP_DIR=temp
```

### Raíz del proyecto `.env`

```bash
# Backend URL
VITE_API_URL=http://127.0.0.1:8000

# Modo
VITE_USE_MOCK=false  # Usar backend real
```

---

## ✅ Checklist de Integración

- [ ] PostgreSQL instalado y corriendo
- [ ] Base de datos `crm_migratorio` creada
- [ ] Variable `DATABASE_URL` configurada
- [ ] Dependencias instaladas (`pip install ...`)
- [ ] Backend corriendo en puerto 8000
- [ ] Frontend `.env` configurado con `VITE_USE_MOCK=false`
- [ ] Frontend corriendo en puerto 5173
- [ ] Documentación API accesible en `/docs`
- [ ] Sin errores CORS en consola del navegador

---

## 🚀 Despliegue en Producción

### Backend (Render/Railway/Fly.io)

```bash
# Añadir a requirements.txt
fastapi
uvicorn[standard]
sqlmodel
psycopg2-binary
python-multipart
pytesseract
pillow
opencv-python

# Comando de inicio:
uvicorn backend.app.main:app --host 0.0.0.0 --port $PORT
```

### Frontend (Render/Netlify/Vercel)

```bash
# Actualizar .env para producción
VITE_API_URL=https://tu-backend.onrender.com
VITE_USE_MOCK=false
```

---

## 📚 Recursos Adicionales

- **FastAPI Docs**: https://fastapi.tiangolo.com
- **SQLModel Docs**: https://sqlmodel.tiangolo.com
- **PostgreSQL**: https://www.postgresql.org/docs/
- **Tesseract OCR**: https://github.com/tesseract-ocr/tesseract

---

**Última actualización:** 28 de Enero de 2026
**Estado:** ✅ Backend completo e integrado
