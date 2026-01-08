import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Layout from '../components/Layout'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import type { Quotation } from '../types/database'

export default function QuotationsPage() {
  const { userProfile } = useAuth()
  const [quotations, setQuotations] = useState<Quotation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userProfile?.company_id) return
    fetchQuotations()
  }, [userProfile])

  const fetchQuotations = async () => {
    if (!userProfile?.company_id) return

    const { data, error } = await supabase
      .from('quotations')
      .select('*')
      .eq('company_id', userProfile.company_id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching quotations:', error)
    } else {
      setQuotations(data || [])
    }
    setLoading(false)
  }

  return (
    <Layout>
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Quotations</h1>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : quotations.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-gray-600 mb-4">No quotations found</p>
            <Link to="/tiles" className="btn-primary">
              Browse Tiles
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {quotations.map((quotation) => (
              <Link
                key={quotation.id}
                to={`/quotations/${quotation.id}`}
                className="card hover:shadow-lg transition-shadow block"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-500">
                      {new Date(quotation.created_at).toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      {quotation.total_sqft.toFixed(2)} sqft
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary-600">
                      ${quotation.total_amount.toFixed(2)}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}
