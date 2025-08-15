import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from 'react-hot-toast';

import { store } from './store/store';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/Layout/Layout';
import ProtectedRoute from './components/Auth/ProtectedRoute';

// Pages
import Home from './pages/Home/Home';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import Listings from './pages/Listings/Listings';
import ListingDetail from './pages/Listings/ListingDetail';
import CreateListing from './pages/Listings/CreateListing';
import Dashboard from './pages/Dashboard/Dashboard';
import Profile from './pages/Profile/Profile';
import Offers from './pages/Offers/Offers';
import Escrow from './pages/Escrow/Escrow';
import ServiceProviders from './pages/ServiceProviders/ServiceProviders';
import NotFound from './pages/NotFound/NotFound';

// Create theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
      light: '#42a5f5',
      dark: '#1565c0',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 600,
    },
    h2: {
      fontWeight: 600,
    },
    h3: {
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        },
      },
    },
  },
});

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  return (
    <HelmetProvider>
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <AuthProvider>
              <Router>
                <Layout>
                  <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/listings" element={<Listings />} />
                    <Route path="/listings/:id" element={<ListingDetail />} />
                    <Route path="/service-providers" element={<ServiceProviders />} />

                    {/* Protected Routes */}
                    <Route
                      path="/dashboard"
                      element={
                        <ProtectedRoute>
                          <Dashboard />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/profile"
                      element={
                        <ProtectedRoute>
                          <Profile />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/create-listing"
                      element={
                        <ProtectedRoute roles={['SELLER', 'ADMIN']}>
                          <CreateListing />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/offers"
                      element={
                        <ProtectedRoute>
                          <Offers />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/escrow"
                      element={
                        <ProtectedRoute>
                          <Escrow />
                        </ProtectedRoute>
                      }
                    />

                    {/* 404 Route */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Layout>
              </Router>
            </AuthProvider>
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
                success: {
                  duration: 3000,
                  iconTheme: {
                    primary: '#4caf50',
                    secondary: '#fff',
                  },
                },
                error: {
                  duration: 5000,
                  iconTheme: {
                    primary: '#f44336',
                    secondary: '#fff',
                  },
                },
              }}
            />
          </ThemeProvider>
        </QueryClientProvider>
      </Provider>
    </HelmetProvider>
  );
}

export default App;