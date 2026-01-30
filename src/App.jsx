import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import MailroomPage from './pages/MailroomPage';
import OCRExtractionPage from './pages/OCRExtractionPage';
import CompliancePage from './pages/CompliancePage_NEW';
import AppointmentsPage from './pages/AppointmentsPage';
import DeadlinesPage from './pages/DeadlinesPage';
import CaseDetailPage from './pages/CaseDetailPage';
import CasesPage from './pages/CasesPage';
import SettingsPage from './pages/SettingsPage';

function App() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      {/* Ruta de Login */}
      <Route 
        path="/login" 
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />} 
      />

      {/*Si entran a la raíz '/', los mandamos a '/dashboard' */}
      <Route 
        path="/" 
        element={<Navigate to="/dashboard" replace />} 
      />

      {/* Rutas Protegidas - Todas requieren autenticación */}
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        } 
      />

      {/* Rutas solo para Agente */}
      <Route 
        path="/mailroom" 
        element={
          <ProtectedRoute allowedRoles={['agente']}>
            <MailroomPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/ocr-extraction" 
        element={
          <ProtectedRoute allowedRoles={['agente']}>
            <OCRExtractionPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/compliance" 
        element={
          <ProtectedRoute allowedRoles={['agente']}>
            <CompliancePage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/appointments" 
        element={
          <ProtectedRoute>
            <AppointmentsPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/deadlines" 
        element={
          <ProtectedRoute allowedRoles={['agente']}>
            <DeadlinesPage />
          </ProtectedRoute>
        } 
      />

      {/* Rutas accesibles para todos los roles autenticados */}
      <Route 
        path="/cases" 
        element={
          <ProtectedRoute>
            <CasesPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/cases/:caseId" 
        element={
          <ProtectedRoute>
            <CaseDetailPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/settings" 
        element={
          <ProtectedRoute>
            <SettingsPage />
          </ProtectedRoute>
        } 
      />

      {/* Ruta por defecto */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
