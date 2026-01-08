import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ErrorBoundary } from './components/ErrorBoundary'
import { AuthProvider } from './contexts/AuthContext'
import { CartProvider } from './contexts/CartContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import Dashboard from './pages/Dashboard'
import TilesPage from './pages/TilesPage'
import TileDetailPage from './pages/TileDetailPage'
import CartPage from './pages/CartPage'
import QuotationsPage from './pages/QuotationsPage'
import QuotationDetailPage from './pages/QuotationDetailPage'
import ManageTilesPage from './pages/ManageTilesPage'
import ManageWorkersPage from './pages/ManageWorkersPage'

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <CartProvider>
          <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tiles"
            element={
              <ProtectedRoute>
                <TilesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tiles/:id"
            element={
              <ProtectedRoute>
                <TileDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/cart"
            element={
              <ProtectedRoute>
                <CartPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/quotations"
            element={
              <ProtectedRoute>
                <QuotationsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/quotations/:id"
            element={
              <ProtectedRoute>
                <QuotationDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/manage/tiles"
            element={
              <ProtectedRoute requiredRole="admin">
                <ManageTilesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/manage/workers"
            element={
              <ProtectedRoute requiredRole="admin">
                <ManageWorkersPage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      </CartProvider>
    </AuthProvider>
    </ErrorBoundary>
  )
}

export default App
