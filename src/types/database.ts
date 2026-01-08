export interface Company {
  id: string
  name: string
  created_at: string
}

export interface User {
  id: string
  email: string
  company_id: string
  role: 'admin' | 'worker'
  created_at: string
}

export interface Tile {
  id: string
  company_id: string
  name: string
  brand: string
  size: string
  category: string
  price_per_sqft: number
  image_url: string | null
  stock_quantity: number
  created_at: string
  updated_at: string
}

export interface Quotation {
  id: string
  company_id: string
  created_by: string
  total_sqft: number
  total_amount: number
  created_at: string
}

export interface QuotationItem {
  id: string
  quotation_id: string
  tile_id: string
  quantity_sqft: number
  price_per_sqft: number
  total_amount: number
  created_at: string
}
