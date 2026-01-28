import { createContext, useContext, useState } from 'react';

const DemoContext = createContext();

export const useDemoData = () => {
  const context = useContext(DemoContext);
  if (!context) throw new Error('useDemoData must be used within a DemoProvider');
  return context;
};

export const DemoProvider = ({ children }) => {
  // --- 1. TRÁMITES (CASES) ---
  const [cases, setCases] = useState([
    { id: 1, type: 'TRABAJO', applicant: 'María Fernanda González Pérez', status: 'ACTIVO', legalStatus: 'LEGAL', createdDate: '2025-12-29', lastUpdate: '2026-01-28' },
    { id: 2, type: 'RESIDENCIA', applicant: 'Juan Carlos Rodríguez López', status: 'EN_REVISION', legalStatus: 'PENDIENTE', createdDate: '2026-01-13', lastUpdate: '2026-01-28' },
    { id: 3, type: 'FAMILIAR', applicant: 'Ana Patricia Martínez Silva', status: 'ACTIVO', legalStatus: 'LEGAL', createdDate: '2025-12-14', lastUpdate: '2026-01-28' },
    { id: 4, type: 'ESTUDIANTE', applicant: 'Carlos Eduardo Sánchez Torres', status: 'PENDIENTE', legalStatus: 'EN_REVISION', createdDate: '2026-01-21', lastUpdate: '2026-01-28' },
  ]);

  // --- 2. DOCUMENTOS (MAILROOM + OCR) ---
  const [documents, setDocuments] = useState([
    // Documentos del Cliente 1 (María Fernanda - Trámite 1)
    { id: 1, name: 'pasaporte_maria_gonzalez.pdf', category: 'Identificación', tipo_documento: 'PASAPORTE', status: 'VALIDADO', size: '3.1 MB', date: '2025-12-31', caseId: 1, type: 'Pasaporte' },
    { id: 2, name: 'contrato_maria_gonzalez.pdf', category: 'Laboral', tipo_documento: 'CONTRATO_LABORAL', status: 'VALIDADO', size: '1.8 MB', date: '2026-01-03', caseId: 1, type: 'Contrato' },
    { id: 7, name: 'certificado_antecedentes_maria.pdf', category: 'Legal', tipo_documento: 'ANTECEDENTES', status: 'RECIBIDO', size: '1.2 MB', date: '2026-01-15', caseId: 1, type: 'Certificado' },
    { id: 8, name: 'carta_intencion_empresa.pdf', category: 'Laboral', tipo_documento: 'CARTA', status: 'VALIDADO', size: '850 KB', date: '2026-01-10', caseId: 1, type: 'Carta' },
    
    // Documentos del Cliente 2 (Juan Carlos - Trámite 2)
    { id: 3, name: 'cedula_juan_rodriguez.pdf', category: 'Identificación', tipo_documento: 'CEDULA', status: 'VALIDADO', size: '2.3 MB', date: '2026-01-14', caseId: 2, type: 'Cédula' },
    { id: 9, name: 'certificado_matrimonio_juan.pdf', category: 'Personal', tipo_documento: 'CERTIFICADO_MATRIMONIO', status: 'RECIBIDO', size: '1.9 MB', date: '2026-01-16', caseId: 2, type: 'Certificado' },
    { id: 10, name: 'pasaporte_conyuge.pdf', category: 'Identificación', tipo_documento: 'PASAPORTE', status: 'EN_REVISION', size: '2.7 MB', date: '2026-01-18', caseId: 2, type: 'Pasaporte' },
    
    // Documentos de otros casos
    { id: 11, name: 'acta_nacimiento_ana.pdf', category: 'Personal', tipo_documento: 'ACTA_NACIMIENTO', status: 'VALIDADO', size: '1.1 MB', date: '2025-12-20', caseId: 3, type: 'Acta' },
    
    // Documentos pendientes de vinculación
    { id: 4, name: 'pasaporte_nuevo_1.pdf', category: 'Identificación', tipo_documento: 'PASAPORTE', status: 'PENDIENTE', size: '2.8 MB', date: '2026-01-26', caseId: null, type: 'Pasaporte' },
    { id: 5, name: 'cedula_nueva_2.pdf', category: 'Identificación', tipo_documento: 'CEDULA', status: 'PENDIENTE', size: '2.1 MB', date: '2026-01-27', caseId: null, type: 'Cédula' },
    { id: 6, name: 'certificado_matrimonio_3.pdf', category: 'Personal', tipo_documento: 'CERTIFICADO_MATRIMONIO', status: 'PENDIENTE', size: '1.5 MB', date: '2026-01-28', caseId: null, type: 'Certificado' },
  ]);

  // --- 3. CITAS (APPOINTMENTS) ---
  const [appointments, setAppointments] = useState([
    // Citas del Cliente 1 (María Fernanda - Trámite 1)
    { id: 1, caseId: 1, agentId: 1, date: '2026-01-31', time: '10:00', status: 'PROGRAMADA', tipo: 'REVISION_DOCUMENTOS', agentName: 'Dr. Roberto Méndez', notes: 'Revisión de contrato laboral y documentación migratoria' },
    { id: 4, caseId: 1, agentId: 1, date: '2026-01-20', time: '15:00', status: 'COMPLETADA', tipo: 'CONSULTA', agentName: 'Dr. Roberto Méndez', notes: 'Consulta inicial sobre visa de trabajo' },
    { id: 5, caseId: 1, agentId: 1, date: '2026-02-10', time: '11:00', status: 'PROGRAMADA', tipo: 'SEGUIMIENTO', agentName: 'Dr. Roberto Méndez', notes: 'Seguimiento del proceso de visa' },
    
    // Citas del Cliente 2 (Juan Carlos - Trámite 2)
    { id: 2, caseId: 2, agentId: 2, date: '2026-02-04', time: '14:00', status: 'PROGRAMADA', tipo: 'ENTREVISTA', agentName: 'Dra. Laura Castillo', notes: 'Entrevista de residencia por matrimonio' },
    { id: 6, caseId: 2, agentId: 2, date: '2026-01-18', time: '09:30', status: 'COMPLETADA', tipo: 'CONSULTA', agentName: 'Dra. Laura Castillo', notes: 'Evaluación de documentos matrimoniales' },
    
    // Otras citas
    { id: 3, caseId: 3, agentId: 1, date: '2026-01-23', time: '09:00', status: 'COMPLETADA', tipo: 'CONSULTA', agentName: 'Dr. Roberto Méndez', notes: 'Consulta sobre reunificación familiar' },
  ]);

  // --- 4. PERFILES LEGALES (COMPLIANCE) ---
  const [profiles, setProfiles] = useState([
    { id: 'PERFIL_1', name: 'MARIA FERNANDA GONZALEZ PEREZ', cedula: '1725845632', birthDate: '1990-05-15', status: 'PENDIENTE' },
    { id: 'PERFIL_2', name: 'JUAN CARLOS RODRIGUEZ LOPEZ', cedula: '1712345678', birthDate: '1985-08-22', status: 'PENDIENTE' },
    { id: 'PERFIL_3', name: 'ANA PATRICIA MARTINEZ SILVA', cedula: '1798765432', birthDate: '1988-03-10', status: 'PENDIENTE' },
  ]);

  // --- 5. PLAZOS (DEADLINES) ---
  const [deadlines, setDeadlines] = useState([
    { id: 1, caseId: 1, title: 'Vencimiento de certificado de antecedentes penales', dueDate: '2026-02-12', status: 'PENDIENTE', priority: 'URGENTE' },
    { id: 2, caseId: 2, title: 'Entrega de documentos de matrimonio apostillados', dueDate: '2026-02-27', status: 'PENDIENTE', priority: 'MEDIA' },
    { id: 3, caseId: 3, title: 'Audiencia de reunificación familiar', dueDate: '2026-03-14', status: 'PENDIENTE', priority: 'ALTA' },
    { id: 4, caseId: 1, title: 'Renovación de permiso de trabajo temporal', dueDate: '2026-02-02', status: 'URGENTE', priority: 'URGENTE' },
  ]);

  // --- 6. AGENTES (AGENTS) ---
  const [agents] = useState([
    { id: 1, name: 'Dr. Roberto Méndez', specialty: 'Visas de Trabajo', availability: ['2026-01-31', '2026-02-01', '2026-02-03'] },
    { id: 2, name: 'Dra. Laura Castillo', specialty: 'Residencia Permanente', availability: ['2026-01-31', '2026-02-02', '2026-02-04'] },
    { id: 3, name: 'Lic. Pedro Ramírez', specialty: 'Reunificación Familiar', availability: [] },
  ]);

  // --- 7. ACTIVIDAD RECIENTE (ACTIVITY LOG) ---
  const [activities] = useState([
    // Cliente 1 (María Fernanda - Trámite 1)
    { id: 1, caseId: 1, action: 'Documento validado: Contrato laboral', date: '2026-01-28', time: '09:15', type: 'document' },
    { id: 2, caseId: 1, action: 'Certificado de antecedentes recibido', date: '2026-01-27', time: '14:30', type: 'document' },
    { id: 3, caseId: 1, action: 'Cita confirmada con Dr. Roberto Méndez', date: '2026-01-25', time: '11:00', type: 'appointment' },
    { id: 4, caseId: 1, action: 'Pasaporte verificado y aprobado', date: '2026-01-22', time: '16:45', type: 'validation' },
    { id: 5, caseId: 1, action: 'Consulta inicial completada', date: '2026-01-20', time: '15:00', type: 'appointment' },
    
    // Cliente 2 (Juan Carlos - Trámite 2)
    { id: 6, caseId: 2, action: 'Pasaporte de cónyuge en revisión', date: '2026-01-28', time: '10:30', type: 'document' },
    { id: 7, caseId: 2, action: 'Certificado de matrimonio recibido', date: '2026-01-26', time: '13:15', type: 'document' },
    { id: 8, caseId: 2, action: 'Entrevista programada para 04 de Febrero', date: '2026-01-24', time: '09:00', type: 'appointment' },
    { id: 9, caseId: 2, action: 'Cédula validada exitosamente', date: '2026-01-20', time: '11:30', type: 'validation' },
    { id: 10, caseId: 2, action: 'Evaluación de documentos completada', date: '2026-01-18', time: '09:30', type: 'appointment' },
  ]);

  // --- ACCIONES (ACTIONS) ---

  const linkDocument = (docId, caseId) => {
    setDocuments(prev => prev.map(doc => 
      doc.id === docId ? { ...doc, status: 'RECIBIDO', caseId: caseId } : doc
    ));
  };

  const updateOCRStatus = (docId, newStatus) => {
    setDocuments(prev => prev.map(doc =>
      doc.id === docId ? { ...doc, status: newStatus } : doc
    ));
  };

  const updateProfileStatus = (profileId, newStatus) => {
    setProfiles(prev => prev.map(p => 
      p.id === profileId ? { ...p, status: newStatus } : p
    ));
    
    // Integración Crítica: Si hay bloqueo legal, actualizar el Trámite correspondiente
    if (newStatus === 'BLOQUEO_LEGAL') {
      const profile = profiles.find(p => p.id === profileId);
      if (profile) {
        setCases(prev => prev.map(c => 
          c.applicant.toUpperCase() === profile.name 
            ? { ...c, legalStatus: 'BLOQUEO_LEGAL' } 
            : c
        ));
      }
    }
  };

  const addAppointment = (newAppointment) => {
    setAppointments(prev => [...prev, newAppointment]);
  };

  const cancelAppointment = (appointmentId) => {
    setAppointments(prev => prev.map(a => 
      a.id === appointmentId ? { ...a, status: 'CANCELADA' } : a
    ));
  };

  const completeDeadline = (id) => {
    setDeadlines(prev => prev.map(d => d.id === id ? { ...d, status: 'COMPLETED' } : d));
  };

  return (
    <DemoContext.Provider value={{
      cases,
      documents,
      appointments,
      profiles,
      deadlines,
      agents,
      activities,
      linkDocument,
      updateOCRStatus,
      updateProfileStatus,
      addAppointment,
      cancelAppointment,
      completeDeadline
    }}>
      {children}
    </DemoContext.Provider>
  );
};
