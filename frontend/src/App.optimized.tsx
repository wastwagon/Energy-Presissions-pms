// OPTIMIZED VERSION WITH CODE SPLITTING
// This is an example of how to optimize your current approach
// You can gradually adopt these optimizations

import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { CircularProgress, Box } from '@mui/material';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import PrivateRoute from './components/PrivateRoute';
import PublicLayout from './components/public/PublicLayout';

// Lazy load public pages (loaded on demand)
const Home = lazy(() => import('./pages/public/Home'));
const About = lazy(() => import('./pages/public/About'));
const Services = lazy(() => import('./pages/public/Services'));
const Shop = lazy(() => import('./pages/public/Shop'));
const ProductDetail = lazy(() => import('./pages/public/ProductDetail'));
const Cart = lazy(() => import('./pages/public/Cart'));
const Checkout = lazy(() => import('./pages/public/Checkout'));
const CheckoutSuccess = lazy(() => import('./pages/public/CheckoutSuccess'));
const Contact = lazy(() => import('./pages/public/Contact'));
const FAQs = lazy(() => import('./pages/public/FAQs'));

// Lazy load admin pages (only loaded when admin accesses)
const PMSLogin = lazy(() => import('./pages/PMSLogin'));
const WebAdminLogin = lazy(() => import('./pages/WebAdminLogin'));
const InterfaceSelector = lazy(() => import('./pages/InterfaceSelector'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Customers = lazy(() => import('./pages/Customers'));
const Projects = lazy(() => import('./pages/Projects'));
const ProjectDetail = lazy(() => import('./pages/ProjectDetail'));
const Quotes = lazy(() => import('./pages/Quotes'));
const QuoteDetail = lazy(() => import('./pages/QuoteDetail'));
const Products = lazy(() => import('./pages/Products'));
const Settings = lazy(() => import('./pages/Settings'));
const Reports = lazy(() => import('./pages/Reports'));
const Layout = lazy(() => import('./components/Layout'));

// Loading component
const LoadingFallback = () => (
  <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
    <CircularProgress />
  </Box>
);

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
            <Suspense fallback={<LoadingFallback />}>
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
            </Suspense>
          </Router>
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
