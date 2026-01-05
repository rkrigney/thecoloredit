import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Palette, Trash2, Clock, Loader2, Star } from 'lucide-react'
import { db } from '../lib/instantdb'
import { useAppContext } from '../App'
import { ScoredColor } from '../types'

export default function SavedShortlists() {
  const navigate = useNavigate()
  const { user } = db.useAuth()
  const { shortlist: currentShortlist, setShortlist, profile, setProfile } = useAppContext()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // Query saved shortlists - simplified query without ordering
  const { isLoading, data, error } = db.useQuery(
    user
      ? { savedShortlists: {} }
      : null
  ) as { isLoading: boolean; data: { savedShortlists?: any[] } | undefined; error: any }

  // Filter to user's shortlists and sort client-side
  const userShortlists = data?.savedShortlists
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

  const handleLoad = (savedShortlist: { shortlistData: string; roomType: string }) => {
    try {
      const shortlistData = JSON.parse(savedShortlist.shortlistData) as ScoredColor[]
      setShortlist(shortlistData)
      setProfile({
        roomType: savedShortlist.roomType as 'living' | 'bedroom' | 'kitchen' | 'bathroom' | 'hallway' | 'office' | 'kids' | 'dining' | 'other' | 'skip',
        lightLevel: 'medium',
        lightDirection: 'unknown',
        bulbFeel: 'unknown',
        fixedElements: 'mixed',
        vibe: 'calm_muted',
        boldness: 'timeless',
        avoidList: []
      })
      navigate('/shortlist')
    } catch (err) {
      console.error('Failed to load shortlist:', err)
    }
  }

  const handleDelete = async (id: string) => {
    setDeletingId(id)
    try {
      await db.transact((db.tx as any).savedShortlists[id].delete())
    } catch (err) {
      console.error('Failed to delete shortlist:', err)
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

  const roomTypeLabels: Record<string, string> = {
    living: 'Living room',
    bedroom: 'Bedroom',
    kitchen: 'Kitchen',
    bathroom: 'Bathroom',
    hallway: 'Hall / entry',
    office: 'Office',
    kids: "Kids' room",
    dining: 'Dining room',
    other: 'Room',
    skip: 'Room'
  }

  const hasCurrentSession = currentShortlist.length > 0

  return (
    <div className="min-h-screen bg-cream-50 pb-8">
      {/* Header */}
      <header className="page-header">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 text-charcoal-light hover:text-charcoal transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-serif text-title text-charcoal">Saved Shortlists</h1>
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
              onClick={() => navigate('/shortlist')}
              className="w-full bg-sage-50 border border-sage/30 p-5 text-left hover:border-sage/50 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-medium text-charcoal">
                    {profile?.roomType ? roomTypeLabels[profile.roomType] : 'Your shortlist'}
                  </h3>
                  <p className="text-sm text-charcoal-light">
                    {currentShortlist.length} colors · Unsaved
                  </p>
                </div>
                <span className="badge-sage">
                  Active
                </span>
              </div>

              <div className="flex gap-2">
                {currentShortlist.slice(0, 6).map((scored, i) => (
                  <div
                    key={i}
                    className="w-11 h-11 shadow-sm border border-cream-200"
                    style={{ backgroundColor: scored.color.hex }}
                    title={scored.color.name}
                  />
                ))}
                {currentShortlist.length > 6 && (
                  <div className="w-11 h-11 bg-cream-100 flex items-center justify-center text-xs text-charcoal-light border border-cream-200">
                    +{currentShortlist.length - 6}
                  </div>
                )}
              </div>
            </button>
          </div>
        )}

        {/* Saved Shortlists */}
        <div>
          {(userShortlists.length > 0 || hasCurrentSession) && (
            <h2 className="text-xs font-medium text-charcoal-light uppercase tracking-wide mb-3 flex items-center gap-2">
              <Palette className="w-3.5 h-3.5" />
              Saved
            </h2>
          )}

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-charcoal-light" />
            </div>
          ) : error ? (
            <div className="text-center py-8 bg-red-50 rounded-xl">
              <p className="text-red-600 text-sm mb-2">Unable to load saved shortlists</p>
              <p className="text-red-400 text-xs">Please try refreshing the page</p>
            </div>
          ) : userShortlists.length === 0 ? (
            <div className="text-center py-12 bg-white border border-cream-200">
              <Palette className="w-10 h-10 text-charcoal-lighter mx-auto mb-3" />
              <p className="text-charcoal-light text-sm mb-1">No saved shortlists yet</p>
              <p className="text-charcoal-lighter text-xs mb-4">
                Save your shortlists to access them anytime
              </p>
              {!hasCurrentSession && (
                <button
                  onClick={() => navigate('/setup')}
                  className="btn-primary text-sm"
                >
                  Create a shortlist
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {userShortlists.map((saved: any) => {
                let colors: ScoredColor[] = []
                try {
                  colors = JSON.parse(saved.shortlistData || '[]')
                } catch {
                  colors = []
                }

                return (
                  <div
                    key={saved.id}
                    className="bg-white border border-cream-200 overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.04)]"
                  >
                    <button
                      onClick={() => handleLoad(saved)}
                      className="w-full p-5 text-left hover:bg-sage-50 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-medium text-charcoal">{saved.name || 'Untitled'}</h3>
                          <p className="text-sm text-charcoal-light">
                            {roomTypeLabels[saved.roomType] || 'Room'} · {colors.length} colors
                          </p>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-charcoal-light">
                          <Clock className="w-3 h-3" />
                          {formatDate(saved.createdAt || Date.now())}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        {colors.slice(0, 6).map((scored, i) => (
                          <div
                            key={i}
                            className="w-11 h-11 shadow-sm border border-cream-200"
                            style={{ backgroundColor: scored.color?.hex || '#ccc' }}
                            title={scored.color?.name}
                          />
                        ))}
                        {colors.length > 6 && (
                          <div className="w-11 h-11 bg-cream-100 flex items-center justify-center text-xs text-charcoal-light border border-cream-200">
                            +{colors.length - 6}
                          </div>
                        )}
                      </div>
                    </button>

                    <div className="border-t border-cream-200 px-5 py-3 flex justify-between items-center bg-cream-50">
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
