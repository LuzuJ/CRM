# 🔐 Credenciales de Acceso - CRM Legal Migration

## 👔 Usuarios Agente (Acceso Completo)

### Agente 1
- **Usuario:** `agente1`
- **Contraseña:** `agente123`
- **Nombre:** María González
- **Especialidad:** Visas de Trabajo
- **Acceso:** Dashboard, Mailroom, OCR, Compliance, Appointments, Deadlines, Cases, Settings

### Agente 2
- **Usuario:** `agente2`
- **Contraseña:** `agente123`
- **Nombre:** Carlos Mendez
- **Especialidad:** Visas de Estudiante
- **Acceso:** Dashboard, Mailroom, OCR, Compliance, Appointments, Deadlines, Cases, Settings

---

## 👤 Usuarios Cliente (Acceso Limitado)

### Cliente 1
- **Usuario:** `cliente1`
- **Contraseña:** `cliente123`
- **Nombre:** María Fernanda González Pérez
- **Email:** maria.gonzalez@email.com
- **Trámite Asignado:** ID 1 (Visa de TRABAJO)
- **Acceso:** Dashboard (vista limitada), Appointments (solo sus citas), Cases (solo su trámite)

### Cliente 2
- **Usuario:** `cliente2`
- **Contraseña:** `cliente123`
- **Nombre:** Juan Carlos Rodríguez López
- **Email:** juan.rodriguez@email.com
- **Trámite Asignado:** ID 2 (RESIDENCIA)
- **Acceso:** Dashboard (vista limitada), Appointments (solo sus citas), Cases (solo su trámite)

---

## 📊 Datos en el Sistema

### Clientes en la Base de Datos
1. **María Fernanda González Pérez** - Cédula: 1725845632 - Estado: LEGAL
2. **Juan Carlos Rodríguez López** - Cédula: 1712345678 - Estado: PENDIENTE
3. **Ana Patricia Martínez Silva** - Cédula: 1798765432 - Estado: LEGAL
4. **Carlos Eduardo Sánchez Torres** - Cédula: 1756789012 - Estado: EN_REVISION

### Trámites Activos
1. **ID 1:** TRABAJO - María Fernanda González - ACTIVO
2. **ID 2:** RESIDENCIA - Juan Carlos Rodríguez - EN_REVISION
3. **ID 3:** FAMILIAR - Ana Patricia Martínez - ACTIVO
4. **ID 4:** ESTUDIANTE - Carlos Eduardo Sánchez - PENDIENTE

### Documentos Disponibles
- 3 documentos vinculados a trámites
- 3 documentos pendientes de vinculación (para probar Digital Mailroom)

### Citas Programadas
- Cita 1: María Fernanda - Dr. Roberto Méndez - 31 Enero 2026
- Cita 2: Juan Carlos - Dra. Laura Castillo - 04 Febrero 2026
- Cita 3: Ana Patricia - Dr. Roberto Méndez - 23 Enero 2026 (COMPLETADA)

### Eventos y Tareas
- 4 eventos con fechas límite
- 4 tareas asignadas a agentes

---

## 🎯 Funcionalidades por Rol

### Agente (Acceso Completo)
✅ **Dashboard** - Estadísticas globales del sistema  
✅ **Digital Mailroom** - Clasificar y vincular documentos a trámites  
✅ **OCR Extraction** - Procesar documentos y extraer datos automáticamente  
✅ **Legal Compliance** - Validar perfiles contra Registro Civil y Policía de Migración  
✅ **Intelligent Scheduler** - Agendar citas con clientes  
✅ **Deadlines Control Tower** - Monitorear plazos y vencimientos  
✅ **Mis Casos** - Ver todos los trámites del sistema  
✅ **Settings** - Configuración del sistema  

### Cliente (Acceso Limitado)
✅ **Dashboard** - Vista de su trámite y estado  
✅ **Appointments** - Sus citas programadas  
✅ **Mis Casos** - Solo su trámite (vista de solo lectura)  
❌ Digital Mailroom - No disponible  
❌ OCR Extraction - No disponible  
❌ Legal Compliance - No disponible  
❌ Deadlines Control Tower - No disponible  
❌ Settings - No disponible  

---

## 🚀 Inicio Rápido

### Para Probar Todo el Sistema (Recomendado)
```
Usuario: agente1
Contraseña: agente123
```

### Para Probar Vista de Cliente
```
Usuario: cliente1
Contraseña: cliente123
```

---

## 🌐 Acceso al Sistema

- **Frontend Local:** http://localhost:3000 o http://localhost:3001
- **Backend (Ngrok):** https://7d1ba1815e21.ngrok-free.app
- **Backend Local:** http://127.0.0.1:8000 (cuando esté corriendo)

---

**Última actualización:** 28 de Enero de 2026  
**Versión:** 1.0.0
