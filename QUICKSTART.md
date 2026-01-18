# 🚀 Inicio Rápido - CRM Legal

## ⚡ Instalación y Ejecución

### 1. Instalar dependencias
```bash
npm install
```

### 2. Iniciar el servidor de desarrollo
```bash
npm run dev
```

El frontend estará disponible en: **http://localhost:3000**

## 🎯 Páginas Disponibles

- **Dashboard**: `/` - Vista general del sistema
- **Mailroom**: `/mailroom` - Clasificación de documentos (Escenario 1.1)
- **OCR Extraction**: `/ocr-extraction` - Extracción inteligente (Escenario 1.2)
- **Compliance**: `/compliance` - Validación legal (Escenario 1.3)
- **Appointments**: `/appointments` - Agendamiento de citas (Escenario 2.1)
- **Deadlines**: `/deadlines` - Control de plazos
- **Case Detail**: `/cases/:id` - Detalle de trámite

## 📦 Próximos Pasos

### Para Conectar con el Backend:

1. **Crear el backend en Python** (ver BACKEND_GUIDE.md)
2. **Configurar CORS** en el servidor Python
3. **Descomentar las llamadas a servicios** en cada página:
   ```javascript
   // En MailroomPage.jsx, línea ~25
   const [docsRes, casesRes] = await Promise.all([
     documentService.getPendingDocuments(),  // Descomentar
     caseService.getAllCases()               // Descomentar
   ]);
   ```
4. **Comentar/eliminar los datos mock**

### Estructura de Datos Mock Actual:

Cada página usa datos simulados basados en los escenarios. Ejemplo:
```javascript
// MailroomPage.jsx
setDocuments([
  { id: 'DOC_002', name: 'record_policial.pdf', ... },
  // ...
]);
```

## 🔧 Configuración del Proxy

El proxy ya está configurado en `vite.config.js`:
```javascript
proxy: {
  '/api': {
    target: 'http://localhost:8000',  // Cambiar si tu backend usa otro puerto
    changeOrigin: true,
  }
}
```

## 📝 Scripts Disponibles

- `npm run dev` - Inicia servidor de desarrollo
- `npm run build` - Compila para producción
- `npm run preview` - Vista previa de build de producción
- `npm run lint` - Ejecuta linter

## 🐛 Troubleshooting

### Error: "Cannot find module"
```bash
rm -rf node_modules package-lock.json
npm install
```

### Puerto 3000 ya en uso
Editar `vite.config.js` y cambiar el puerto:
```javascript
server: {
  port: 3001,  // Cambiar a otro puerto
  // ...
}
```

### CORS Error al conectar con backend
Verificar que:
1. El backend tiene CORS habilitado
2. La URL del backend en el proxy es correcta
3. El backend está corriendo en el puerto especificado

## 📚 Recursos

- **README.md** - Documentación completa
- **BACKEND_GUIDE.md** - Guía para implementar el backend
- **Escenarios.md** - Escenarios de prueba originales
