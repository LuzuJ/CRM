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
    { id: 'TR-A01', type: 'Visa Turismo', applicant: 'Juan Pérez', status: 'CERRADO', legalStatus: 'VALIDADO', createdDate: '2025-12-10', lastUpdate: '2026-01-10' },
    { id: 'TR-B02', type: 'Visa Trabajo', applicant: 'María González', status: 'ACTIVO', legalStatus: 'VALIDADO', createdDate: '2026-01-05', lastUpdate: '2026-01-17' },
    { id: 'TR-C03', type: 'Visa de Estudiante', applicant: 'Carlos López', status: 'ARCHIVADO', legalStatus: 'VALIDADO', createdDate: '2025-11-20', lastUpdate: '2026-01-15' },
    { id: 'TR-BLOCK', type: 'Visa Turismo', applicant: 'Luis Deudor', status: 'ACTIVO', legalStatus: 'BLOQUEO_LEGAL', createdDate: '2026-01-14', lastUpdate: '2026-01-18' },
    { id: 'TR-OK', type: 'Visa Trabajo', applicant: 'Ana Martínez', status: 'ACTIVO', legalStatus: 'VALIDADO', createdDate: '2026-01-12', lastUpdate: '2026-01-18' },
    { id: 'TR-A02', type: 'Visa Turismo', applicant: 'Pedro Sánchez', status: 'ACTIVO', legalStatus: 'VALIDADO', createdDate: '2026-01-08', lastUpdate: '2026-01-18' },
  ]);

  // --- 2. DOCUMENTOS (MAILROOM + OCR) ---
  const [documents, setDocuments] = useState([
    { id: 'DOC_002', name: 'record_policial.pdf', category: 'Antecedentes Penales', status: 'EN ESPERA', size: '2.3 MB', date: '2026-01-15', caseId: null, type: 'Certificado' },
    { id: 'DOC_003', name: 'foto_carnet.jpg', category: 'Biometría', status: 'EN ESPERA', size: '500 KB', date: '2026-01-15', caseId: null, type: 'Foto' },
    { id: 'DOC_004', name: 'contrato.pdf', category: 'Laboral', status: 'EN ESPERA', size: '1.8 MB', date: '2026-01-16', caseId: null, type: 'Contrato' },
    { id: 'DOC_001', name: 'pasaporte_juan.pdf', category: 'Identificación', status: 'RECIBIDO', size: '3.1 MB', date: '2026-01-14', caseId: 'TR-B02', type: 'Pasaporte' },
    // Docs para OCR
    { id: 'DOC_OCR_1', name: 'cedula_clara.jpg', category: 'Identificación', status: 'PENDIENTE', type: 'Cédula Ecuador', caseId: 'TR-A01' },
    { id: 'DOC_OCR_2', name: 'pasaporte_mancha.jpg', category: 'Identificación', status: 'PENDIENTE', type: 'Pasaporte', caseId: 'TR-A01' },
    { id: 'DOC_OCR_ERR', name: 'archivo_corrupto.png', category: 'Identificación', status: 'PENDIENTE', type: 'Cédula Ecuador', caseId: 'TR-C03' },
  ]);

  // --- 3. CITAS (APPOINTMENTS) ---
  const [appointments, setAppointments] = useState([
    { id: 'CITA_100', caseId: 'TR-B02', agentId: 'AGENTE_01', date: '2025-06-15', time: '10:00', status: 'CONFIRMADA' },
  ]);

  // --- 4. PERFILES LEGALES (COMPLIANCE) ---
  const [profiles, setProfiles] = useState([
    { id: 'PERFIL_OK', name: 'JUAN PEREZ', cedula: '1710010010', birthDate: '1980-05-10', status: 'PENDIENTE' },
    { id: 'PERFIL_IMP', name: 'LUIS DEUDOR', cedula: '1720020020', birthDate: '1985-08-20', status: 'PENDIENTE' },
    { id: 'PERFIL_RIP', name: 'MARIA DIFUNTA', cedula: '1730030030', birthDate: '1940-01-01', status: 'PENDIENTE' },
  ]);

  // --- 5. PLAZOS (DEADLINES) ---
  const [deadlines, setDeadlines] = useState([
    { id: 'D001', caseId: 'TR-B02', title: 'Envío de documentación adicional', dueDate: '2026-01-20', status: 'URGENT', priority: 'high' },
    { id: 'D002', caseId: 'TR-A02', title: 'Respuesta a solicitud de información', dueDate: '2026-01-25', status: 'UPCOMING', priority: 'medium' },
    { id: 'D003', caseId: 'TR-B02', title: 'Revisión de expediente', dueDate: '2026-01-22', status: 'UPCOMING', priority: 'medium' },
  ]);

  // --- 6. AGENTES (AGENTS) ---
  const [agents] = useState([
    { id: 'AGENTE_01', name: 'Dr. García', specialty: 'Visas Laborales', availability: ['2025-06-15', '2025-06-16', '2025-06-18'] },
    { id: 'AGENTE_02', name: 'Dra. Morales', specialty: 'Visas de Turismo', availability: ['2025-06-15', '2025-06-17', '2025-06-19'] },
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
