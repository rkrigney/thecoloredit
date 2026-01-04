import { init } from '@instantdb/react'

// InstantDB Schema
// Define the shape of our data
type Schema = {
  users: {
    id: string
    email: string
    createdAt: number
  }
  savedShortlists: {
    id: string
    userId: string
    name: string
    createdAt: number
    roomType: string
    shortlistData: string // JSON stringified ScoredColor[]
  }
  savedShoppingLists: {
    id: string
    userId: string
    name: string
    createdAt: number
    shoppingListData: string // JSON stringified ShoppingListItem[]
  }
}

// Initialize InstantDB
const db = init<Schema>({
  appId: 'd38c26a5-d1b9-4151-82b2-a2a993687d4e'
})

export { db }
export type { Schema }
