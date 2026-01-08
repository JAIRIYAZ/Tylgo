import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import { useCart } from '../contexts/CartContext'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'

export default function CartPage() {
  const { items, updateQuantity, removeFromCart, clearCart, totalSqft, totalAmount } =
    useCart()
  const { userProfile } = useAuth()
  const navigate = useNavigate()

  const handleCreateQuotation = async () => {
    if (!userProfile?.company_id || items.length === 0) return

    try {
      // Create quotation
      const { data: quotation, error: quotationError } = await supabase
        .from('quotations')
        .insert({
          company_id: userProfile.company_id,
          created_by: userProfile.id,
          total_sqft: totalSqft,
          total_amount: totalAmount,
        })
        .select()
        .single()

      if (quotationError) throw quotationError

      // Create quotation items
      const quotationItems = items.map((item) => ({
        quotation_id: quotation.id,
        tile_id: item.tile.id,
        quantity_sqft: item.quantitySqft,
        price_per_sqft: item.tile.price_per_sqft,
        total_amount: item.quantitySqft * item.tile.price_per_sqft,
      }))

      const { error: itemsError } = await supabase
        .from('quotation_items')
        .insert(quotationItems)

      if (itemsError) throw itemsError

      clearCart()
      navigate(`/quotations/${quotation.id}`)
    } catch (error) {
      console.error('Error creating quotation:', error)
      alert('Failed to create quotation')
    }
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Cart</h1>

        {items.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-gray-600 mb-4">Your cart is empty</p>
            <button onClick={() => navigate('/tiles')} className="btn-primary">
              Browse Tiles
            </button>
          </div>
        ) : (
          <>
            <div className="card mb-6">
              <div className="space-y-4">
                {items.map((item) => (
                  <div
                    key={item.tile.id}
                    className="flex items-center space-x-4 border-b pb-4 last:border-0 last:pb-0"
                  >
                    {item.tile.image_url && (
                      <img
                        src={item.tile.image_url}
                        alt={item.tile.name}
                        className="w-20 h-20 object-cover rounded"
                      />
                    )}
                    <div className="flex-1">
                      <h3 className="font-semibold">{item.tile.name}</h3>
                      <p className="text-sm text-gray-600">{item.tile.brand}</p>
                      <p className="text-sm text-gray-600">
                        ${item.tile.price_per_sqft}/sqft
                      </p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">
                          Quantity (sqft)
                        </label>
                        <input
                          type="number"
                          value={item.quantitySqft}
                          onChange={(e) =>
                            updateQuantity(
                              item.tile.id,
                              parseFloat(e.target.value) || 0
                            )
                          }
                          min="0"
                          step="0.1"
                          className="w-24 input-field"
                        />
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">
                          ${(item.quantitySqft * item.tile.price_per_sqft).toFixed(2)}
                        </p>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.tile.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card">
              <div className="space-y-4">
                <div className="flex justify-between text-lg">
                  <span className="font-semibold">Total Sqft:</span>
                  <span>{totalSqft.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-2xl border-t pt-4">
                  <span className="font-bold">Total Amount:</span>
                  <span className="font-bold text-primary-600">
                    ${totalAmount.toFixed(2)}
                  </span>
                </div>
                <div className="flex space-x-4 pt-4">
                  <button onClick={clearCart} className="flex-1 btn-secondary">
                    Clear Cart
                  </button>
                  <button onClick={handleCreateQuotation} className="flex-1 btn-primary">
                    Create Quotation
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </Layout>
  )
}
