import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import PrivateRoute from './components/PrivateRoute';
import PublicLayout from './components/public/PublicLayout';

// Public pages
import Home from './pages/public/Home';
import About from './pages/public/About';
import Services from './pages/public/Services';
import Shop from './pages/public/Shop';
import ProductDetail from './pages/public/ProductDetail';
import Cart from './pages/public/Cart';
import Checkout from './pages/public/Checkout';
import CheckoutSuccess from './pages/public/CheckoutSuccess';
import Contact from './pages/public/Contact';
import FAQs from './pages/public/FAQs';

// Admin pages
import PMSLogin from './pages/PMSLogin';
import WebAdminLogin from './pages/WebAdminLogin';
import InterfaceSelector from './pages/InterfaceSelector';
import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import Projects from './pages/Projects';
import ProjectDetail from './pages/ProjectDetail';
import Quotes from './pages/Quotes';
import QuoteDetail from './pages/QuoteDetail';
import Products from './pages/Products';
import Settings from './pages/Settings';
import Reports from './pages/Reports';
import Layout from './components/Layout';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1a4d7a',
    },
    secondary: {
      main: '#00E676',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
    },
    h2: {
      fontWeight: 700,
    },
    h3: {
      fontWeight: 700,
    },
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <CartProvider>
          <Router
            future={{
              v7_startTransition: true,
              v7_relativeSplatPath: true,
            }}
          >
          <Routes>
            {/* Interface Selector - Landing Page */}
            <Route path="/select" element={<InterfaceSelector />} />

            {/* Public Website Routes */}
            <Route path="/" element={<PublicLayout />}>
              <Route index element={<Home />} />
              <Route path="about" element={<About />} />
              <Route path="services" element={<Services />} />
              <Route path="services/:slug" element={<Services />} />
              <Route path="shop" element={<Shop />} />
              <Route path="products" element={<Shop />} />
              <Route path="products/:id" element={<ProductDetail />} />
              <Route path="cart" element={<Cart />} />
              <Route path="checkout" element={<Checkout />} />
              <Route path="checkout/success" element={<CheckoutSuccess />} />
              <Route path="contact" element={<Contact />} />
              <Route path="faqs" element={<FAQs />} />
            </Route>

            {/* Website Admin Login */}
            <Route path="/web/admin" element={<WebAdminLogin />} />

            {/* PMS Login */}
            <Route path="/pms/admin" element={<PMSLogin />} />

            {/* PMS Routes (Protected) - Project Management System */}
            <Route
              path="/pms"
              element={
                <PrivateRoute>
                  <Layout />
                </PrivateRoute>
              }
            >
              <Route index element={<Navigate to="/pms/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="customers" element={<Customers />} />
              <Route path="projects" element={<Projects />} />
              <Route path="projects/:id" element={<ProjectDetail />} />
              <Route path="quotes" element={<Quotes />} />
              <Route path="quotes/:id" element={<QuoteDetail />} />
              <Route path="products" element={<Products />} />
              <Route path="settings" element={<Settings />} />
              <Route path="reports" element={<Reports />} />
            </Route>

            {/* Legacy redirects for backward compatibility */}
            <Route path="/admin/login" element={<Navigate to="/pms/admin" replace />} />
            <Route path="/admin/*" element={<Navigate to="/pms/*" replace />} />
          </Routes>
          </Router>
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;

