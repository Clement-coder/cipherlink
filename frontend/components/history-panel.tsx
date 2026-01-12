"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { History, Trash2, Lock, Unlock, Hash } from "lucide-react"
import { getHistory, clearHistory, deleteHistoryEntry, formatTimestamp, truncateText } from "@/lib/history"
import type { HistoryEntry } from "@/lib/history"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface HistoryPanelProps {
  onRestore: (entry: HistoryEntry) => void
}

export function HistoryPanel({ onRestore }: HistoryPanelProps) {
  const [history, setHistory] = useState<HistoryEntry[]>([])

  // Load history on mount and when localStorage changes
  useEffect(() => {
    loadHistory()

    // Listen for custom event when history is updated
    const handleHistoryUpdate = () => loadHistory()
    window.addEventListener("history-updated", handleHistoryUpdate)

    return () => {
      window.removeEventListener("history-updated", handleHistoryUpdate)
    }
  }, [])

  const loadHistory = () => {
    setHistory(getHistory())
  }

  const handleClearAll = () => {
    clearHistory()
    loadHistory()
  }

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    deleteHistoryEntry(id)
    loadHistory()
  }

  const handleRestore = (entry: HistoryEntry) => {
    onRestore(entry)
  }

  const getActionDetails = (action: HistoryEntry["action"]) => {
    switch (action) {
      case "encrypt":
        return {
          Icon: Lock,
          label: "Encrypted",
          badgeVariant: "default" as const,
          iconColor: "text-primary",
        }
      case "decrypt":
        return {
          Icon: Unlock,
          label: "Decrypted",
          badgeVariant: "secondary" as const,
          iconColor: "text-accent",
        }
      case "hash":
        return {
          Icon: Hash,
          label: "Hashed",
          badgeVariant: "outline" as const,
          iconColor: "text-green-500",
        }
      default:
        return {
          Icon: History,
          label: "Unknown",
          badgeVariant: "destructive" as const,
          iconColor: "text-muted-foreground",
        }
    }
  }

  return (
    <Card className="w-full border-border/50 bg-card/50 backdrop-blur-sm shadow-xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="h-5 w-5 text-primary" />
            <CardTitle className="text-xl">History</CardTitle>
          </div>
          {history.length > 0 && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2 h-8">
                  <Trash2 className="h-3.5 w-3.5" />
                  Clear All
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Clear History?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete all {history.length} history entries. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleClearAll}>Clear All</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
        <CardDescription>Recent encryption, decryption, and hashing operations</CardDescription>
      </CardHeader>

      <CardContent>
        {history.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="p-4 rounded-full bg-muted/50 mb-4">
              <History className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-muted-foreground mb-1">No history yet</p>
            <p className="text-xs text-muted-foreground/70">Your operations will appear here</p>
          </div>
        ) : (
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-3">
              {history.map((entry) => {
                const { Icon, label, badgeVariant, iconColor } = getActionDetails(entry.action)
                return (
                  <button
                    key={entry.id}
                    onClick={() => handleRestore(entry)}
                    className="w-full text-left p-4 rounded-lg border border-border/50 bg-muted/20 hover:bg-muted/40 hover:border-border transition-all duration-200 group"
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2">
                        <Icon className={`h-4 w-4 ${iconColor} shrink-0`} />
                        <Badge variant={badgeVariant} className="text-xs">
                          {label}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">{formatTimestamp(entry.timestamp)}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => handleDelete(entry.id, e)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div>
                        <p className="text-xs text-muted-foreground mb-0.5">Input:</p>
                        <p className="text-sm font-mono text-foreground/90 break-all">
                          {truncateText(entry.input, 80)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-0.5">Output:</p>
                        <p className="text-sm font-mono text-foreground/70 break-all">
                          {truncateText(entry.output, 80)}
                        </p>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  )
}
