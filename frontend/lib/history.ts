// History management utilities for localStorage persistence

export type HistoryAction = "encrypt" | "decrypt"

export interface HistoryEntry {
  id: string
  action: HistoryAction
  input: string
  output: string
  timestamp: number
}

const STORAGE_KEY = "cipherlink-history"
const MAX_HISTORY_ITEMS = 50

/**
 * Get all history entries from localStorage
 */
export function getHistory(): HistoryEntry[] {
  if (typeof window === "undefined") return []

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return []

    const history = JSON.parse(stored) as HistoryEntry[]
    return history.sort((a, b) => b.timestamp - a.timestamp)
  } catch (error) {
    console.error("Failed to load history:", error)
    return []
  }
}

/**
 * Add a new entry to history
 */
export function addToHistory(action: HistoryAction, input: string, output: string): void {
  if (typeof window === "undefined") return

  try {
    const history = getHistory()

    const newEntry: HistoryEntry = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      action,
      input: input.trim(),
      output: output.trim(),
      timestamp: Date.now(),
    }

    // Add new entry and limit to MAX_HISTORY_ITEMS
    const updatedHistory = [newEntry, ...history].slice(0, MAX_HISTORY_ITEMS)

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory))
  } catch (error) {
    console.error("Failed to save history:", error)
  }
}

/**
 * Clear all history
 */
export function clearHistory(): void {
  if (typeof window === "undefined") return

  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch (error) {
    console.error("Failed to clear history:", error)
  }
}

/**
 * Delete a specific history entry
 */
export function deleteHistoryEntry(id: string): void {
  if (typeof window === "undefined") return

  try {
    const history = getHistory()
    const updatedHistory = history.filter((entry) => entry.id !== id)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory))
  } catch (error) {
    console.error("Failed to delete history entry:", error)
  }
}

/**
 * Format timestamp for display
 */
export function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return "Just now"
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`

  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

/**
 * Truncate text for preview
 */
export function truncateText(text: string, maxLength = 50): string {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + "..."
}
