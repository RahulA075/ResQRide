import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Search, ShoppingCart, MapPin, Package } from 'lucide-react'
import { Part } from '../types'

const PartsMarketplace: React.FC = () => {
  const navigate = useNavigate()
  const [parts, setParts] = useState<Part[]>([])
  const [filteredParts, setFilteredParts] = useState<Part[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [loading, setLoading] = useState(true)
  const [cart, setCart] = useState<string[]>([])

  const categories = [
    { id: 'all', name: 'All Parts' },
    { id: 'engine', name: 'Engine' },
    { id: 'brakes', name: 'Brakes' },
    { id: 'electrical', name: 'Electrical' },
    { id: 'suspension', name: 'Suspension' },
    { id: 'body', name: 'Body Parts' }
  ]

  useEffect(() => {
    loadParts()
  }, [])

  useEffect(() => {
    filterParts()
  }, [parts, searchQuery, selectedCategory])

  const loadParts = async () => {
    // Mock data - in real app, this would be an API call
    const mockParts: Part[] = [
      {
        id: '1',
        name: 'Brake Pads - Front Set',
        partNumber: 'BP-001-F',
        category: 'brakes',
        price: 7499,
        availability: 5,
        supplier: {
          name: 'AutoParts Express',
          location: { latitude: 40.7505, longitude: -73.9934 },
          distance: 2.1
        }
      },
      {
        id: '2',
        name: 'Engine Oil Filter',
        partNumber: 'OF-205',
        category: 'engine',
        price: 2099,
        availability: 12,
        supplier: {
          name: 'Quick Parts Supply',
          location: { latitude: 40.7128, longitude: -74.0060 },
          distance: 1.5
        }
      },
      {
        id: '3',
        name: 'Car Battery 12V',
        partNumber: 'BAT-12V-65',
        category: 'electrical',
        price: 13299,
        availability: 3,
        supplier: {
          name: 'Battery World',
          location: { latitude: 40.7589, longitude: -73.9851 },
          distance: 0.8
        }
      },
      {
        id: '4',
        name: 'Shock Absorber - Rear',
        partNumber: 'SA-R-001',
        category: 'suspension',
        price: 10399,
        availability: 7,
        supplier: {
          name: 'Suspension Pro',
          location: { latitude: 40.7282, longitude: -73.7949 },
          distance: 3.2
        }
      }
    ]
    setParts(mockParts)
    setLoading(false)
  }

  const filterParts = () => {
    let filtered = [...parts]

    if (searchQuery) {
      filtered = filtered.filter(part =>
        part.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        part.partNumber.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(part => part.category === selectedCategory)
    }

    // Sort by distance
    filtered.sort((a, b) => a.supplier.distance - b.supplier.distance)

    setFilteredParts(filtered)
  }

  const addToCart = (partId: string) => {
    setCart([...cart, partId])
  }

  const removeFromCart = (partId: string) => {
    setCart(cart.filter(id => id !== partId))
  }

  const isInCart = (partId: string) => cart.includes(partId)

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate(-1)}
              className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </button>
            <h1 className="text-lg font-semibold text-gray-900">Parts Marketplace</h1>
          </div>
          <div className="relative">
            <ShoppingCart className="h-5 w-5 text-gray-600" />
            {cart.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-primary-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {cart.length}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white border-b px-4 py-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search parts by name or part number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Categories */}
      <div className="bg-white border-b px-4 py-3">
        <div className="flex space-x-2 overflow-x-auto">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                selectedCategory === category.id
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Results Count */}
      <div className="px-4 py-2 bg-white border-b">
        <p className="text-sm text-gray-600">
          {filteredParts.length} parts found
        </p>
      </div>

      {/* Parts List */}
      <div className="flex-1 overflow-y-auto">
        {filteredParts.length === 0 ? (
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No parts found</h3>
              <p className="text-gray-600">Try adjusting your search or category filter.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-3 p-4">
            {filteredParts.map((part) => (
              <div
                key={part.id}
                className="bg-white rounded-lg shadow-sm border p-4"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">{part.name}</h3>
                    <p className="text-sm text-gray-600 mb-2">Part #: {part.partNumber}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span className="capitalize bg-gray-100 px-2 py-1 rounded-full">
                        {part.category}
                      </span>
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-3 w-3" />
                        <span>{part.supplier.distance}km away</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">₹{part.price.toLocaleString('en-IN')}</p>
                    <p className="text-sm text-gray-600">
                      {part.availability} in stock
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{part.supplier.name}</p>
                    <p className="text-xs text-gray-600">Supplier</p>
                  </div>
                  <div className="flex space-x-2">
                    <button className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition-colors">
                      Reserve
                    </button>
                    <button
                      onClick={() => isInCart(part.id) ? removeFromCart(part.id) : addToCart(part.id)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        isInCart(part.id)
                          ? 'bg-green-500 text-white hover:bg-green-600'
                          : 'bg-primary-500 text-white hover:bg-primary-600'
                      }`}
                    >
                      {isInCart(part.id) ? 'Added' : 'Add to Cart'}
                    </button>
                  </div>
                </div>

                {part.availability <= 3 && (
                  <div className="mt-2 text-xs text-amber-800 bg-yellow-200 px-2 py-1 rounded font-medium">
                    ⚠️ Low stock - only {part.availability} left
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Cart Summary */}
      {cart.length > 0 && (
        <div className="bg-white border-t px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">{cart.length} items in cart</p>
              <p className="text-sm text-gray-600">
                Total: ₹{filteredParts
                  .filter(part => cart.includes(part.id))
                  .reduce((sum, part) => sum + part.price, 0)
                  .toLocaleString('en-IN')}
              </p>
            </div>
            <button className="bg-primary-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-primary-600 transition-colors">
              Checkout
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default PartsMarketplace