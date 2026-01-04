import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ShoppingBag, Trash2, Clock, Loader2, Star } from 'lucide-react'
import { db } from '../lib/instantdb'
import { useAppContext } from '../App'
import { ShoppingListItem } from '../types'

export default function SavedShoppingLists() {
  const navigate = useNavigate()
  const { user } = db.useAuth()
  const { shoppingList: currentShoppingList, setShoppingListFromSaved } = useAppContext()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // Query saved shopping lists - simplified query
  const { isLoading, data, error } = db.useQuery(
    user
      ? { savedShoppingLists: {} }
      : null
  ) as { isLoading: boolean; data: { savedShoppingLists?: any[] } | undefined; error: any }

  // Filter to user's lists and sort client-side
  const userShoppingLists = data?.savedShoppingLists
    ?.filter((s: any) => s.userId === user?.id)
    ?.sort((a: any, b: any) => (b.createdAt || 0) - (a.createdAt || 0)) || []

  // Log errors for debugging
  useEffect(() => {
    if (error) {
      console.error('InstantDB query error:', error)
    }
  }, [error])

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
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    })
  }

  const hasCurrentSession = currentShoppingList.length > 0
  const currentTotalGallons = currentShoppingList.reduce((sum, item) => sum + item.quantity.gallons, 0)

  return (
    <div className="min-h-screen bg-cream-50 pb-8">
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

      <div className="p-4 space-y-6">
        {/* Current Session */}
        {hasCurrentSession && (
          <div>
            <h2 className="text-xs font-medium text-charcoal-light uppercase tracking-wide mb-3 flex items-center gap-2">
              <Star className="w-3.5 h-3.5" />
              Current Session
            </h2>
            <button
              onClick={() => navigate('/shopping-list')}
              className="w-full bg-gradient-to-br from-gold/10 to-gold/5 border-2 border-gold/30 rounded-xl p-4 text-left hover:border-gold/50 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-medium text-charcoal">Current Shopping List</h3>
                  <p className="text-sm text-charcoal-light">
                    {currentShoppingList.length} items · {currentTotalGallons} gallons · Unsaved
                  </p>
                </div>
                <span className="text-xs bg-gold/20 text-gold px-2 py-1 rounded-full">
                  Active
                </span>
              </div>

              <div className="flex gap-2">
                {currentShoppingList.slice(0, 6).map((item, i) => (
                  <div
                    key={i}
                    className="w-11 h-11 rounded-lg shadow-sm ring-1 ring-black/5"
                    style={{ backgroundColor: item.color.hex }}
                    title={item.color.name}
                  />
                ))}
                {currentShoppingList.length > 6 && (
                  <div className="w-11 h-11 rounded-lg bg-charcoal/10 flex items-center justify-center text-xs text-charcoal-light">
                    +{currentShoppingList.length - 6}
                  </div>
                )}
              </div>
            </button>
          </div>
        )}

        {/* Saved Shopping Lists */}
        <div>
          {(userShoppingLists.length > 0 || hasCurrentSession) && (
            <h2 className="text-xs font-medium text-charcoal-light uppercase tracking-wide mb-3 flex items-center gap-2">
              <ShoppingBag className="w-3.5 h-3.5" />
              Saved
            </h2>
          )}

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-charcoal-light" />
            </div>
          ) : error ? (
            <div className="text-center py-8 bg-red-50 rounded-xl">
              <p className="text-red-600 text-sm mb-2">Unable to load saved shopping lists</p>
              <p className="text-red-400 text-xs">Please try refreshing the page</p>
            </div>
          ) : userShoppingLists.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-charcoal/5">
              <ShoppingBag className="w-10 h-10 text-charcoal/15 mx-auto mb-3" />
              <p className="text-charcoal-light text-sm mb-1">No saved shopping lists yet</p>
              <p className="text-charcoal-lighter text-xs mb-4">
                Save your shopping lists to access them anytime
              </p>
              {!hasCurrentSession && (
                <button
                  onClick={() => navigate('/setup')}
                  className="btn-primary text-sm"
                >
                  Start creating your palette
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {userShoppingLists.map((saved: any) => {
                let items: ShoppingListItem[] = []
                try {
                  items = JSON.parse(saved.shoppingListData || '[]')
                } catch {
                  items = []
                }
                const totalGallons = items.reduce((sum, item) => sum + (item.quantity?.gallons || 0), 0)

                return (
                  <div
                    key={saved.id}
                    className="bg-white rounded-xl border border-charcoal/10 overflow-hidden shadow-sm"
                  >
                    <button
                      onClick={() => handleLoad(saved)}
                      className="w-full p-4 text-left hover:bg-cream-50 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-medium text-charcoal">{saved.name || 'Untitled'}</h3>
                          <p className="text-sm text-charcoal-light">
                            {items.length} items · {totalGallons} gallons
                          </p>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-charcoal-light">
                          <Clock className="w-3 h-3" />
                          {formatDate(saved.createdAt || Date.now())}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        {items.slice(0, 6).map((item, i) => (
                          <div
                            key={i}
                            className="w-11 h-11 rounded-lg shadow-sm ring-1 ring-black/5"
                            style={{ backgroundColor: item.color?.hex || '#ccc' }}
                            title={item.color?.name}
                          />
                        ))}
                        {items.length > 6 && (
                          <div className="w-11 h-11 rounded-lg bg-charcoal/10 flex items-center justify-center text-xs text-charcoal-light">
                            +{items.length - 6}
                          </div>
                        )}
                      </div>
                    </button>

                    <div className="border-t border-charcoal/5 px-4 py-2 flex justify-between items-center bg-cream-50/50">
                      <span className="text-xs text-charcoal-lighter">Tap to load</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDelete(saved.id)
                        }}
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
    </div>
  )
}
