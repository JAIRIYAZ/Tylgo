import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function LandingPage() {
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-primary-600">TYLGO</h1>
            </div>
            <div className="flex items-center space-x-4">
              {user ? (
                <Link to="/dashboard" className="btn-primary">
                  Go to Dashboard
                </Link>
              ) : (
                <>
                  <Link to="/login" className="text-gray-700 hover:text-primary-600 font-medium">
                    Login
                  </Link>
                  <Link to="/signup" className="btn-primary">
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Smart Operating System for
            <span className="text-primary-600"> Tile Businesses</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Manage your tile showroom, inventory, quotations, and more with TYLGO.
            Everything you need to run your tile business efficiently.
          </p>
          {!user && (
            <div className="flex justify-center space-x-4">
              <Link to="/signup" className="btn-primary text-lg px-8 py-3">
                Start Free Trial
              </Link>
              <Link to="/login" className="btn-secondary text-lg px-8 py-3">
                Sign In
              </Link>
            </div>
          )}
        </div>

        {/* Features */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="card text-center">
            <div className="text-4xl mb-4">📦</div>
            <h3 className="text-xl font-semibold mb-2">Tile Management</h3>
            <p className="text-gray-600">
              Organize your tile inventory with categories, brands, sizes, and pricing.
            </p>
          </div>
          <div className="card text-center">
            <div className="text-4xl mb-4">📱</div>
            <h3 className="text-xl font-semibold mb-2">QR Code System</h3>
            <p className="text-gray-600">
              Generate QR codes for each tile. Scan and add to cart instantly.
            </p>
          </div>
          <div className="card text-center">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-xl font-semibold mb-2">Quotations</h3>
            <p className="text-gray-600">
              Create professional quotations with room calculator and PDF export.
            </p>
          </div>
        </div>

        {/* More Features */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="card">
            <h3 className="text-xl font-semibold mb-3">Room Calculator</h3>
            <p className="text-gray-600">
              Calculate required tiles for any room size with automatic wastage calculation.
            </p>
          </div>
          <div className="card">
            <h3 className="text-xl font-semibold mb-3">Multi-User Support</h3>
            <p className="text-gray-600">
              Admin and worker roles. Manage your team and control access levels.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-center text-gray-600">
            © 2024 TYLGO. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
