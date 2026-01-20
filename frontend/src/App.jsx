import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ProtectedRoute from './components/ProtectedRoute';
import ServiceRequestPage from './pages/service/ServiceRequestPage';
import ProductRequestPage from './pages/service/ProductRequestPage';
import MakeOrderPage from './pages/receiver/MakeOrderPage';
import ProviderDashboard from './pages/provider/ProviderDashboard';
import ReceiverDashboard from './pages/receiver/ReceiverDashboard';
import OrdersPage from './pages/receiver/OrdersPage';
import QuotationsPage from './pages/receiver/QuotationsPage';
import ProfilePage from './pages/common/ProfilePage';
import InfoPage from './pages/common/InfoPage';
import HelpPage from './pages/common/HelpPage';
import WalletPage from './pages/wallet/WalletPage';

// Role Based Redirect
const DashboardRedirect = () => {
  const { user } = useAuth();
  if (user?.role === 'SERVICE_PROVIDER') {
    return <Navigate to="/provider-dashboard" replace />;
  }
  return <ReceiverDashboard />;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<DashboardRedirect />} />
            <Route path="/receiver-dashboard" element={<ReceiverDashboard />} />
            <Route path="/make-order" element={<MakeOrderPage />} />
            <Route path="/request-service" element={<ServiceRequestPage />} />
            <Route path="/request-product" element={<ProductRequestPage />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/quotations" element={<QuotationsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/info" element={<InfoPage />} />
            <Route path="/help" element={<HelpPage />} />
            <Route path="/provider-dashboard" element={<ProviderDashboard />} />
            <Route path="/wallet" element={<WalletPage />} />
          </Route>

          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
