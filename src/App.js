import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import LoginWrapper from './pages/login';
import ResetPasswordWrapper from './pages/reset-password';
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

        {/* Auth */}
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<LoginWrapper />} />
        <Route path="/reset-password" element={<ResetPasswordWrapper />} />

        {/* Main pages */}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/tasks" element={<ProtectedRoute><Tasks /></ProtectedRoute>} />
        <Route path="/projects" element={<ProtectedRoute><Projects /></ProtectedRoute>} />
        <Route path="/teams" element={<ProtectedRoute><Teams /></ProtectedRoute>} />
        <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />

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