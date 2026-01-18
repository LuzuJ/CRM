import { Routes, Route } from 'react-router-dom';
import DashboardPage from './pages/DashboardPage';
import MailroomPage from './pages/MailroomPage';
import OCRExtractionPage from './pages/OCRExtractionPage';
import CompliancePage from './pages/CompliancePage';
import AppointmentsPage from './pages/AppointmentsPage';
import DeadlinesPage from './pages/DeadlinesPage';
import CaseDetailPage from './pages/CaseDetailPage';
import CasesPage from './pages/CasesPage';
import SettingsPage from './pages/SettingsPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<DashboardPage />} />
      <Route path="/mailroom" element={<MailroomPage />} />
      <Route path="/ocr-extraction" element={<OCRExtractionPage />} />
      <Route path="/compliance" element={<CompliancePage />} />
      <Route path="/appointments" element={<AppointmentsPage />} />
      <Route path="/deadlines" element={<DeadlinesPage />} />
      <Route path="/cases/:caseId" element={<CaseDetailPage />} />
      <Route path="/cases" element={<CasesPage />} />
      <Route path="/settings" element={<SettingsPage />} />
      <Route path="*" element={<DashboardPage />} />
    </Routes>
  );
}

export default App;
