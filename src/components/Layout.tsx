import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

interface LayoutProps {
  children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const { userProfile, signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <Link to="/dashboard" className="text-2xl font-bold text-primary-600">
                TYLGO
              </Link>
              <div className="flex space-x-4">
                <Link
                  to="/dashboard"
                  className="text-gray-700 hover:text-primary-600 font-medium"
                >
                  Dashboard
                </Link>
                <Link
                  to="/tiles"
                  className="text-gray-700 hover:text-primary-600 font-medium"
                >
                  Tiles
                </Link>
                <Link
                  to="/cart"
                  className="text-gray-700 hover:text-primary-600 font-medium"
                >
                  Cart
                </Link>
                <Link
                  to="/quotations"
                  className="text-gray-700 hover:text-primary-600 font-medium"
                >
                  Quotations
                </Link>
                {userProfile?.role === 'admin' && (
                  <>
                    <Link
                      to="/manage/tiles"
                      className="text-gray-700 hover:text-primary-600 font-medium"
                    >
                      Manage Tiles
                    </Link>
                    <Link
                      to="/manage/workers"
                      className="text-gray-700 hover:text-primary-600 font-medium"
                    >
                      Manage Workers
                    </Link>
                  </>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {userProfile?.email} ({userProfile?.role})
              </span>
              <button onClick={handleSignOut} className="btn-secondary text-sm">
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  )
}
