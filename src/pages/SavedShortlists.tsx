import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Palette, Trash2, Calendar, Loader2 } from 'lucide-react'
import { db } from '../lib/instantdb'
import { useAppContext } from '../App'
import { ScoredColor } from '../types'

export default function SavedShortlists() {
  const navigate = useNavigate()
  const { user } = db.useAuth()
  const { setShortlist, setProfile } = useAppContext()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const { isLoading, data, error } = db.useQuery(
    user
      ? {
          savedShortlists: {
            $: { where: { userId: user.id }, order: { createdAt: 'desc' } }
          }
        }
      : null
  ) as { isLoading: boolean; data: { savedShortlists?: any[] } | undefined; error: any }

  if (!user) {
    navigate('/')
    return null
  }

  const handleLoad = (savedShortlist: { shortlistData: string; roomType: string }) => {
    try {
      const shortlistData = JSON.parse(savedShortlist.shortlistData) as ScoredColor[]
      setShortlist(shortlistData)
      // Set minimal profile for navigation
      setProfile({
        roomType: savedShortlist.roomType as 'living' | 'bedroom' | 'kitchen' | 'bathroom' | 'hallway' | 'office' | 'nursery',
        lighting: { direction: 'unknown', primaryUsage: 'both', bulbTemp: 'unknown' },
        fixedElements: [],
        vibe: { cozyToCrisp: 50, calmToMoody: 50 },
        undertoneFears: [],
        brandPreferences: [],
        depthPreference: 'any'
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
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const roomTypeLabels: Record<string, string> = {
    living: 'Living room',
    bedroom: 'Bedroom',
    kitchen: 'Kitchen',
    bathroom: 'Bathroom',
    hallway: 'Hallway',
    office: 'Home office',
    nursery: 'Nursery'
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
          <h1 className="font-serif text-lg text-charcoal">Saved Shortlists</h1>
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
            <p className="text-charcoal-light">Failed to load saved shortlists.</p>
          </div>
        ) : !data?.savedShortlists?.length ? (
          <div className="text-center py-12">
            <Palette className="w-12 h-12 text-charcoal/20 mx-auto mb-4" />
            <p className="text-charcoal-light mb-4">No saved shortlists yet.</p>
            <button
              onClick={() => navigate('/setup')}
              className="btn-primary"
            >
              Create your first shortlist
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {data.savedShortlists.map((saved) => {
              const shortlistData = JSON.parse(saved.shortlistData) as ScoredColor[]
              const colors = shortlistData.slice(0, 5)

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
                          {roomTypeLabels[saved.roomType] || saved.roomType}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-charcoal-light">
                        <Calendar className="w-3 h-3" />
                        {formatDate(saved.createdAt)}
                      </div>
                    </div>

                    {/* Color swatches preview */}
                    <div className="flex gap-1.5">
                      {colors.map((scored, i) => (
                        <div
                          key={i}
                          className="w-10 h-10 rounded-lg shadow-sm"
                          style={{ backgroundColor: scored.color.hex }}
                          title={scored.color.name}
                        />
                      ))}
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
