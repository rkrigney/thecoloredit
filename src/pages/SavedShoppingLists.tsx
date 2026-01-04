import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ShoppingBag, Trash2, Calendar, Loader2 } from 'lucide-react'
import { db } from '../lib/instantdb'
import { useAppContext } from '../App'
import { ShoppingListItem } from '../types'

export default function SavedShoppingLists() {
  const navigate = useNavigate()
  const { user } = db.useAuth()
  const { setShoppingListFromSaved } = useAppContext()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const { isLoading, data, error } = db.useQuery(
    user
      ? {
          savedShoppingLists: {
            $: { where: { userId: user.id }, order: { createdAt: 'desc' } }
          }
        }
      : null
  ) as { isLoading: boolean; data: { savedShoppingLists?: any[] } | undefined; error: any }

  if (!user) {
    navigate('/')
    return null
  }

  const handleLoad = (saved: { shoppingListData: string }) => {
    try {
      const shoppingListData = JSON.parse(saved.shoppingListData) as ShoppingListItem[]
      setShoppingListFromSaved(shoppingListData)
      navigate('/shopping-list')
    } catch (err) {
      console.error('Failed to load shopping list:', err)
    }
  }

  const handleDelete = async (id: string) => {
    setDeletingId(id)
    try {
      await db.transact((db.tx as any).savedShoppingLists[id].delete())
    } catch (err) {
      console.error('Failed to delete shopping list:', err)
    } finally {
      setDeletingId(null)
    }
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  return (
    <div className="min-h-screen bg-cream-50">
      {/* Header */}
      <header className="sticky top-0 bg-cream-50/95 backdrop-blur-sm z-10 px-4 py-4 border-b border-charcoal/5">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 text-charcoal-light hover:text-charcoal transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-serif text-lg text-charcoal">Saved Shopping Lists</h1>
          <div className="w-9" />
        </div>
      </header>

      {/* Content */}
      <div className="p-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-charcoal-light" />
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-charcoal-light">Failed to load saved shopping lists.</p>
          </div>
        ) : !data?.savedShoppingLists?.length ? (
          <div className="text-center py-12">
            <ShoppingBag className="w-12 h-12 text-charcoal/20 mx-auto mb-4" />
            <p className="text-charcoal-light mb-4">No saved shopping lists yet.</p>
            <button
              onClick={() => navigate('/setup')}
              className="btn-primary"
            >
              Start creating your palette
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {data.savedShoppingLists.map((saved) => {
              const items = JSON.parse(saved.shoppingListData) as ShoppingListItem[]
              const totalItems = items.length
              const totalGallons = items.reduce((sum, item) => sum + item.quantity.gallons, 0)

              return (
                <div
                  key={saved.id}
                  className="bg-white rounded-xl border border-charcoal/10 overflow-hidden"
                >
                  <button
                    onClick={() => handleLoad(saved)}
                    className="w-full p-4 text-left hover:bg-cream-100/50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-medium text-charcoal">{saved.name}</h3>
                        <p className="text-sm text-charcoal-light">
                          {totalItems} {totalItems === 1 ? 'item' : 'items'} · {totalGallons} {totalGallons === 1 ? 'gallon' : 'gallons'}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-charcoal-light">
                        <Calendar className="w-3 h-3" />
                        {formatDate(saved.createdAt)}
                      </div>
                    </div>

                    {/* Color swatches preview */}
                    <div className="flex gap-1.5">
                      {items.slice(0, 5).map((item, i) => (
                        <div
                          key={i}
                          className="w-10 h-10 rounded-lg shadow-sm"
                          style={{ backgroundColor: item.color.hex }}
                          title={item.color.name}
                        />
                      ))}
                      {items.length > 5 && (
                        <div className="w-10 h-10 rounded-lg bg-charcoal/10 flex items-center justify-center text-xs text-charcoal-light">
                          +{items.length - 5}
                        </div>
                      )}
                    </div>
                  </button>

                  <div className="border-t border-charcoal/5 px-4 py-2 flex justify-end">
                    <button
                      onClick={() => handleDelete(saved.id)}
                      disabled={deletingId === saved.id}
                      className="p-2 text-charcoal-light hover:text-red-600 transition-colors disabled:opacity-50"
                    >
                      {deletingId === saved.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
