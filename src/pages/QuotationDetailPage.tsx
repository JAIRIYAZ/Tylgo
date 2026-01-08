import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import Layout from '../components/Layout'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import type { Quotation, QuotationItem, Tile } from '../types/database'

export default function QuotationDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { userProfile } = useAuth()
  const [quotation, setQuotation] = useState<Quotation | null>(null)
  const [items, setItems] = useState<(QuotationItem & { tile: Tile })[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    fetchQuotation()
  }, [id])

  const fetchQuotation = async () => {
    if (!id) return

    const { data: quotationData, error: quotationError } = await supabase
      .from('quotations')
      .select('*')
      .eq('id', id)
      .single()

    if (quotationError) {
      console.error('Error fetching quotation:', quotationError)
      navigate('/quotations')
      return
    }

    setQuotation(quotationData)

    const { data: itemsData, error: itemsError } = await supabase
      .from('quotation_items')
      .select('*')
      .eq('quotation_id', id)

    if (itemsError) {
      console.error('Error fetching items:', itemsError)
      setLoading(false)
      return
    }

    // Fetch tile details for each item
    const tilesData = await Promise.all(
      itemsData.map(async (item) => {
        const { data: tile } = await supabase
          .from('tiles')
          .select('*')
          .eq('id', item.tile_id)
          .single()
        return { ...item, tile: tile || ({} as Tile) }
      })
    )

    setItems(tilesData)
    setLoading(false)
  }

  const handleDownloadPDF = async () => {
    const element = document.getElementById('quotation-content')
    if (!element) return

    const canvas = await html2canvas(element)
    const imgData = canvas.toDataURL('image/png')

    const pdf = new jsPDF('p', 'mm', 'a4')
    const imgWidth = 210
    const pageHeight = 295
    const imgHeight = (canvas.height * imgWidth) / canvas.width
    let heightLeft = imgHeight

    let position = 0

    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
    heightLeft -= pageHeight

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight
      pdf.addPage()
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight
    }

    pdf.save(`quotation-${id}.pdf`)
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

  if (!quotation) {
    return (
      <Layout>
        <div className="card text-center py-12">
          <p className="text-gray-600">Quotation not found</p>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => navigate('/quotations')}
            className="text-primary-600 hover:text-primary-700"
          >
            ← Back to Quotations
          </button>
          <button onClick={handleDownloadPDF} className="btn-primary">
            Download PDF
          </button>
        </div>

        <div id="quotation-content" className="card bg-white">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-primary-600 mb-2">TYLGO</h1>
            <h2 className="text-2xl font-semibold text-gray-900">Quotation</h2>
          </div>

          <div className="mb-8">
            <p className="text-sm text-gray-600">
              Date: {new Date(quotation.created_at).toLocaleDateString()}
            </p>
            <p className="text-sm text-gray-600">
              Quotation ID: {quotation.id.slice(0, 8)}
            </p>
          </div>

          <table className="w-full mb-8">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Tile</th>
                <th className="text-right py-2">Quantity (sqft)</th>
                <th className="text-right py-2">Price/sqft</th>
                <th className="text-right py-2">Total</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-b">
                  <td className="py-2">
                    <p className="font-semibold">{item.tile.name}</p>
                    <p className="text-sm text-gray-600">{item.tile.brand}</p>
                  </td>
                  <td className="text-right py-2">{item.quantity_sqft.toFixed(2)}</td>
                  <td className="text-right py-2">${item.price_per_sqft.toFixed(2)}</td>
                  <td className="text-right py-2">${item.total_amount.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2">
                <td colSpan={3} className="text-right py-2 font-semibold">
                  Total Sqft:
                </td>
                <td className="text-right py-2 font-semibold">
                  {quotation.total_sqft.toFixed(2)}
                </td>
              </tr>
              <tr>
                <td colSpan={3} className="text-right py-2 font-bold text-lg">
                  Total Amount:
                </td>
                <td className="text-right py-2 font-bold text-lg text-primary-600">
                  ${quotation.total_amount.toFixed(2)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </Layout>
  )
}
