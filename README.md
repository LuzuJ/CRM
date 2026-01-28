# 🏢 CRM Legal Migration - Sistema de Gestión Migratoria

Sistema completo de gestión de trámites migratorios con **Frontend React + Backend FastAPI + PostgreSQL**.

[![Estado](https://img.shields.io/badge/Estado-Producción%20Ready-success)](.)
[![Backend](https://img.shields.io/badge/Backend-FastAPI-009688)](./back_completo)
[![Frontend](https://img.shields.io/badge/Frontend-React%2018-61DAFB)](./src)
[![Integración](https://img.shields.io/badge/Integración-100%25-brightgreen)](./BACKEND_FRONTEND_INTEGRATION_STATUS.md)

## 🚀 Inicio Rápido

### 1️⃣ Verificar Integración

```bash
# Windows
verify_integration.bat

# Linux/Mac
chmod +x verify_integration.sh
./verify_integration.sh
```

### 2️⃣ Iniciar Backend

```bash
cd back_completo

# Windows
start_backend.bat

# Linux/Mac  
chmod +x start_backend.sh
./start_backend.sh
```

### 3️⃣ Iniciar Frontend

```bash
# En la raíz del proyecto
npm run dev
```

**Acceder a:**
- 🌐 Frontend: http://localhost:5173
- 📚 API Docs: http://127.0.0.1:8000/docs
- 🔧 API: http://127.0.0.1:8000

---

## 🎯 Tecnologías

- **Frontend**: React 18 + Vite
- **Estilos**: TailwindCSS
- **Routing**: React Router DOM
- **HTTP Client**: Axios (con opción de migrar a Fetch)
- **Icons**: Material Symbols

## 📦 Instalación

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# Compilar para producción
npm run build
```

## 🎯 Estructura del Proyecto

```
src/
├── components/          # Componentes reutilizables
│   ├── Sidebar.jsx
│   ├── Header.jsx
│   ├── Layout.jsx
│   ├── Toast.jsx
│   └── LoadingSpinner.jsx
├── pages/              # Páginas principales
│   ├── DashboardPage.jsx
│   ├── MailroomPage.jsx           # Clasificación de documentos
│   ├── OCRExtractionPage.jsx     # Extracción OCR
│   ├── CompliancePage.jsx         # Validación legal
│   └── AppointmentsPage.jsx       # Agendamiento de citas
├── services/           # Servicios de API
│   ├── api.js                     # Configuración de Axios
│   └── index.js                   # Servicios por módulo
├── App.jsx             # Componente principal
├── main.jsx            # Punto de entrada
└── index.css           # Estilos globales
```

## 🔌 Backend y CORS

El proyecto está configurado para conectarse a un backend Python. El servidor backend debe:

1. **Activar CORS** para permitir peticiones desde el frontend:

```python
# Ejemplo con FastAPI
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

2. **Endpoints implementados** (basados en escenarios):

### Documentos (Escenario 1.1)
- `GET /api/documents/pending` - Listar documentos pendientes
- `POST /api/documents/:id/link` - Vincular documento a trámite
- `GET /api/cases/:id/documents` - Documentos de un trámite
- `PATCH /api/documents/:id/status` - Actualizar estado

### OCR (Escenario 1.2)
- `POST /api/ocr/process/:id` - Procesar documento
- `GET /api/ocr/results/:id` - Obtener resultados
- `PUT /api/ocr/manual-update/:id` - Actualización manual
- `POST /api/ocr/manual-review/:id` - Marcar para revisión

### Validación Legal (Escenario 1.3)
- `POST /api/validation/profile/:id` - Validar perfil
- `GET /api/validation/status/:id` - Estado de validación
- `GET /api/validation/civil-registry/:cedula` - Consultar Registro Civil
- `GET /api/validation/migration-police/:cedula` - Consultar Policía
- `POST /api/validation/manual-approve/:id` - Aprobar manualmente

### Citas (Escenario 2.1)
- `GET /api/appointments/availability` - Ver disponibilidad
- `POST /api/appointments` - Crear cita
- `PUT /api/appointments/:id/reschedule` - Reagendar
- `DELETE /api/appointments/:id` - Cancelar cita

## 🔄 Migración de Axios a Fetch

Si necesitas cambiar de Axios a Fetch, el código ya incluye una función `fetchAPI` comentada en `src/services/api.js`. 

Para migrar:

1. Descomentar la función `fetchAPI` en `api.js`
2. Reemplazar las llamadas de los servicios:

```javascript
// Antes (Axios)
export const documentService = {
  getPendingDocuments: () => api.get('/documents/pending'),
};

// Después (Fetch)
export const documentService = {
  getPendingDocuments: () => fetchAPI('/documents/pending'),
};
```

## 📱 Funcionalidades Implementadas

### ✅ Digital Mailroom Classification
- Visualización de documentos pendientes
- Vinculación de documentos a trámites activos
- Validación de estado de trámites
- Prevención de vinculación duplicada

### ✅ OCR Intelligent Extraction
- Procesamiento automático con OCR
- Detección de baja confianza
- Entrada manual cuando falla OCR
- Resaltado de campos con problemas

### ✅ Legal Compliance Dashboard
- Validación contra Registro Civil
- Verificación de impedimentos migratorios
- Manejo de errores de servicios externos
- Validación manual por evidencia física

### ✅ Intelligent Appointment Scheduler
- Visualización de disponibilidad
- Creación de citas
- Validación de estado legal
- Cancelación y reagendamiento

## 🎨 Personalización

### Colores (tailwind.config.js)
```javascript
colors: {
  "primary": "#2a67b2",           // Azul principal
  "primary-dark": "#1e4b85",      // Azul oscuro
  "primary-light": "#eef4fb",     // Azul claro
  // ... más colores
}
```

### Fuentes
- Display: Manrope (títulos y navegación)
- Body: Noto Sans (contenido)

## 🔐 Autenticación

El sistema está preparado para usar JWT. El interceptor de Axios automáticamente:
- Agrega el token a las peticiones
- Maneja errores 401 (no autorizado)
- Redirige al login cuando expira la sesión

## 📝 Datos Mock

Actualmente el sistema usa datos mock basados en los escenarios de prueba. Para conectar con el backend real:

1. Descomentar las llamadas a servicios en cada página
2. Comentar/eliminar los datos mock
3. Asegurar que el backend esté corriendo en `http://localhost:8000`

## 🚦 Proxy de Desarrollo

Vite está configurado para hacer proxy de `/api` al backend:

```javascript
// vite.config.js
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:8000',
      changeOrigin: true,
    }
  }
}
```

Cambia el `target` si tu backend usa otro puerto.

## 🐛 Debugging

- Chrome DevTools: Network tab para ver peticiones
- Console para logs de errores
- React DevTools para inspeccionar componentes

## 📄 Licencia

Proyecto académico - Universidad - Verificación y Validación
