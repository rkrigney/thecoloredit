import { useState } from 'react'
import { Save, Loader2, Check, X } from 'lucide-react'
import { db } from '../lib/instantdb'
import { ShoppingListItem } from '../types'
import AuthModal from './AuthModal'

interface SaveShoppingListButtonProps {
  shoppingList: ShoppingListItem[]
}

export default function SaveShoppingListButton({ shoppingList }: SaveShoppingListButtonProps) {
  const { user } = db.useAuth()
  const [isSaving, setIsSaving] = useState(false)
  const [showNameModal, setShowNameModal] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [name, setName] = useState('')
  const [saveSuccess, setSaveSuccess] = useState(false)

  const handleSaveClick = () => {
    if (!user) {
      setShowAuthModal(true)
      return
    }
    // Generate default name
    const defaultName = `Shopping List - ${new Date().toLocaleDateString()}`
    setName(defaultName)
    setShowNameModal(true)
  }

  const handleSave = async () => {
    if (!user || !name.trim()) return

    setIsSaving(true)
    try {
      const id = crypto.randomUUID()
      await db.transact(
        db.tx.savedShoppingLists[id].update({
          userId: user.id,
          name: name.trim(),
          createdAt: Date.now(),
          shoppingListData: JSON.stringify(shoppingList)
        })
      )
      setSaveSuccess(true)
      setShowNameModal(false)
      setTimeout(() => setSaveSuccess(false), 2000)
    } catch (err) {
      console.error('Failed to save shopping list:', err)
    } finally {
      setIsSaving(false)
    }
  }

  if (shoppingList.length === 0) return null

  return (
    <>
      <button
        onClick={handleSaveClick}
        disabled={isSaving}
        className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm transition-colors ${
          saveSuccess
            ? 'bg-emerald-100 text-emerald-700'
            : 'bg-charcoal/10 text-charcoal hover:bg-charcoal/20'
        }`}
      >
        {isSaving ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : saveSuccess ? (
          <Check className="w-4 h-4" />
        ) : (
          <Save className="w-4 h-4" />
        )}
        {saveSuccess ? 'Saved!' : 'Save list'}
      </button>

      {/* Name Modal */}
      {showNameModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-cream-50 rounded-2xl w-full max-w-sm p-6 relative">
            <button
              onClick={() => setShowNameModal(false)}
              className="absolute top-4 right-4 p-2 text-charcoal-light hover:text-charcoal transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-serif text-xl text-charcoal mb-4">Save Shopping List</h3>

            <div className="mb-4">
              <label htmlFor="list-name" className="block text-sm font-medium text-charcoal mb-2">
                Name your list
              </label>
              <input
                type="text"
                id="list-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Bedroom Makeover"
                className="w-full px-4 py-3 border border-charcoal/20 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-gold/50"
                autoFocus
              />
            </div>

            <button
              onClick={handleSave}
              disabled={isSaving || !name.trim()}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save'
              )}
            </button>
          </div>
        </div>
      )}

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </>
  )
}
