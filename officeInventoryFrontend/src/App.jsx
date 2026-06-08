import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import PrivateRoute from './components/PrivateRoute';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Signup from './pages/Signup';
import CreatorDashboard from './pages/CreatorDashboard';
import PurchaserDashboard from './pages/PurchaserDashboard';
import CreateOrder from './pages/CreateOrder';
import EditOrder from './pages/EditOrder';
import OrderDetail from './pages/OrderDetail';
import ChangePassword from './pages/ChangePassword';

const AppContent = () => {
  const { user } = useAuth();

  return (
    <>
      {user && <Navbar />}
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/" element={
          user ? <Navigate to={user.role === 'CREATOR' ? '/creator' : '/purchaser'} /> : <Navigate to="/login" />
        } />
        <Route path="/creator" element={
          <PrivateRoute allowedRoles={['CREATOR']}>
            <CreatorDashboard />
          </PrivateRoute>
        } />
        <Route path="/purchaser" element={
          <PrivateRoute allowedRoles={['PURCHASER']}>
            <PurchaserDashboard />
          </PrivateRoute>
        } />
        <Route path="/create-order" element={
          <PrivateRoute allowedRoles={['CREATOR']}>
            <CreateOrder />
          </PrivateRoute>
        } />
        <Route path="/edit-order/:id" element={
          <PrivateRoute allowedRoles={['CREATOR']}>
            <EditOrder />
          </PrivateRoute>
        } />
        <Route path="/order/:id" element={
          <PrivateRoute allowedRoles={['CREATOR', 'PURCHASER']}>
            <OrderDetail />
          </PrivateRoute>
        } />
        <Route path="/change-password" element={
          <PrivateRoute allowedRoles={['CREATOR', 'PURCHASER']}>
            <ChangePassword />
          </PrivateRoute>
        } />
      </Routes>
      <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
};

function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;