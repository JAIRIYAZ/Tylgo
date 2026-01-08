import { createContext, useContext, useState, type ReactNode } from 'react'
import type { Tile } from '../types/database'

interface CartItem {
  tile: Tile
  quantitySqft: number
}

interface CartContextType {
  items: CartItem[]
  addToCart: (tile: Tile, quantitySqft: number) => void
  removeFromCart: (tileId: string) => void
  updateQuantity: (tileId: string, quantitySqft: number) => void
  clearCart: () => void
  totalSqft: number
  totalAmount: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])

  const addToCart = (tile: Tile, quantitySqft: number) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.tile.id === tile.id)
      if (existing) {
        return prev.map((item) =>
          item.tile.id === tile.id
            ? { ...item, quantitySqft: item.quantitySqft + quantitySqft }
            : item
        )
      }
      return [...prev, { tile, quantitySqft }]
    })
  }

  const removeFromCart = (tileId: string) => {
    setItems((prev) => prev.filter((item) => item.tile.id !== tileId))
  }

  const updateQuantity = (tileId: string, quantitySqft: number) => {
    if (quantitySqft <= 0) {
      removeFromCart(tileId)
      return
    }
    setItems((prev) =>
      prev.map((item) =>
        item.tile.id === tileId ? { ...item, quantitySqft } : item
      )
    )
  }

  const clearCart = () => {
    setItems([])
  }

  const totalSqft = items.reduce((sum, item) => sum + item.quantitySqft, 0)
  const totalAmount = items.reduce(
    (sum, item) => sum + item.quantitySqft * item.tile.price_per_sqft,
    0
  )

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalSqft,
        totalAmount,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
