import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import NotAuthorized from './pages/NotAuthorized';
import ProtectedRoute from './components/ProtectedRoute';
import Approvals from './pages/Approvals';
import Holidays from './pages/Holidays';
import Team from './pages/Team';
import MyAccount from './pages/MyAccount';
import Company from './pages/Company';
import ForgotPassword from './pages/ForgotPassword';
import NotFound from './pages/NotFound';

function App() {

  return (
    <>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Dashboard />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['admin', 'approver']} />}>
          <Route path="/approvals" element={<Approvals />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['admin', 'approver']} />}>
          <Route path="/holidays" element={<Holidays />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
          <Route path="/team" element={<Team />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
          <Route path="/company" element={<Company />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['user']} />}>
          <Route path="/myaccount" element={<MyAccount />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['user']} />}>
          <Route path="/myaccount" element={<MyAccount />} />
        </Route>

        <Route path="/forgot-password" element={<ForgotPassword />} />
        
        <Route path="/not-authorized" element={<NotAuthorized />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default App;