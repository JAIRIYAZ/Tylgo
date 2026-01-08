import { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import type { Tile } from '../types/database'

export default function ManageTilesPage() {
  const { userProfile } = useAuth()
  const [tiles, setTiles] = useState<Tile[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingTile, setEditingTile] = useState<Tile | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    size: '',
    category: '',
    price_per_sqft: '',
    stock_quantity: '',
    image_url: '',
  })

  useEffect(() => {
    if (!userProfile?.company_id) return
    fetchTiles()
  }, [userProfile])

  const fetchTiles = async () => {
    if (!userProfile?.company_id) return

    const { data, error } = await supabase
      .from('tiles')
      .select('*')
      .eq('company_id', userProfile.company_id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching tiles:', error)
    } else {
      setTiles(data || [])
    }
    setLoading(false)
  }

  const handleOpenModal = (tile?: Tile) => {
    if (tile) {
      setEditingTile(tile)
      setFormData({
        name: tile.name,
        brand: tile.brand,
        size: tile.size,
        category: tile.category,
        price_per_sqft: tile.price_per_sqft.toString(),
        stock_quantity: tile.stock_quantity.toString(),
        image_url: tile.image_url || '',
      })
    } else {
      setEditingTile(null)
      setFormData({
        name: '',
        brand: '',
        size: '',
        category: '',
        price_per_sqft: '',
        stock_quantity: '',
        image_url: '',
      })
    }
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingTile(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userProfile?.company_id) return

    try {
      const tileData = {
        company_id: userProfile.company_id,
        name: formData.name,
        brand: formData.brand,
        size: formData.size,
        category: formData.category,
        price_per_sqft: parseFloat(formData.price_per_sqft),
        stock_quantity: parseFloat(formData.stock_quantity),
        image_url: formData.image_url || null,
      }

      if (editingTile) {
        const { error } = await supabase
          .from('tiles')
          .update(tileData)
          .eq('id', editingTile.id)

        if (error) throw error
      } else {
        const { error } = await supabase.from('tiles').insert(tileData)
        if (error) throw error
      }

      handleCloseModal()
      fetchTiles()
    } catch (error) {
      console.error('Error saving tile:', error)
      alert('Failed to save tile')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this tile?')) return

    const { error } = await supabase.from('tiles').delete().eq('id', id)
    if (error) {
      console.error('Error deleting tile:', error)
      alert('Failed to delete tile')
    } else {
      fetchTiles()
    }
  }

  return (
    <Layout>
      <div>
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Manage Tiles</h1>
          <button onClick={() => handleOpenModal()} className="btn-primary">
            Add New Tile
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <div className="card">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Image</th>
                    <th className="text-left py-2">Name</th>
                    <th className="text-left py-2">Brand</th>
                    <th className="text-left py-2">Size</th>
                    <th className="text-left py-2">Category</th>
                    <th className="text-right py-2">Price/sqft</th>
                    <th className="text-right py-2">Stock</th>
                    <th className="text-right py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tiles.map((tile) => (
                    <tr key={tile.id} className="border-b">
                      <td className="py-2">
                        {tile.image_url ? (
                          <img
                            src={tile.image_url}
                            alt={tile.name}
                            className="w-16 h-16 object-cover rounded"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-gray-200 rounded"></div>
                        )}
                      </td>
                      <td className="py-2">{tile.name}</td>
                      <td className="py-2">{tile.brand}</td>
                      <td className="py-2">{tile.size}</td>
                      <td className="py-2 capitalize">{tile.category}</td>
                      <td className="text-right py-2">${tile.price_per_sqft.toFixed(2)}</td>
                      <td className="text-right py-2">{tile.stock_quantity}</td>
                      <td className="text-right py-2">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => handleOpenModal(tile)}
                            className="text-primary-600 hover:text-primary-700"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(tile.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold mb-4">
                {editingTile ? 'Edit Tile' : 'Add New Tile'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="input-field"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Brand *
                    </label>
                    <input
                      type="text"
                      value={formData.brand}
                      onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                      className="input-field"
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Size *
                    </label>
                    <input
                      type="text"
                      value={formData.size}
                      onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                      className="input-field"
                      placeholder="e.g., 600x1200"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category *
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) =>
                        setFormData({ ...formData, category: e.target.value })
                      }
                      className="input-field"
                      required
                    >
                      <option value="">Select category</option>
                      <option value="floor">Floor</option>
                      <option value="wall">Wall</option>
                      <option value="elevation">Elevation</option>
                      <option value="bathroom">Bathroom</option>
                      <option value="kitchen">Kitchen</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Price per sqft *
                    </label>
                    <input
                      type="number"
                      value={formData.price_per_sqft}
                      onChange={(e) =>
                        setFormData({ ...formData, price_per_sqft: e.target.value })
                      }
                      className="input-field"
                      step="0.01"
                      min="0"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Stock Quantity (sqft) *
                    </label>
                    <input
                      type="number"
                      value={formData.stock_quantity}
                      onChange={(e) =>
                        setFormData({ ...formData, stock_quantity: e.target.value })
                      }
                      className="input-field"
                      step="0.1"
                      min="0"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Image URL
                  </label>
                  <input
                    type="url"
                    value={formData.image_url}
                    onChange={(e) =>
                      setFormData({ ...formData, image_url: e.target.value })
                    }
                    className="input-field"
                    placeholder="https://..."
                  />
                </div>
                <div className="flex justify-end space-x-4 pt-4">
                  <button type="button" onClick={handleCloseModal} className="btn-secondary">
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary">
                    {editingTile ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}
