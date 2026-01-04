import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, MapPin, Phone, Navigation, Star, Clock, Search, Loader2, MapPinOff } from 'lucide-react'
import { Store } from '../types'

const API_ENDPOINT = 'https://color-edit-api.rkrigney.workers.dev'

const brandLabels: Record<string, string> = {
  sw: 'Sherwin-Williams',
  bm: 'Benjamin Moore',
  behr: 'Behr',
  ppg: 'PPG',
  valspar: 'Valspar'
}

// Map Google Places types to our brand affiliations
function inferBrandAffiliation(name: string, types: string[]): string[] {
  const nameLower = name.toLowerCase()
  const affiliations: string[] = []

  if (nameLower.includes('sherwin') || nameLower.includes('sw')) {
    affiliations.push('sw')
  }
  if (nameLower.includes('benjamin moore') || nameLower.includes('bm')) {
    affiliations.push('bm')
  }
  if (nameLower.includes('home depot')) {
    affiliations.push('behr', 'ppg')
  }
  if (nameLower.includes('lowe')) {
    affiliations.push('valspar', 'sw')
  }
  if (nameLower.includes('ace hardware')) {
    affiliations.push('bm', 'sw')
  }
  if (nameLower.includes('ppg')) {
    affiliations.push('ppg')
  }

  // Default for paint stores without clear affiliation
  if (affiliations.length === 0 && (types.includes('paint_store') || nameLower.includes('paint'))) {
    affiliations.push('sw', 'bm') // Most independent stores carry major brands
  }

  return affiliations
}

function inferStoreType(name: string): Store['storeType'] {
  const nameLower = name.toLowerCase()
  if (nameLower.includes('sherwin') || nameLower.includes('benjamin moore') || nameLower.includes('ppg')) {
    return 'brand_store'
  }
  if (nameLower.includes('home depot') || nameLower.includes('lowe')) {
    return 'big_box'
  }
  if (nameLower.includes('ace') || nameLower.includes('true value')) {
    return 'hardware'
  }
  return 'independent'
}

export default function StoreFinder() {
  const navigate = useNavigate()
  const [stores, setStores] = useState<Store[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filterBrand, setFilterBrand] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [locationStatus, setLocationStatus] = useState<'requesting' | 'granted' | 'denied' | 'error'>('requesting')

  useEffect(() => {
    requestLocation()
  }, [])

  const requestLocation = () => {
    setIsLoading(true)
    setError(null)
    setLocationStatus('requesting')

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser')
      setLocationStatus('error')
      setIsLoading(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        setLocationStatus('granted')
        await fetchNearbyStores(position.coords.latitude, position.coords.longitude)
      },
      (err) => {
        console.error('Geolocation error:', err)
        setLocationStatus('denied')
        setError('Please enable location access to find stores near you')
        setIsLoading(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // Cache for 5 minutes
      }
    )
  }

  const fetchNearbyStores = async (lat: number, lng: number) => {
    try {
      const response = await fetch(`${API_ENDPOINT}/stores`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          latitude: lat,
          longitude: lng,
          radius: 32187, // 20 miles in meters
          limit: 5
        })
      })

      if (!response.ok) {
        throw new Error('Failed to fetch stores')
      }

      const data = await response.json()

      if (data.success && data.stores) {
        const mappedStores: Store[] = data.stores.map((place: any, index: number) => ({
          id: place.place_id || `store-${index}`,
          name: place.name,
          brandAffiliation: inferBrandAffiliation(place.name, place.types || []),
          storeType: inferStoreType(place.name),
          distance: place.distance ? Math.round(place.distance * 10) / 10 : 0,
          address: place.vicinity || place.formatted_address || '',
          city: '', // Places API doesn't separate city
          state: '',
          phone: place.formatted_phone_number || '',
          hours: place.opening_hours?.open_now ? 'Open now' : 'Hours unavailable',
          isOpen: place.opening_hours?.open_now ?? true,
          isFavorite: false
        }))
        setStores(mappedStores)
      } else {
        setError('No paint stores found within 20 miles')
      }
    } catch (err) {
      console.error('Error fetching stores:', err)
      setError('Unable to find nearby stores. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

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
    const address = encodeURIComponent(store.address)
    // Use Google Maps for broader compatibility
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${address}`, '_blank')
  }

  const handleCall = (phone: string) => {
    if (phone) {
      window.open(`tel:${phone.replace(/[^0-9]/g, '')}`, '_blank')
    }
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

      {/* Loading State */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-16 px-4">
          <Loader2 className="w-8 h-8 text-charcoal animate-spin mb-4" />
          <p className="text-charcoal-light text-center">
            {locationStatus === 'requesting' ? 'Requesting location access...' : 'Finding paint stores near you...'}
          </p>
        </div>
      )}

      {/* Error / Permission Denied State */}
      {!isLoading && error && (
        <div className="flex flex-col items-center justify-center py-16 px-4">
          <MapPinOff className="w-12 h-12 text-charcoal-light mb-4" />
          <p className="text-charcoal text-center mb-2 font-medium">Location Required</p>
          <p className="text-charcoal-light text-center text-sm mb-6">{error}</p>
          <button
            onClick={requestLocation}
            className="btn-primary"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Location prompt */}
      {!isLoading && !error && stores.length > 0 && (
        <div className="px-4 py-3 bg-cream-100 text-center">
          <p className="text-xs text-charcoal-light">
            Showing {stores.length} paint stores within 20 miles. Call ahead to confirm availability.
          </p>
        </div>
      )}

      {/* Store List */}
      {!isLoading && !error && (
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
                  <p className="text-sm text-charcoal-light">{store.distance} mi away</p>
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
                <span className="truncate">{store.address}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-charcoal-light mb-3">
                <Clock className="w-4 h-4 flex-shrink-0" />
                <span>{store.hours}</span>
              </div>

              {/* Brands carried */}
              {store.brandAffiliation.length > 0 && (
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
              )}

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleDirections(store)}
                  className="flex-1 btn-secondary flex items-center justify-center gap-2 text-sm"
                >
                  <Navigation className="w-4 h-4" />
                  Directions
                </button>
                {store.phone && (
                  <button
                    onClick={() => handleCall(store.phone)}
                    className="flex-1 btn-secondary flex items-center justify-center gap-2 text-sm"
                  >
                    <Phone className="w-4 h-4" />
                    Call
                  </button>
                )}
                <button
                  onClick={() => toggleFavorite(store.id)}
                  className={`btn-secondary px-3 ${store.isFavorite ? 'text-gold' : ''}`}
                >
                  <Star className={`w-4 h-4 ${store.isFavorite ? 'fill-gold' : ''}`} />
                </button>
              </div>
            </div>
          ))}

          {filteredStores.length === 0 && stores.length > 0 && (
            <div className="text-center py-8">
              <p className="text-charcoal-light">No stores found matching your search.</p>
            </div>
          )}
        </div>
      )}

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
