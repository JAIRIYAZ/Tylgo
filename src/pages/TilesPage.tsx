import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Upload } from 'lucide-react'
import Layout from '../components/Layout'
import Modal from '../components/Modal'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import type { Tile } from '../types/database'

export default function TilesPage() {
  const { userProfile } = useAuth()
  const [tiles, setTiles] = useState<Tile[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    code: '',
    height: '',
    width: '',
    pricePerBox: '',
    piecesPerBox: '',
    category: '',
    imageUrl: '',
    imageFile: null as File | null
  })

  useEffect(() => {
    if (!userProfile?.company_id) {
      setLoading(false)
      return
    }

    fetchTiles()
  }, [userProfile])

  const fetchTiles = async () => {
    if (!userProfile?.company_id) return

    setLoading(true)
    let query = supabase
      .from('tiles')
      .select('*')
      .eq('company_id', userProfile.company_id)

    if (selectedCategory !== 'all') {
      query = query.eq('category', selectedCategory)
    }

    if (searchQuery) {
      query = query.or(
        `name.ilike.%${searchQuery}%,brand.ilike.%${searchQuery}%,size.ilike.%${searchQuery}%`
      )
    }

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching tiles:', error)
    } else {
      setTiles(data || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchTiles()
  }, [selectedCategory, searchQuery])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({ ...prev, imageFile: e.target.files![0] }))
    }
  }

  const handleSave = async () => {
    if (!userProfile?.company_id) return

    try {
      setIsSubmitting(true)

      // Calculate price per sqft
      // Height(mm) * Width(mm) * Pieces = Area per box in mm^2
      // Area in mm^2 / 92903.04 = Area in sqft
      // Price per box / Area in sqft = Price per sqft

      const height = parseFloat(formData.height)
      const width = parseFloat(formData.width)
      const pieces = parseFloat(formData.piecesPerBox)
      const priceBox = parseFloat(formData.pricePerBox)

      if (!height || !width || !pieces || !priceBox) {
        alert('Please fill in all dimensions and price details correctly')
        return
      }

      const areaPerBoxMm2 = height * width * pieces
      const areaPerBoxSqft = areaPerBoxMm2 / 92903.04
      const pricePerSqft = priceBox / areaPerBoxSqft

      // Handle Image Upload if file exists, else use URL
      let finalImageUrl = formData.imageUrl

      if (formData.imageFile) {
        const file = formData.imageFile
        const fileExt = file.name.split('.').pop()
        const fileName = `${Math.random()}.${fileExt}`
        const filePath = `${userProfile.company_id}/${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('tile-images')
          .upload(filePath, file)

        if (uploadError) {
          console.error('Error uploading image:', uploadError)
          // Continue without image or handle error? For now, continuing.
        } else {
          const { data: { publicUrl } } = supabase.storage
            .from('tile-images')
            .getPublicUrl(filePath)
          finalImageUrl = publicUrl
        }
      }

      const newTile = {
        company_id: userProfile.company_id,
        name: formData.code,
        brand: 'Generic', // specific field not in form
        size: `${formData.height}x${formData.width}mm`,
        category: formData.category,
        price_per_sqft: parseFloat(pricePerSqft.toFixed(2)),
        image_url: finalImageUrl || null,
        stock_quantity: 0
      }

      const { error } = await supabase
        .from('tiles')
        .insert([newTile])

      if (error) {
        throw error
      }

      setIsModalOpen(false)
      fetchTiles()
      // Reset form
      setFormData({
        code: '',
        height: '',
        width: '',
        pricePerBox: '',
        piecesPerBox: '',
        category: '',
        imageUrl: '',
        imageFile: null
      })

    } catch (error) {
      console.error('Error adding tile:', error)
      alert('Failed to add tile')
    } finally {
      setIsSubmitting(false)
    }
  }

  const categories = Array.from(new Set(tiles.map((t) => t.category)))

  return (
    <Layout>
      <div>
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Tiles</h1>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Plus size={20} />
            Add New Tile
          </button>
        </div>

        {/* Search and Filters */}
        <div className="card mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search
              </label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, brand, or size..."
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="input-field"
              >
                <option value="all">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Tiles Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : tiles.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-gray-600">No tiles found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {tiles.map((tile) => (
              <Link
                key={tile.id}
                to={`/tiles/${tile.id}`}
                className="card hover:shadow-lg transition-shadow"
              >
                {tile.image_url ? (
                  <img
                    src={tile.image_url}
                    alt={tile.name}
                    className="w-full h-48 object-cover rounded-lg mb-4"
                  />
                ) : (
                  <div className="w-full h-48 bg-gray-200 rounded-lg mb-4 flex items-center justify-center">
                    <span className="text-gray-400">No Image</span>
                  </div>
                )}
                <h3 className="font-semibold text-lg mb-1">{tile.name}</h3>
                <p className="text-sm text-gray-600 mb-2">{tile.brand}</p>
                <p className="text-sm text-gray-600 mb-2">Size: {tile.size}</p>
                <p className="text-sm text-gray-600 mb-2">Category: {tile.category}</p>
                <p className="text-lg font-bold text-primary-600">
                  ${tile.price_per_sqft}/sqft
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  Stock: {tile.stock_quantity} sqft
                </p>
              </Link>
            ))}
          </div>
        )}

        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Add New Tile"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tile Code
              </label>
              <input
                type="text"
                name="code"
                value={formData.code}
                onChange={handleInputChange}
                placeholder="e.g., TH007"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Height(mm)
                </label>
                <input
                  type="number"
                  name="height"
                  value={formData.height}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Width Length(mm)
                </label>
                <input
                  type="number"
                  name="width"
                  value={formData.width}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price/Box
                </label>
                <input
                  type="number"
                  name="pricePerBox"
                  value={formData.pricePerBox}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pieces/Box
                </label>
                <input
                  type="number"
                  name="piecesPerBox"
                  value={formData.piecesPerBox}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <input
                type="text"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                placeholder="e.g., Bathroom, Kitchen, Living Room"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tile Image
              </label>
              <div className="flex gap-4 items-start">
                <div className="flex-1">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:bg-gray-50">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-8 h-8 mb-2 text-gray-400" />
                      <p className="text-sm text-gray-500">Upload Image</p>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                  </label>
                  {formData.imageFile && (
                    <p className="text-xs text-green-600 mt-1">Selected: {formData.imageFile.name}</p>
                  )}
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Or Image URL
                  </label>
                  <input
                    type="text"
                    name="imageUrl"
                    value={formData.imageUrl}
                    onChange={handleInputChange}
                    placeholder="https://..."
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-8">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSubmitting}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Adding...' : 'Add Tile'}
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </Layout>
  )
}
