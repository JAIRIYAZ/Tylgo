import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import Layout from '../components/Layout'
import { useAuth } from '../contexts/AuthContext'
import { useCart } from '../contexts/CartContext'
import { supabase } from '../lib/supabase'
import type { Tile } from '../types/database'
import RoomCalculator from '../components/RoomCalculator'

export default function TileDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { userProfile } = useAuth()
  const { addToCart } = useCart()
  const [tile, setTile] = useState<Tile | null>(null)
  const [loading, setLoading] = useState(true)
  const [quantitySqft, setQuantitySqft] = useState(0)
  const [showCalculator, setShowCalculator] = useState(false)

  useEffect(() => {
    if (!id) return
    fetchTile()
  }, [id])

  const fetchTile = async () => {
    if (!id) return

    const { data, error } = await supabase
      .from('tiles')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching tile:', error)
      navigate('/tiles')
    } else {
      setTile(data)
    }
    setLoading(false)
  }

  const handleAddToCart = () => {
    if (!tile || quantitySqft <= 0) return
    addToCart(tile, quantitySqft)
    setQuantitySqft(0)
    alert('Added to cart!')
  }

  const handleCalculatorResult = (sqft: number) => {
    setQuantitySqft(sqft)
    setShowCalculator(false)
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </Layout>
    )
  }

  if (!tile) {
    return (
      <Layout>
        <div className="card text-center py-12">
          <p className="text-gray-600">Tile not found</p>
        </div>
      </Layout>
    )
  }

  const qrCodeUrl = `${window.location.origin}/tiles/${tile.id}`

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <button
          onClick={() => navigate('/tiles')}
          className="text-primary-600 hover:text-primary-700 mb-4"
        >
          ← Back to Tiles
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image and QR Code */}
          <div>
            {tile.image_url ? (
              <img
                src={tile.image_url}
                alt={tile.name}
                className="w-full rounded-lg mb-4"
              />
            ) : (
              <div className="w-full h-96 bg-gray-200 rounded-lg mb-4 flex items-center justify-center">
                <span className="text-gray-400">No Image</span>
              </div>
            )}

            {/* QR Code */}
            <div className="card">
              <h3 className="text-lg font-semibold mb-4">QR Code</h3>
              <div className="flex justify-center mb-4">
                <QRCodeSVG value={qrCodeUrl} size={200} />
              </div>
              <p className="text-sm text-gray-600 text-center">
                Scan to view this tile
              </p>
            </div>
          </div>

          {/* Details */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{tile.name}</h1>
            <p className="text-xl text-gray-600 mb-4">{tile.brand}</p>

            <div className="card mb-6">
              <div className="space-y-3">
                <div>
                  <span className="text-sm font-medium text-gray-500">Size:</span>
                  <span className="ml-2 text-gray-900">{tile.size}</span>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Category:</span>
                  <span className="ml-2 text-gray-900 capitalize">{tile.category}</span>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Price:</span>
                  <span className="ml-2 text-2xl font-bold text-primary-600">
                    ${tile.price_per_sqft}/sqft
                  </span>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Stock:</span>
                  <span className="ml-2 text-gray-900">{tile.stock_quantity} sqft</span>
                </div>
              </div>
            </div>

            {/* Add to Cart */}
            <div className="card">
              <h3 className="text-lg font-semibold mb-4">Add to Cart</h3>

              {showCalculator ? (
                <RoomCalculator onCalculate={handleCalculatorResult} />
              ) : (
                <>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Quantity (sqft)
                    </label>
                    <input
                      type="number"
                      value={quantitySqft || ''}
                      onChange={(e) => setQuantitySqft(parseFloat(e.target.value) || 0)}
                      min="0"
                      step="0.1"
                      className="input-field"
                    />
                  </div>

                  {quantitySqft > 0 && (
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">
                        Total: ${(quantitySqft * tile.price_per_sqft).toFixed(2)}
                      </p>
                    </div>
                  )}

                  <div className="flex space-x-2">
                    <button
                      onClick={handleAddToCart}
                      disabled={quantitySqft <= 0}
                      className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Add to Cart
                    </button>
                    <button
                      onClick={() => setShowCalculator(true)}
                      className="btn-secondary"
                    >
                      Use Calculator
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
