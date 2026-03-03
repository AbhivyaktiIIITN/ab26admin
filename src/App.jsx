import { BrowserRouter as Router, Routes, Route, Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import PassTypeAdmin from './pages/PassTypeAdmin.jsx';
import AccommodationTypeAdmin from './pages/AccommodationTypeAdmin.jsx';
import EventAdmin from './pages/EventAdmin.jsx';
import EventDetails from './pages/EventDetails.jsx';
import TeamAdmin from './pages/TeamAdmin';
import UserAdmin from './pages/UserAdmin';
import SalesAdmin from './pages/SalesAdmin';
import UserLookup from './pages/UserLookup';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';
import ScanPass from './pages/ScanPass.jsx';

const Navbar = () => {
  const navigate = useNavigate();
  const username = localStorage.getItem('admin_user');

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    navigate('/login');
  };

  return (
    <nav className="bg-white border-b sticky top-0 z-40 px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="font-bold text-xl tracking-tighter text-yellow-600">AB26 ADMIN</div>
        <div className="h-6 w-px bg-gray-200"></div>
        <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
          {username ? `Logged in as ${username}` : 'Admin Panel'}
        </div>
      </div>
      <div className="flex items-center gap-6">
        <div className="flex gap-6 text-sm font-medium text-gray-500">
          <Link to="/admin/events" className="hover:text-yellow-600 transition">Events</Link>
          <Link to="/admin/teams" className="hover:text-yellow-600 transition">Teams</Link>
          <Link to="/admin/users" className="hover:text-yellow-600 transition">Users</Link>
          <Link to="/admin/lookup" className="hover:text-amber-600 transition text-amber-600 font-bold bg-amber-50 px-2 rounded">Lookup</Link>
          <Link to="/admin/sales" className="hover:text-yellow-600 transition">Sales</Link>
          <Link to="/admin/passes" className="hover:text-yellow-600 transition">Passes</Link>
          <Link to="/admin/accommodation" className="hover:text-yellow-600 transition">Accommodation</Link>
          <Link to="/admin/scan-pass" className="hover:text-yellow-600 transition">Scan Pass</Link>
        </div>
        <button
          onClick={handleLogout}
          className="ml-4 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-1 rounded-md transition"
        >
          Logout
        </button>
      </div>
    </nav>
  );
};

const AppLayout = ({ children }) => {
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      {!isLoginPage && <Navbar />}
      <div className={!isLoginPage ? "p-4 md:p-8" : ""}>
        {children}
      </div>
    </div>
  );
};

const App = () => {
  return (
    <Router>
      <AppLayout>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Navigate to="/admin/lookup" replace />} />
            <Route path="/admin/events" element={<EventAdmin />} />
            <Route path="/admin/events/:id" element={<EventDetails />} />
            <Route path="/admin/teams" element={<TeamAdmin />} />
            <Route path="/admin/users" element={<UserAdmin />} />
            <Route path="/admin/lookup" element={<UserLookup />} />
            <Route path="/admin/sales" element={<SalesAdmin />} />
            <Route path="/admin/passes" element={<PassTypeAdmin />} />
            <Route path="/admin/accommodation" element={<AccommodationTypeAdmin />} />

            <Route path="/admin/scan-pass" element={<ScanPass />} />

          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/admin/lookup" replace />} />
        </Routes>
      </AppLayout>
    </Router>
  );
}

export default App;

