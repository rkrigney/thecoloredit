import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, MapPin, Phone, Navigation, Star, Clock, Search } from 'lucide-react'
import { Store } from '../types'

// Mock store data (in real app, this would come from MapKit API)
const mockStores: Store[] = [
  {
    id: 'sw-downtown',
    name: 'Sherwin-Williams',
    brandAffiliation: ['sw'],
    storeType: 'brand_store',
    distance: 0.8,
    address: '123 Main Street',
    city: 'Downtown',
    state: 'NY',
    phone: '(212) 555-0123',
    hours: 'Open until 6 PM',
    isOpen: true,
    isFavorite: false
  },
  {
    id: 'bm-dealer',
    name: 'Benjamin Moore Dealer - Color World',
    brandAffiliation: ['bm'],
    storeType: 'independent',
    distance: 1.2,
    address: '456 Oak Avenue',
    city: 'Midtown',
    state: 'NY',
    phone: '(212) 555-0456',
    hours: 'Open until 7 PM',
    isOpen: true,
    isFavorite: true
  },
  {
    id: 'home-depot',
    name: 'The Home Depot',
    brandAffiliation: ['behr', 'ppg'],
    storeType: 'big_box',
    distance: 2.1,
    address: '789 Commerce Blvd',
    city: 'Suburbs',
    state: 'NY',
    phone: '(212) 555-0789',
    hours: 'Open until 9 PM',
    isOpen: true,
    isFavorite: false
  },
  {
    id: 'lowes',
    name: "Lowe's",
    brandAffiliation: ['valspar', 'sw'],
    storeType: 'big_box',
    distance: 2.4,
    address: '321 Retail Park',
    city: 'Suburbs',
    state: 'NY',
    phone: '(212) 555-0321',
    hours: 'Open until 9 PM',
    isOpen: true,
    isFavorite: false
  },
  {
    id: 'ace-hardware',
    name: 'Ace Hardware',
    brandAffiliation: ['bm', 'sw'],
    storeType: 'hardware',
    distance: 0.5,
    address: '55 Local Lane',
    city: 'Downtown',
    state: 'NY',
    phone: '(212) 555-0055',
    hours: 'Closed - Opens 8 AM',
    isOpen: false,
    isFavorite: false
  }
]

const brandLabels: Record<string, string> = {
  sw: 'Sherwin-Williams',
  bm: 'Benjamin Moore',
  behr: 'Behr',
  ppg: 'PPG',
  valspar: 'Valspar'
}

export default function StoreFinder() {
  const navigate = useNavigate()
  const [stores, setStores] = useState(mockStores)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterBrand, setFilterBrand] = useState<string | null>(null)

  const filteredStores = stores
    .filter(store => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        return store.name.toLowerCase().includes(query) ||
          store.address.toLowerCase().includes(query) ||
          store.brandAffiliation.some(b => brandLabels[b]?.toLowerCase().includes(query))
      }
      return true
    })
    .filter(store => {
      if (filterBrand) {
        return store.brandAffiliation.includes(filterBrand)
      }
      return true
    })
    .sort((a, b) => {
      // Favorites first, then by distance
      if (a.isFavorite && !b.isFavorite) return -1
      if (!a.isFavorite && b.isFavorite) return 1
      return a.distance - b.distance
    })

  const toggleFavorite = (storeId: string) => {
    setStores(prev => prev.map(store =>
      store.id === storeId ? { ...store, isFavorite: !store.isFavorite } : store
    ))
  }

  const handleDirections = (store: Store) => {
    const address = encodeURIComponent(`${store.address}, ${store.city}, ${store.state}`)
    window.open(`https://maps.apple.com/?daddr=${address}`, '_blank')
  }

  const handleCall = (phone: string) => {
    window.open(`tel:${phone.replace(/[^0-9]/g, '')}`, '_blank')
  }

  return (
    <div className="min-h-screen bg-cream-50 pb-24">
      {/* Header */}
      <header className="sticky top-0 bg-cream-50/95 backdrop-blur-sm z-10 px-4 py-4 border-b border-charcoal/5">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 text-charcoal-light hover:text-charcoal transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-serif text-lg text-charcoal">Find Stores</h1>
          <div className="w-9" />
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-charcoal-light" />
          <input
            type="text"
            placeholder="Search stores or brands..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border border-charcoal/10 rounded-xl text-sm
                     placeholder:text-charcoal-lighter focus:outline-none focus:border-charcoal/30"
          />
        </div>

        {/* Brand filters */}
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4">
          <button
            onClick={() => setFilterBrand(null)}
            className={`flex-shrink-0 ${!filterBrand ? 'btn-pill-selected' : 'btn-pill'} text-xs`}
          >
            All
          </button>
          {['sw', 'bm', 'behr', 'ppg'].map(brand => (
            <button
              key={brand}
              onClick={() => setFilterBrand(filterBrand === brand ? null : brand)}
              className={`flex-shrink-0 ${filterBrand === brand ? 'btn-pill-selected' : 'btn-pill'} text-xs`}
            >
              {brandLabels[brand]}
            </button>
          ))}
        </div>
      </header>

      {/* Location prompt */}
      <div className="px-4 py-3 bg-cream-100 text-center">
        <p className="text-xs text-charcoal-light">
          Showing stores near you. Call ahead to confirm availability.
        </p>
      </div>

      {/* Store List */}
      <div className="p-4 space-y-3">
        {filteredStores.map(store => (
          <div key={store.id} className="card p-4">
            <div className="flex items-start gap-3 mb-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium text-charcoal truncate">{store.name}</h3>
                  {store.isFavorite && (
                    <Star className="w-4 h-4 text-gold fill-gold flex-shrink-0" />
                  )}
                </div>
                <p className="text-sm text-charcoal-light">{store.city} · {store.distance} mi</p>
              </div>
              <div className={`px-2 py-1 rounded-full text-xs ${
                store.isOpen ? 'bg-emerald-50 text-emerald-700' : 'bg-charcoal/5 text-charcoal-light'
              }`}>
                {store.isOpen ? 'Open' : 'Closed'}
              </div>
            </div>

            {/* Address & Hours */}
            <div className="flex items-center gap-2 text-sm text-charcoal-light mb-2">
              <MapPin className="w-4 h-4 flex-shrink-0" />
              <span>{store.address}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-charcoal-light mb-3">
              <Clock className="w-4 h-4 flex-shrink-0" />
              <span>{store.hours}</span>
            </div>

            {/* Brands carried */}
            <div className="flex flex-wrap gap-1 mb-4">
              {store.brandAffiliation.map(brand => (
                <span
                  key={brand}
                  className="px-2 py-0.5 bg-cream-100 text-charcoal-light text-xs rounded-full"
                >
                  {brandLabels[brand] || brand}
                </span>
              ))}
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={() => handleDirections(store)}
                className="flex-1 btn-secondary flex items-center justify-center gap-2 text-sm"
              >
                <Navigation className="w-4 h-4" />
                Directions
              </button>
              <button
                onClick={() => handleCall(store.phone)}
                className="flex-1 btn-secondary flex items-center justify-center gap-2 text-sm"
              >
                <Phone className="w-4 h-4" />
                Call
              </button>
              <button
                onClick={() => toggleFavorite(store.id)}
                className={`btn-secondary px-3 ${store.isFavorite ? 'text-gold' : ''}`}
              >
                <Star className={`w-4 h-4 ${store.isFavorite ? 'fill-gold' : ''}`} />
              </button>
            </div>
          </div>
        ))}

        {filteredStores.length === 0 && (
          <div className="text-center py-8">
            <p className="text-charcoal-light">No stores found matching your search.</p>
          </div>
        )}
      </div>

      {/* Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-cream-50 border-t border-charcoal/10 px-4 py-3 safe-area-inset-bottom">
        <button
          onClick={() => navigate('/shopping-list')}
          className="btn-primary w-full"
        >
          Back to shopping list
        </button>
      </div>
    </div>
  )
}
