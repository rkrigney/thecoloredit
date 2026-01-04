import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { useState, useEffect, createContext, useContext } from 'react'
import Home from './pages/Home'
import RoomSetup from './pages/RoomSetup'
import Shortlist from './pages/Shortlist'
import PaintStory from './pages/PaintStory'
import Compare from './pages/Compare'
import ProductPicker from './pages/ProductPicker'
import ShoppingList from './pages/ShoppingList'
import StoreFinder from './pages/StoreFinder'
import SamplingPlan from './pages/SamplingPlan'
import SavedShortlists from './pages/SavedShortlists'
import SavedShoppingLists from './pages/SavedShoppingLists'
import UserMenu from './components/UserMenu'
import { UserRoomProfile, ScoredColor, ShoppingListItem } from './types'

// LocalStorage keys
const STORAGE_KEYS = {
  shortlist: 'thecoloredit_shortlist',
  shoppingList: 'thecoloredit_shoppingList',
  profile: 'thecoloredit_profile',
  roomImage: 'thecoloredit_roomImage'
}

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
  setShoppingListFromSaved: (items: ShoppingListItem[]) => void
  roomImage: string | null
  setRoomImage: (img: string | null) => void
}

export const AppContext = createContext<AppContextType | null>(null)

export function useAppContext() {
  const context = useContext(AppContext)
  if (!context) throw new Error('useAppContext must be used within AppProvider')
  return context
}

// Layout component that shows UserMenu on appropriate pages
function AppLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation()

  // Pages that have their own header and don't need the global user menu bar
  const pagesWithOwnHeader = ['/setup', '/product-picker']
  const showUserMenuBar = !pagesWithOwnHeader.some(path => location.pathname.startsWith(path))

  return (
    <div className="min-h-screen bg-cream-50">
      {showUserMenuBar && (
        <div className="sticky top-0 z-50 bg-cream-50/95 backdrop-blur-sm border-b border-charcoal/5">
          <div className="flex justify-end px-4 py-2">
            <UserMenu />
          </div>
        </div>
      )}
      {children}
    </div>
  )
}

// Helper to safely parse JSON from localStorage
function loadFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const stored = localStorage.getItem(key)
    return stored ? JSON.parse(stored) : defaultValue
  } catch {
    return defaultValue
  }
}

function App() {
  // Initialize state from localStorage
  const [profile, setProfileState] = useState<UserRoomProfile | null>(() =>
    loadFromStorage(STORAGE_KEYS.profile, null)
  )
  const [shortlist, setShortlistState] = useState<ScoredColor[]>(() =>
    loadFromStorage(STORAGE_KEYS.shortlist, [])
  )
  const [compareColors, setCompareColors] = useState<[ScoredColor | null, ScoredColor | null]>([null, null])
  const [shoppingList, setShoppingListState] = useState<ShoppingListItem[]>(() =>
    loadFromStorage(STORAGE_KEYS.shoppingList, [])
  )
  const [roomImage, setRoomImageState] = useState<string | null>(() =>
    loadFromStorage(STORAGE_KEYS.roomImage, null)
  )

  // Persist to localStorage when state changes
  useEffect(() => {
    if (shortlist.length > 0) {
      localStorage.setItem(STORAGE_KEYS.shortlist, JSON.stringify(shortlist))
    }
  }, [shortlist])

  useEffect(() => {
    if (shoppingList.length > 0) {
      localStorage.setItem(STORAGE_KEYS.shoppingList, JSON.stringify(shoppingList))
    }
  }, [shoppingList])

  useEffect(() => {
    if (profile) {
      localStorage.setItem(STORAGE_KEYS.profile, JSON.stringify(profile))
    }
  }, [profile])

  useEffect(() => {
    if (roomImage) {
      localStorage.setItem(STORAGE_KEYS.roomImage, JSON.stringify(roomImage))
    }
  }, [roomImage])

  // Wrapped setters that also persist
  const setProfile = (p: UserRoomProfile) => setProfileState(p)
  const setShortlist = (s: ScoredColor[]) => setShortlistState(s)
  const setRoomImage = (img: string | null) => setRoomImageState(img)

  const addToShoppingList = (item: ShoppingListItem) => {
    setShoppingListState(prev => [...prev.filter(i => i.id !== item.id), item])
  }

  const removeFromShoppingList = (id: string) => {
    setShoppingListState(prev => prev.filter(i => i.id !== id))
  }

  const clearShoppingList = () => {
    localStorage.removeItem(STORAGE_KEYS.shoppingList)
    setShoppingListState([])
  }

  const setShoppingListFromSaved = (items: ShoppingListItem[]) => {
    setShoppingListState(items)
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
        clearShoppingList,
        setShoppingListFromSaved,
        roomImage,
        setRoomImage
      }}
    >
      <BrowserRouter basename="/thecoloredit">
        <AppLayout>
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
            <Route path="/saved-shortlists" element={<SavedShortlists />} />
            <Route path="/saved-shopping-lists" element={<SavedShoppingLists />} />
          </Routes>
        </AppLayout>
      </BrowserRouter>
    </AppContext.Provider>
  )
}

export default App
