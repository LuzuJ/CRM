# Contexto Global - DemoContext

## 📋 Descripción

El archivo `src/contexts/DemoContext.jsx` implementa un **Context Global de React** que centraliza todos los datos de la aplicación. Esto evita que los datos se reinicien al cambiar de página y facilita la sincronización entre componentes.

## 🎯 Problema que Resuelve

**Antes (❌ Problema):**
- Cada página usaba `useState` local
- Al navegar entre páginas, los datos se reiniciaban
- No había sincronización entre componentes
- Cambios en una página no se reflejaban en otras

```jsx
// ❌ ANTES: Datos locales en cada página
const MailroomPage = () => {
  const [documents, setDocuments] = useState([]);  // Se pierde al cambiar de página
  const [cases, setCases] = useState([]);          // Datos aislados
  // ...
}
```

**Ahora (✅ Solución):**
- Un contexto global mantiene todos los datos
- Los datos persisten al navegar
- Todos los componentes comparten el mismo estado
- Cambios en tiempo real en toda la aplicación

```jsx
// ✅ AHORA: Datos globales compartidos
const MailroomPage = () => {
  const { documents, cases, linkDocument } = useDemoData();  // Datos persistentes
  // ...
}
```

## 🏗️ Estructura del Contexto

### Datos Disponibles

```javascript
{
  // 1. TRÁMITES (CASES)
  cases: [
    { id, type, applicant, status, legalStatus, createdDate, lastUpdate }
  ],

  // 2. DOCUMENTOS (MAILROOM + OCR)
  documents: [
    { id, name, category, status, size, date, caseId, type }
  ],

  // 3. CITAS (APPOINTMENTS)
  appointments: [
    { id, caseId, agentId, date, time, status }
  ],

  // 4. PERFILES LEGALES (COMPLIANCE)
  profiles: [
    { id, name, cedula, birthDate, status }
  ],

  // 5. PLAZOS (DEADLINES)
  deadlines: [
    { id, caseId, title, dueDate, status, priority }
  ],

  // 6. AGENTES
  agents: [
    { id, name, specialty, availability }
  ]
}
```

### Funciones Disponibles

```javascript
{
  // Documentos
  linkDocument(docId, caseId),           // Vincular documento a trámite
  updateOCRStatus(docId, newStatus),     // Actualizar estado OCR

  // Perfiles Legales
  updateProfileStatus(profileId, status), // Actualizar validación legal

  // Citas
  addAppointment(newAppointment),        // Crear nueva cita
  cancelAppointment(appointmentId),      // Cancelar cita

  // Plazos
  completeDeadline(id)                   // Marcar plazo completado
}
```

## 📦 Implementación

### 1. Proveedor en main.jsx

```jsx
import { DemoProvider } from './contexts/DemoContext';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <DemoProvider>          {/* ⭐ Envuelve toda la app */}
        <App />
      </DemoProvider>
    </BrowserRouter>
  </React.StrictMode>
);
```

### 2. Uso en Componentes

```jsx
import { useDemoData } from '../contexts/DemoContext';

const MyComponent = () => {
  // Obtener datos y funciones del contexto
  const { 
    documents,      // 📄 Datos
    cases,          // 📄 Datos
    linkDocument    // 🔧 Función
  } = useDemoData();

  const handleLink = () => {
    linkDocument('DOC_001', 'TR-B02');  // Los cambios se reflejan globalmente
  };

  return (
    <div>
      <p>Documentos: {documents.length}</p>
      <button onClick={handleLink}>Vincular</button>
    </div>
  );
};
```

## 🔄 Flujo de Integración Crítica

### Ejemplo: Bloqueo Legal afecta Trámite

```javascript
// En CompliancePage.jsx
const handleValidate = () => {
  // Cuando se detecta bloqueo legal en perfil...
  updateProfileStatus('PERFIL_IMP', 'BLOQUEO_LEGAL');
  
  // ⚡ El contexto automáticamente actualiza el trámite relacionado
  // Esto sucede dentro de DemoContext.jsx:
  
  if (newStatus === 'BLOQUEO_LEGAL') {
    const profile = profiles.find(p => p.id === profileId);
    setCases(prev => prev.map(c => 
      c.applicant.toUpperCase() === profile.name 
        ? { ...c, legalStatus: 'BLOQUEO_LEGAL' }  // 🔴 Trámite bloqueado
        : c
    ));
  }
};
```

### Ejemplo: Documento Vinculado aparece en todas partes

```javascript
// En MailroomPage.jsx
linkDocument('DOC_002', 'TR-B02');

// ✅ El documento ahora aparece:
// - En MailroomPage con status 'RECIBIDO'
// - En CaseDetailPage en la lista de documentos del trámite
// - En Dashboard en el contador de documentos procesados
// - En OCRExtractionPage (si es documento OCR)
```

## 🔧 Migración a Backend Real

### Fase 1: Mock Data (ACTUAL)

```jsx
// DemoContext.jsx - Estado actual
const [cases, setCases] = useState([
  { id: 'TR-A01', type: 'Visa Turismo', ... }  // Datos quemados
]);
```

### Fase 2: API Integration (FUTURO)

```jsx
// DemoContext.jsx - Con backend real
const [cases, setCases] = useState([]);

useEffect(() => {
  // Cargar datos reales del backend
  fetch('/api/cases')
    .then(res => res.json())
    .then(data => setCases(data));
}, []);

const linkDocument = async (docId, caseId) => {
  // POST al backend
  await fetch('/api/documents/link', {
    method: 'POST',
    body: JSON.stringify({ docId, caseId })
  });
  
  // Actualizar estado local
  setDocuments(prev => prev.map(doc => 
    doc.id === docId ? { ...doc, caseId } : doc
  ));
};
```

## ✅ Ventajas

1. **Persistencia**: Los datos no se pierden al navegar
2. **Sincronización**: Cambios instantáneos en toda la app
3. **Simplicidad**: Un solo lugar para gestionar datos
4. **Escalabilidad**: Fácil migrar a backend real
5. **Testing**: Datos consistentes para pruebas
6. **Performance**: Evita cargas redundantes

## 🚀 Páginas Actualizadas

Todas estas páginas ahora usan el contexto global:

- ✅ `MailroomPage.jsx` - Vinculación de documentos
- ✅ `OCRExtractionPage.jsx` - Procesamiento OCR
- ✅ `CompliancePage.jsx` - Validación legal
- ✅ `AppointmentsPage.jsx` - Gestión de citas
- ✅ `CasesPage.jsx` - Lista de trámites
- ✅ `DeadlinesPage.jsx` - Control de plazos
- ✅ `CaseDetailPage.jsx` - Detalle de trámite
- ✅ `DashboardPage.jsx` - Estadísticas dinámicas

## 📝 Nota Importante

Este contexto usa datos mock para **demostración y desarrollo**. Cuando se conecte al backend Python:

1. Reemplazar `useState` inicial con llamadas a API
2. Las funciones harán `fetch`/`axios` al backend
3. El estado local se actualiza después de cada operación exitosa
4. Mantener la misma estructura de datos para compatibilidad

## 🔗 Referencias

- [React Context API](https://react.dev/learn/passing-data-deeply-with-context)
- [useContext Hook](https://react.dev/reference/react/useContext)
- Backend Guide: Ver `BACKEND_GUIDE.md`
