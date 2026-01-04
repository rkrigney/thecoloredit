import { init } from '@instantdb/react'

// Initialize InstantDB without strict schema typing
// Data is stored as JSON strings for flexibility
const db = init({
  appId: 'd38c26a5-d1b9-4151-82b2-a2a993687d4e'
})

export { db }
