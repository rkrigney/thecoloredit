import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { User, LogOut, Palette, ShoppingBag, ChevronDown, Loader2 } from 'lucide-react'
import { db } from '../lib/instantdb'
import AuthModal from './AuthModal'

export default function UserMenu() {
  const navigate = useNavigate()
  const { isLoading, user, error } = db.useAuth()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)

  // Query saved data for the current user
  const { data: savedData } = db.useQuery(
    user
      ? {
          savedShortlists: {
            $: { where: { userId: user.id } }
          },
          savedShoppingLists: {
            $: { where: { userId: user.id } }
          }
        }
      : null
  )

  const handleLogout = () => {
    db.auth.signOut()
    setIsDropdownOpen(false)
  }

  if (isLoading) {
    return (
      <div className="p-2">
        <Loader2 className="w-5 h-5 animate-spin text-charcoal-light" />
      </div>
    )
  }

  if (error) {
    console.error('Auth error:', error)
  }

  if (!user) {
    return (
      <>
        <button
          onClick={() => setShowAuthModal(true)}
          className="flex items-center gap-2 px-3 py-1.5 text-sm text-charcoal-light hover:text-charcoal transition-colors"
        >
          <User className="w-4 h-4" />
          <span>Sign in</span>
        </button>
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
        />
      </>
    )
  }

  const shortlistCount = savedData?.savedShortlists?.length || 0
  const shoppingListCount = savedData?.savedShoppingLists?.length || 0

  return (
    <div className="relative">
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="flex items-center gap-2 px-3 py-1.5 text-sm text-charcoal hover:bg-cream-100 rounded-full transition-colors"
      >
        <div className="w-7 h-7 rounded-full bg-gold/20 flex items-center justify-center">
          <User className="w-4 h-4 text-gold" />
        </div>
        <span className="max-w-[120px] truncate">{user.email?.split('@')[0]}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
      </button>

      {isDropdownOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsDropdownOpen(false)}
          />

          {/* Dropdown Menu */}
          <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-lg border border-charcoal/10 py-2 z-50">
            <div className="px-4 py-2 border-b border-charcoal/5">
              <p className="text-xs text-charcoal-light">Signed in as</p>
              <p className="text-sm text-charcoal truncate">{user.email}</p>
            </div>

            <div className="py-2">
              <button
                onClick={() => {
                  navigate('/saved-shortlists')
                  setIsDropdownOpen(false)
                }}
                className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-cream-100 transition-colors"
              >
                <Palette className="w-4 h-4 text-charcoal-light" />
                <div className="flex-1 text-left">
                  <span className="text-sm text-charcoal">Saved Shortlists</span>
                </div>
                {shortlistCount > 0 && (
                  <span className="text-xs bg-gold/20 text-gold px-2 py-0.5 rounded-full">
                    {shortlistCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => {
                  navigate('/saved-shopping-lists')
                  setIsDropdownOpen(false)
                }}
                className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-cream-100 transition-colors"
              >
                <ShoppingBag className="w-4 h-4 text-charcoal-light" />
                <div className="flex-1 text-left">
                  <span className="text-sm text-charcoal">Saved Shopping Lists</span>
                </div>
                {shoppingListCount > 0 && (
                  <span className="text-xs bg-gold/20 text-gold px-2 py-0.5 rounded-full">
                    {shoppingListCount}
                  </span>
                )}
              </button>
            </div>

            <div className="border-t border-charcoal/5 pt-2">
              <button
                onClick={handleLogout}
                className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-cream-100 transition-colors text-red-600"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm">Sign out</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
