import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { CircularProgress, Box } from '@mui/material';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import PrivateRoute from './components/PrivateRoute';
import PublicLayout from './components/public/PublicLayout';
import Layout from './components/Layout';

// Eager-load critical above-the-fold pages
import Home from './pages/public/Home';
import InterfaceSelector from './pages/InterfaceSelector';
import PMSLogin from './pages/PMSLogin';
import WebAdminLogin from './pages/WebAdminLogin';
import Dashboard from './pages/Dashboard';

// Lazy-load remaining pages for better initial load
const About = lazy(() => import('./pages/public/About'));
const Services = lazy(() => import('./pages/public/Services'));
const Shop = lazy(() => import('./pages/public/Shop'));
const ProductDetail = lazy(() => import('./pages/public/ProductDetail'));
const Cart = lazy(() => import('./pages/public/Cart'));
const Checkout = lazy(() => import('./pages/public/Checkout'));
const CheckoutSuccess = lazy(() => import('./pages/public/CheckoutSuccess'));
const Contact = lazy(() => import('./pages/public/Contact'));
const FAQs = lazy(() => import('./pages/public/FAQs'));
const Portfolio = lazy(() => import('./pages/public/Portfolio'));
const Customers = lazy(() => import('./pages/Customers'));
const Projects = lazy(() => import('./pages/Projects'));
const ProjectDetail = lazy(() => import('./pages/ProjectDetail'));
const Quotes = lazy(() => import('./pages/Quotes'));
const QuoteDetail = lazy(() => import('./pages/QuoteDetail'));
const Products = lazy(() => import('./pages/Products'));
const AppliancesCatalog = lazy(() => import('./pages/AppliancesCatalog'));
const Orders = lazy(() => import('./pages/Orders'));
const MediaLibrary = lazy(() => import('./pages/MediaLibrary'));
const Settings = lazy(() => import('./pages/Settings'));
const Reports = lazy(() => import('./pages/Reports'));

const PageLoader = () => (
  <Box display="flex" justifyContent="center" alignItems="center" minHeight="40vh">
    <CircularProgress />
  </Box>
);

const theme = createTheme({
  palette: {
    primary: {
      main: '#0a0e17',
    },
    secondary: {
      main: '#00E676',
    },
  },
  typography: {
    fontFamily: '"Plus Jakarta Sans", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontWeight: 800, letterSpacing: '-0.02em' },
    h2: { fontWeight: 700, letterSpacing: '-0.02em' },
    h3: { fontWeight: 700 },
    h4: { fontWeight: 600 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    button: { fontWeight: 600, textTransform: 'none' },
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
              <Route path="about" element={<Suspense fallback={<PageLoader />}><About /></Suspense>} />
              <Route path="services" element={<Suspense fallback={<PageLoader />}><Services /></Suspense>} />
              <Route path="services/:slug" element={<Suspense fallback={<PageLoader />}><Services /></Suspense>} />
              <Route path="shop" element={<Suspense fallback={<PageLoader />}><Shop /></Suspense>} />
              <Route path="products" element={<Suspense fallback={<PageLoader />}><Shop /></Suspense>} />
              <Route path="products/:id" element={<Suspense fallback={<PageLoader />}><ProductDetail /></Suspense>} />
              <Route path="cart" element={<Suspense fallback={<PageLoader />}><Cart /></Suspense>} />
              <Route path="checkout" element={<Suspense fallback={<PageLoader />}><Checkout /></Suspense>} />
              <Route path="checkout/success" element={<Suspense fallback={<PageLoader />}><CheckoutSuccess /></Suspense>} />
              <Route path="contact" element={<Suspense fallback={<PageLoader />}><Contact /></Suspense>} />
              <Route path="faqs" element={<Suspense fallback={<PageLoader />}><FAQs /></Suspense>} />
              <Route path="portfolio" element={<Suspense fallback={<PageLoader />}><Portfolio /></Suspense>} />
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
              <Route path="customers" element={<Suspense fallback={<PageLoader />}><Customers /></Suspense>} />
              <Route path="projects" element={<Suspense fallback={<PageLoader />}><Projects /></Suspense>} />
              <Route path="projects/:id" element={<Suspense fallback={<PageLoader />}><ProjectDetail /></Suspense>} />
              <Route path="quotes" element={<Suspense fallback={<PageLoader />}><Quotes /></Suspense>} />
              <Route path="quotes/:id" element={<Suspense fallback={<PageLoader />}><QuoteDetail /></Suspense>} />
              <Route path="products" element={<Suspense fallback={<PageLoader />}><Products /></Suspense>} />
              <Route path="appliances" element={<Suspense fallback={<PageLoader />}><AppliancesCatalog /></Suspense>} />
              <Route path="orders" element={<Suspense fallback={<PageLoader />}><Orders /></Suspense>} />
              <Route path="media" element={<Suspense fallback={<PageLoader />}><MediaLibrary /></Suspense>} />
              <Route path="settings" element={<Suspense fallback={<PageLoader />}><Settings /></Suspense>} />
              <Route path="reports" element={<Suspense fallback={<PageLoader />}><Reports /></Suspense>} />
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

