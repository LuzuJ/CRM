# Guía de Integración con el Backend

## 🔧 Configuración Inicial

El frontend está ahora preparado para conectarse con el backend siguiendo las especificaciones de `Docs/Api.md`.

### 1. Configurar la URL del Backend

Edita el archivo `.env` en la raíz del proyecto:

```bash
# Modo de desarrollo (usar backend local)
VITE_API_URL=http://127.0.0.1:8000

# Modo de producción (usar backend desplegado)
# VITE_API_URL=https://api.crm-migratorio.com

# Usar datos mock (true) o backend real (false)
VITE_USE_MOCK=true
```

### 2. Iniciar el Backend

Asegúrate de que el backend esté corriendo en `http://127.0.0.1:8000`:

```bash
cd back_incompleto
uvicorn src.api:app --reload --port 8000
```

### 3. Alternar entre Mock y Backend Real

Para cambiar entre datos de prueba y backend real, modifica el `.env`:

```bash
# Usar backend real
VITE_USE_MOCK=false

# Usar datos mock (desarrollo sin backend)
VITE_USE_MOCK=true
```

---

## 📁 Estructura de Servicios

### Servicios Creados (alineados con Api.md)

#### `documentService.js`
```javascript
import { documentService } from './services';

// Crear metadatos del documento
await documentService.createDocument({
  id: "DOC-XYZ",
  nombre_archivo: "pasaporte.pdf",
  tipo: "Pasaporte",
  categoria: "Identificación",
  estado: "EN ESPERA"
});

// Subir archivo físico
await documentService.uploadFile('DOC-XYZ', file);

// Listar documentos
const docs = await documentService.listDocuments();
```

#### `ocrService.js`
```javascript
import { ocrService } from './services';

// Procesar documento con OCR
const result = await ocrService.processDocument('DOC-001', file);
// Resultado: { status: 'ok', datos: {...}, confianza: 0.95 }
```

#### `caseService.js`
```javascript
import { caseService } from './services';

// Listar trámites
const tramites = await caseService.listCases();

// Vincular documento
await caseService.linkDocument('TR-A01', 'DOC-001');
```

#### `dashboardService.js`
```javascript
import { dashboardService } from './services';

// Obtener resumen
const resumen = await dashboardService.getSummary();

// Ejecutar monitoreo manual
await dashboardService.executeMonitoring();

// Resolver tarea
await dashboardService.reagendarTarea('tarea-1', '2026-10-20');
await dashboardService.cancelarTarea('tarea-2', 'Cliente desistió');
```

---

## 🎯 Componentes Actualizados

### 1. MailroomPage
- ✅ Ahora usa `caseService.linkDocument()` para vincular documentos
- ✅ Maneja errores del backend (400, 404, 500)
- ✅ Muestra mensajes de error específicos

### 2. OCRExtractionPage
- ✅ Usa `ocrService.processExistingDocument()` 
- ✅ Detecta errores 400 y habilita ingreso manual
- ✅ Muestra confianza y datos extraídos del backend

### 3. CasesPage
- ✅ Carga casos con `caseService.listCases()`
- ✅ Fallback a datos mock si el backend falla

### 4. DashboardPage
- ✅ Usa `dashboardService.getSummary()`
- ✅ Ejecuta monitoreo con `dashboardService.executeMonitoring()`

---

## 🔄 Hook Personalizado: `useBackend`

Para facilitar el desarrollo, se creó un hook que alterna automáticamente entre mock y backend:

```javascript
import { useDocuments, useCases, useOCR, useDashboard } from '../hooks/useBackend';

function MyComponent() {
  // Se adapta automáticamente según VITE_USE_MOCK
  const { documents, loading, linkDocument } = useDocuments();
  const { cases, reload } = useCases();
  const { processDocument } = useOCR();
  const { dashboardData, executeMonitoring } = useDashboard();

  return (
    <div>
      {loading ? 'Cargando...' : `${documents.length} documentos`}
    </div>
  );
}
```

---

## 📊 Mapeo de Endpoints

| Funcionalidad | Frontend | Backend Endpoint |
|---------------|----------|------------------|
| **Crear documento** | `documentService.createDocument()` | `POST /documentos/` |
| **Subir archivo** | `documentService.uploadFile()` | `POST /documentos/{doc_id}/upload` |
| **Listar documentos** | `documentService.listDocuments()` | `GET /documentos/` |
| **Procesar OCR** | `ocrService.processDocument()` | `POST /ocr/procesar/{doc_id}` |
| **Listar trámites** | `caseService.listCases()` | `GET /tramites/` |
| **Vincular documento** | `caseService.linkDocument()` | `POST /tramites/{tramite_id}/vincular-documento/{doc_id}` |
| **Resumen dashboard** | `dashboardService.getSummary()` | `GET /dashboard/resumen` |
| **Ejecutar monitoreo** | `dashboardService.executeMonitoring()` | `POST /dashboard/monitoreo/ejecutar-manual` |
| **Resolver tarea** | `dashboardService.resolverTarea()` | `POST /dashboard/tareas/{tarea_id}/resolver` |

---

## 🧪 Pruebas

### Probar con datos mock (sin backend)
```bash
# .env
VITE_USE_MOCK=true

npm run dev
```

### Probar con backend real
```bash
# 1. Iniciar backend
cd back_incompleto
uvicorn src.api:app --reload --port 8000

# 2. Configurar frontend
# .env
VITE_USE_MOCK=false
VITE_API_URL=http://127.0.0.1:8000

# 3. Iniciar frontend
npm run dev
```

---

## ⚠️ Manejo de Errores

Todos los servicios manejan errores apropiadamente:

```javascript
try {
  await caseService.linkDocument(tramiteId, docId);
  showToast('Documento vinculado exitosamente', 'success');
} catch (error) {
  console.error('Error:', error);
  
  // Mostrar mensaje específico del backend
  const message = error.response?.data?.detail || 'Error al vincular documento';
  showToast(message, 'error');
}
```

Códigos HTTP manejados:
- `200`: Éxito
- `400`: Bad Request (datos inválidos, OCR falló)
- `404`: No encontrado
- `422`: Validación fallida
- `500`: Error del servidor

---

## 🚀 Próximos Pasos

1. **Crear el archivo `.env`** con la configuración apropiada
2. **Iniciar el backend** en `http://127.0.0.1:8000`
3. **Cambiar `VITE_USE_MOCK=false`** para usar el backend real
4. **Probar cada módulo** (Documentos, OCR, Trámites, Dashboard)
5. **Verificar logs en consola** para ver las peticiones HTTP

---

## 📝 Notas Importantes

- El frontend mantiene compatibilidad con datos mock para desarrollo sin backend
- Todos los servicios tienen fallback a datos locales si el backend falla
- La configuración centralizada facilita el cambio entre entornos
- Los hooks personalizados simplifican la integración en componentes

---

**Última actualización:** 28 de Enero de 2026
