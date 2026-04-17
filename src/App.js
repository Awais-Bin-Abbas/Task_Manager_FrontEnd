import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import LoginWrapper from './pages/login';
import Dashboard from './pages/dashboard';
import Tasks from './pages/tasks';
import Projects from './pages/projects';
import Teams from './pages/teams';
import Analytics from './pages/analytics';
import Users from './pages/users';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Redirect root to login */}
        <Route path="/" element={<Navigate to="/login" />} />

        {/* Auth */}
        <Route path="/login" element={<LoginWrapper />} />

        {/* Main pages */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/tasks" element={<Tasks />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/teams" element={<Teams />} />
        <Route path="/analytics" element={<Analytics />} />

        {/* Manager-only page */}
        <Route
          path="/users"
          element={
            <ProtectedRoute allowedRoles={['Manager']}>
              <Users />
            </ProtectedRoute>
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;