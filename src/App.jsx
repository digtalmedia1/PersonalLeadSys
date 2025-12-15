import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Layout from '@/components/Layout';
import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';
import Projects from '@/pages/Projects';
import ProjectDetail from '@/pages/ProjectDetail';
import Channels from '@/pages/Channels';
import Inbox from '@/pages/Inbox';
import LeadsPipeline from '@/pages/LeadsPipeline';
import LeadsTable from '@/pages/LeadsTable';
import LeadDetail from '@/pages/LeadDetail';
import Tasks from '@/pages/Tasks';
import FAQTemplates from '@/pages/FAQTemplates';
import Finance from '@/pages/Finance';
import Settings from '@/pages/Settings';
import Brainstorm from '@/pages/Brainstorm';
import MindMap from '@/pages/MindMap';
import Contacts from '@/pages/Contacts';
import { prefetchAppData } from '@/lib/api';

const DataBootstrapper = () => {
  const { isAuthenticated } = useAuth();

  React.useEffect(() => {
    if (isAuthenticated) {
      prefetchAppData().catch((err) => console.warn('Prefetch failed', err));
    }
  }, [isAuthenticated]);

  return null;
};

function App() {
  return (
    <>
      <Helmet>
        <title>Empire Leads Hub - CRM System</title>
        <meta
          name="description"
          content="Complete internal CRM system for managing leads, channels, projects, and customer communications"
        />
      </Helmet>
      <AuthProvider>
        <ThemeProvider>
          <DataBootstrapper />
          <Router>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="projects" element={<Projects />} />
                <Route path="projects/:id" element={<ProjectDetail />} />
                <Route path="contacts" element={<Contacts />} />
                <Route path="channels" element={<Channels />} />
                <Route path="inbox" element={<Inbox />} />
                <Route path="leads/pipeline" element={<LeadsPipeline />} />
                <Route path="leads/table" element={<LeadsTable />} />
                <Route path="leads/:id" element={<LeadDetail />} />
                <Route path="tasks" element={<Tasks />} />
                <Route path="brainstorm" element={<Brainstorm />} />
                <Route path="mindmap" element={<MindMap />} />
                <Route path="faq-templates" element={<FAQTemplates />} />
                <Route path="finance" element={<Finance />} />
                <Route path="settings" element={<Settings />} />
              </Route>
            </Routes>
          </Router>
        </ThemeProvider>
      </AuthProvider>
      <Toaster />
    </>
  );
}

export default App;
