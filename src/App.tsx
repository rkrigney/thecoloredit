import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useState, createContext, useContext } from 'react'
import Home from './pages/Home'
import RoomSetup from './pages/RoomSetup'
import Shortlist from './pages/Shortlist'
import PaintStory from './pages/PaintStory'
import Compare from './pages/Compare'
import ProductPicker from './pages/ProductPicker'
import ShoppingList from './pages/ShoppingList'
import StoreFinder from './pages/StoreFinder'
import SamplingPlan from './pages/SamplingPlan'
import { UserRoomProfile, ScoredColor, ShoppingListItem } from './types'

interface AppContextType {
  profile: UserRoomProfile | null
  setProfile: (p: UserRoomProfile) => void
  shortlist: ScoredColor[]
  setShortlist: (s: ScoredColor[]) => void
  compareColors: [ScoredColor | null, ScoredColor | null]
  setCompareColors: (c: [ScoredColor | null, ScoredColor | null]) => void
  shoppingList: ShoppingListItem[]
  addToShoppingList: (item: ShoppingListItem) => void
  removeFromShoppingList: (id: string) => void
  clearShoppingList: () => void
}

export const AppContext = createContext<AppContextType | null>(null)

export function useAppContext() {
  const context = useContext(AppContext)
  if (!context) throw new Error('useAppContext must be used within AppProvider')
  return context
}

function App() {
  const [profile, setProfile] = useState<UserRoomProfile | null>(null)
  const [shortlist, setShortlist] = useState<ScoredColor[]>([])
  const [compareColors, setCompareColors] = useState<[ScoredColor | null, ScoredColor | null]>([null, null])
  const [shoppingList, setShoppingList] = useState<ShoppingListItem[]>([])

  const addToShoppingList = (item: ShoppingListItem) => {
    setShoppingList(prev => [...prev.filter(i => i.id !== item.id), item])
  }

  const removeFromShoppingList = (id: string) => {
    setShoppingList(prev => prev.filter(i => i.id !== id))
  }

  const clearShoppingList = () => {
    setShoppingList([])
  }

  return (
    <AppContext.Provider
      value={{
        profile,
        setProfile,
        shortlist,
        setShortlist,
        compareColors,
        setCompareColors,
        shoppingList,
        addToShoppingList,
        removeFromShoppingList,
        clearShoppingList
      }}
    >
      <BrowserRouter>
        <div className="min-h-screen bg-cream-50">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/setup" element={<RoomSetup />} />
            <Route path="/shortlist" element={<Shortlist />} />
            <Route path="/color/:id" element={<PaintStory />} />
            <Route path="/compare" element={<Compare />} />
            <Route path="/product-picker/:colorId" element={<ProductPicker />} />
            <Route path="/shopping-list" element={<ShoppingList />} />
            <Route path="/stores" element={<StoreFinder />} />
            <Route path="/sampling-plan" element={<SamplingPlan />} />
          </Routes>
        </div>
      </BrowserRouter>
    </AppContext.Provider>
  )
}

export default App
