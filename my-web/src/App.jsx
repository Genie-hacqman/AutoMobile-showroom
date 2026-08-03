import { Routes, Route } from 'react-router-dom';
import './App.css';
import Navbar from './components/sections/Navbar';
import Landing from './pages/Landing';
import About from './pages/About';
import Contact from './pages/Contact';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import ProductManager from './pages/ProductManager';
import OwnerLogin from './pages/OwnerLogin';
import OwnerGate from './components/dashboard/OwnerGate';
import Home from './pages/Home';
import NotFound from './pages/NotFound';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import VerifyEmail from './pages/VerifyEmail';
import Profile from './pages/Profile';
import AdminUsers from './pages/AdminUsers';
import ProtectedRoute from './components/auth/ProtectedRoute';

function App() {
  return (
    <>
      {/* The navbar stays in place so visitors can move around the site without losing context. */}
      <Navbar />

      {/* These routes map each path to the right page component, almost like a digital map for the site. */}
      
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/landing" element={<Landing />} />
        <Route path="/about" element={<About />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/products" element={<Products />} />
        <Route
          path="/products/manage"
          element={
            <OwnerGate>
              <ProductManager />
            </OwnerGate>
          }
        />
        <Route path="/owner-login" element={<OwnerLogin />} />

        {/* Account area backed by the FastAPI authentication service. */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute requireAdmin>
              <AdminUsers />
            </ProtectedRoute>
          }
        />
        <Route path="/products/:id" element={<ProductDetail />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default App;