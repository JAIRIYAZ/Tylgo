import { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import type { User } from '../types/database'

export default function ManageWorkersPage() {
  const { userProfile } = useAuth()
  const [workers, setWorkers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'worker' as 'admin' | 'worker',
  })

  useEffect(() => {
    if (!userProfile?.company_id) return
    fetchWorkers()
  }, [userProfile])

  const fetchWorkers = async () => {
    if (!userProfile?.company_id) return

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('company_id', userProfile.company_id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching workers:', error)
    } else {
      setWorkers(data || [])
    }
    setLoading(false)
  }

  const handleOpenModal = () => {
    setFormData({
      email: '',
      password: '',
      role: 'worker',
    })
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userProfile?.company_id) return

    try {
      // Sign up the new user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      })

      if (authError) throw authError

      // Create user profile
      if (authData.user) {
        const { error: userError } = await supabase.from('users').insert({
          id: authData.user.id,
          email: formData.email,
          company_id: userProfile.company_id,
          role: formData.role,
        })

        if (userError) throw userError
      }

      handleCloseModal()
      fetchWorkers()
      alert('Worker added successfully!')
    } catch (error: any) {
      console.error('Error adding worker:', error)
      alert(error.message || 'Failed to add worker')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this worker?')) return

    const { error } = await supabase.from('users').delete().eq('id', id)
    if (error) {
      console.error('Error deleting worker:', error)
      alert('Failed to remove worker')
    } else {
      fetchWorkers()
    }
  }

  return (
    <Layout>
      <div>
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Manage Workers</h1>
          <button onClick={handleOpenModal} className="btn-primary">
            Add Worker
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
                    <th className="text-left py-2">Email</th>
                    <th className="text-left py-2">Role</th>
                    <th className="text-left py-2">Created</th>
                    <th className="text-right py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {workers.map((worker) => (
                    <tr key={worker.id} className="border-b">
                      <td className="py-2">{worker.email}</td>
                      <td className="py-2 capitalize">{worker.role}</td>
                      <td className="py-2">
                        {new Date(worker.created_at).toLocaleDateString()}
                      </td>
                      <td className="text-right py-2">
                        {worker.id !== userProfile?.id && (
                          <button
                            onClick={() => handleDelete(worker.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            Remove
                          </button>
                        )}
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
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h2 className="text-2xl font-bold mb-4">Add Worker</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password *
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    className="input-field"
                    minLength={6}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Role *
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        role: e.target.value as 'admin' | 'worker',
                      })
                    }
                    className="input-field"
                  >
                    <option value="worker">Worker</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div className="flex justify-end space-x-4 pt-4">
                  <button type="button" onClick={handleCloseModal} className="btn-secondary">
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary">
                    Add Worker
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
