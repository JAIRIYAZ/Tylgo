import { useState } from 'react'

interface RoomCalculatorProps {
  onCalculate: (sqft: number) => void
}

export default function RoomCalculator({ onCalculate }: RoomCalculatorProps) {
  const [length, setLength] = useState('')
  const [width, setWidth] = useState('')
  const [wastage, setWastage] = useState(10)

  const calculate = () => {
    const l = parseFloat(length)
    const w = parseFloat(width)

    if (l > 0 && w > 0) {
      const area = l * w
      const totalWithWastage = area * (1 + wastage / 100)
      onCalculate(totalWithWastage)
    }
  }

  const area = parseFloat(length) * parseFloat(width) || 0
  const totalWithWastage = area * (1 + wastage / 100)

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Room Length (ft)
        </label>
        <input
          type="number"
          value={length}
          onChange={(e) => setLength(e.target.value)}
          min="0"
          step="0.1"
          className="input-field"
          placeholder="e.g., 12"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Room Width (ft)
        </label>
        <input
          type="number"
          value={width}
          onChange={(e) => setWidth(e.target.value)}
          min="0"
          step="0.1"
          className="input-field"
          placeholder="e.g., 10"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Wastage (%)
        </label>
        <input
          type="number"
          value={wastage}
          onChange={(e) => setWastage(parseFloat(e.target.value) || 0)}
          min="0"
          max="50"
          step="1"
          className="input-field"
        />
      </div>

      {area > 0 && (
        <div className="p-4 bg-gray-50 rounded-lg space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Area:</span>
            <span className="font-medium">{area.toFixed(2)} sqft</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Wastage ({wastage}%):</span>
            <span className="font-medium">
              {(totalWithWastage - area).toFixed(2)} sqft
            </span>
          </div>
          <div className="flex justify-between pt-2 border-t">
            <span className="font-semibold">Total Required:</span>
            <span className="font-bold text-primary-600">
              {totalWithWastage.toFixed(2)} sqft
            </span>
          </div>
        </div>
      )}

      <button onClick={calculate} className="w-full btn-primary">
        Use This Quantity
      </button>
    </div>
  )
}
