import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Copy, Share2, Trash2, MapPin } from 'lucide-react'
import { useAppContext } from '../App'
import SaveShoppingListButton from '../components/SaveShoppingListButton'

export default function ShoppingList() {
  const navigate = useNavigate()
  const { shoppingList, removeFromShoppingList, clearShoppingList } = useAppContext()

  const generateCallScript = (item: typeof shoppingList[0]) => {
    return `Hi, I'm looking for ${item.color.brand} ${item.productLine}, ${item.sheen} finish, ${item.base} base, ${item.quantity.gallons} gallon${item.quantity.gallons > 1 ? 's' : ''}, color code ${item.color.code} (${item.color.name}). Do you have it in stock or can you mix it today?`
  }

  const generateTextList = () => {
    return shoppingList.map(item => {
      let text = `${item.roomName} - ${item.surface}\n`
      text += `  ${item.color.name} (${item.color.code})\n`
      text += `  ${item.color.brand} ${item.productLine}\n`
      text += `  ${item.sheen}, ${item.base} base\n`
      text += `  Qty: ${item.quantity.gallons} gal (${item.quantity.coats} coats)\n`
      if (item.primer.needed) {
        text += `  Primer: ${item.primer.type}, ${item.primer.gallons} gal\n`
      }
      return text
    }).join('\n')
  }

  const copyToClipboard = async () => {
    const text = generateTextList()
    await navigator.clipboard.writeText(text)
    alert('Shopping list copied to clipboard!')
  }

  const shareList = async () => {
    const text = generateTextList()
    if (navigator.share) {
      await navigator.share({
        title: 'The Color Edit - Shopping List',
        text
      })
    } else {
      copyToClipboard()
    }
  }

  if (shoppingList.length === 0) {
    return (
      <div className="min-h-screen bg-cream-50 flex flex-col">
        <header className="px-4 py-4 flex items-center border-b border-charcoal/5">
          <button
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 text-charcoal-light hover:text-charcoal transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="ml-2 font-serif text-lg text-charcoal">Shopping List</h1>
        </header>

        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center">
            <p className="text-charcoal-light mb-4">Your shopping list is empty.</p>
            <p className="text-sm text-charcoal-lighter mb-6">
              Choose paint type & finish for colors in your shortlist to add them here.
            </p>
            <button onClick={() => navigate('/shortlist')} className="btn-secondary">
              Back to shortlist
            </button>
          </div>
        </div>
      </div>
    )
  }

  const totalGallons = shoppingList.reduce((sum, item) => sum + item.quantity.gallons, 0)
  const totalPrimerGallons = shoppingList.reduce((sum, item) => sum + (item.primer.gallons || 0), 0)

  return (
    <div className="min-h-screen bg-cream-50 pb-24">
      {/* Header */}
      <header className="px-4 py-4 border-b border-charcoal/5">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 text-charcoal-light hover:text-charcoal transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-serif text-lg text-charcoal">Shopping List</h1>
          <div className="flex items-center gap-2">
            <SaveShoppingListButton shoppingList={shoppingList} />
            <button
              onClick={clearShoppingList}
              className="p-2 text-charcoal-light hover:text-red-500 transition-colors"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Summary */}
      <div className="px-4 py-4 bg-cream-100">
        <div className="flex justify-between text-sm">
          <span className="text-charcoal-light">Total paint:</span>
          <span className="font-medium text-charcoal">{totalGallons} gallon{totalGallons !== 1 ? 's' : ''}</span>
        </div>
        {totalPrimerGallons > 0 && (
          <div className="flex justify-between text-sm mt-1">
            <span className="text-charcoal-light">Total primer:</span>
            <span className="font-medium text-charcoal">{totalPrimerGallons} gallon{totalPrimerGallons !== 1 ? 's' : ''}</span>
          </div>
        )}
      </div>

      {/* Items */}
      <div className="p-4 space-y-4">
        {shoppingList.map(item => (
          <div key={item.id} className="card p-4">
            {/* Header with color swatch */}
            <div className="flex gap-4 mb-4">
              <div
                className="w-16 h-16 rounded-xl flex-shrink-0"
                style={{ backgroundColor: item.color.hex }}
              />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-charcoal">{item.color.name}</p>
                <p className="text-sm text-charcoal-light">{item.color.brand} · {item.color.code}</p>
                <p className="text-xs text-charcoal-lighter mt-1 capitalize">
                  {item.roomName} · {item.surface}
                </p>
              </div>
              <button
                onClick={() => removeFromShoppingList(item.id)}
                className="p-2 text-charcoal-light hover:text-red-500 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {/* Details */}
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-charcoal-light">Product:</span>{' '}
                <span className="text-charcoal">{item.productLine}</span>
              </div>
              <div>
                <span className="text-charcoal-light">Sheen:</span>{' '}
                <span className="text-charcoal capitalize">{item.sheen}</span>
              </div>
              <div>
                <span className="text-charcoal-light">Base:</span>{' '}
                <span className="text-charcoal capitalize">{item.base}</span>
              </div>
              <div>
                <span className="text-charcoal-light">Quantity:</span>{' '}
                <span className="text-charcoal">{item.quantity.gallons} gal ({item.quantity.coats} coats)</span>
              </div>
            </div>

            {/* Primer */}
            {item.primer.needed && (
              <div className="mt-3 p-3 bg-amber-50 rounded-lg">
                <p className="text-sm text-amber-800">
                  <span className="font-medium">Primer needed:</span> {item.primer.type}, {item.primer.gallons} gallon
                </p>
              </div>
            )}

            {/* Call-ahead script */}
            <div className="mt-4 p-3 bg-cream-100 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-charcoal-light uppercase tracking-wide">Call-ahead script</span>
                <button
                  onClick={() => navigator.clipboard.writeText(generateCallScript(item))}
                  className="text-charcoal-light hover:text-charcoal transition-colors"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-charcoal leading-relaxed">
                "{generateCallScript(item)}"
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Supplies note */}
      <div className="px-4 mb-4">
        <div className="p-4 bg-white rounded-xl border border-charcoal/5">
          <p className="text-sm font-medium text-charcoal mb-2">Don't forget supplies</p>
          <ul className="text-sm text-charcoal-light space-y-1">
            <li>• Roller covers (3/8" for smooth, 1/2" for textured)</li>
            <li>• Quality angled brush (2.5" for cutting in)</li>
            <li>• Painter's tape</li>
            <li>• Drop cloths</li>
            <li>• Paint tray or bucket grid</li>
          </ul>
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="fixed bottom-0 left-0 right-0 bg-cream-50 border-t border-charcoal/10 px-4 py-3 safe-area-inset-bottom">
        <div className="flex gap-3">
          <button
            onClick={copyToClipboard}
            className="flex-1 btn-secondary flex items-center justify-center gap-2 text-sm"
          >
            <Copy className="w-4 h-4" />
            Copy as text
          </button>
          <button
            onClick={shareList}
            className="flex-1 btn-secondary flex items-center justify-center gap-2 text-sm"
          >
            <Share2 className="w-4 h-4" />
            Share list
          </button>
          <button
            onClick={() => navigate('/stores')}
            className="btn-primary px-4 flex items-center gap-2"
          >
            <MapPin className="w-4 h-4" />
            Find stores
          </button>
        </div>
      </div>
    </div>
  )
}
