import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Layout from '../components/Layout'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import type { Tile, Quotation } from '../types/database'

export default function Dashboard() {
  const { userProfile } = useAuth()
  const [tilesCount, setTilesCount] = useState(0)
  const [quotationsCount, setQuotationsCount] = useState(0)
  const [recentTiles, setRecentTiles] = useState<Tile[]>([])
  const [recentQuotations, setRecentQuotations] = useState<Quotation[]>([])

  useEffect(() => {
    if (!userProfile?.company_id) return

    // Fetch tiles count
    supabase
      .from('tiles')
      .select('id', { count: 'exact', head: true })
      .eq('company_id', userProfile.company_id)
      .then(({ count }) => setTilesCount(count || 0))

    // Fetch quotations count
    supabase
      .from('quotations')
      .select('id', { count: 'exact', head: true })
      .eq('company_id', userProfile.company_id)
      .then(({ count }) => setQuotationsCount(count || 0))

    // Fetch recent tiles
    supabase
      .from('tiles')
      .select('*')
      .eq('company_id', userProfile.company_id)
      .order('created_at', { ascending: false })
      .limit(5)
      .then(({ data }) => setRecentTiles(data || []))

    // Fetch recent quotations
    supabase
      .from('quotations')
      .select('*')
      .eq('company_id', userProfile.company_id)
      .order('created_at', { ascending: false })
      .limit(5)
      .then(({ data }) => setRecentQuotations(data || []))
  }, [userProfile])

  return (
    <Layout>
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Total Tiles</h3>
            <p className="text-3xl font-bold text-primary-600">{tilesCount}</p>
          </div>
          <div className="card">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Total Quotations</h3>
            <p className="text-3xl font-bold text-primary-600">{quotationsCount}</p>
          </div>
          <div className="card">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Role</h3>
            <p className="text-3xl font-bold text-primary-600 capitalize">
              {userProfile?.role}
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
            <div className="space-y-2">
              <Link to="/tiles" className="block btn-primary text-center">
                Browse Tiles
              </Link>
              {userProfile?.role === 'admin' && (
                <Link to="/manage/tiles" className="block btn-secondary text-center">
                  Add New Tile
                </Link>
              )}
              <Link to="/cart" className="block btn-secondary text-center">
                View Cart
              </Link>
            </div>
          </div>

          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Room Calculator</h2>
            <p className="text-gray-600 mb-4">
              Calculate tiles needed for any room size
            </p>
            <Link to="/tiles" className="block btn-primary text-center">
              Use Calculator
            </Link>
          </div>
        </div>

        {/* Recent Tiles */}
        {recentTiles.length > 0 && (
          <div className="card mb-8">
            <h2 className="text-xl font-semibold mb-4">Recent Tiles</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {recentTiles.map((tile) => (
                <Link
                  key={tile.id}
                  to={`/tiles/${tile.id}`}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  {tile.image_url && (
                    <img
                      src={tile.image_url}
                      alt={tile.name}
                      className="w-full h-32 object-cover rounded mb-2"
                    />
                  )}
                  <h3 className="font-semibold">{tile.name}</h3>
                  <p className="text-sm text-gray-600">{tile.brand}</p>
                  <p className="text-sm font-medium text-primary-600">
                    ${tile.price_per_sqft}/sqft
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Recent Quotations */}
        {recentQuotations.length > 0 && (
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Recent Quotations</h2>
            <div className="space-y-2">
              {recentQuotations.map((quotation) => (
                <Link
                  key={quotation.id}
                  to={`/quotations/${quotation.id}`}
                  className="block border rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">
                        ${quotation.total_amount.toFixed(2)}
                      </p>
                      <p className="text-sm text-gray-600">
                        {quotation.total_sqft.toFixed(2)} sqft
                      </p>
                    </div>
                    <p className="text-sm text-gray-500">
                      {new Date(quotation.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}
