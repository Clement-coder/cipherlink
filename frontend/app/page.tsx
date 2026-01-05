"use client"

import { useRef } from "react"
import { CipherInterface } from "@/components/cipher-interface"
import { HistoryPanel } from "@/components/history-panel"
import { InfoCard } from "@/components/info-card"
import { Lock } from "lucide-react"
import type { HistoryEntry } from "@/lib/history"

export default function Home() {
  const restoreHandlerRef = useRef<((entry: HistoryEntry) => void) | null>(null)

  const handleHistoryRestore = (entry: HistoryEntry) => {
    if (restoreHandlerRef.current) {
      restoreHandlerRef.current(entry)
    }
  }

  const registerRestoreHandler = (handler: (entry: HistoryEntry) => void) => {
    restoreHandlerRef.current = handler
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-8 lg:py-16">
        {/* Header */}
        <header className="text-center mb-12 space-y-4">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-primary/10 border border-primary/20 animate-in fade-in zoom-in duration-500">
              <Lock className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-balance bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent animate-in fade-in slide-in-from-bottom-4 duration-700">
              Cipherlink
            </h1>
          </div>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto text-pretty animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
            Secure message encryption for developers. Encrypt, share, and decrypt messages with military-grade AES-256
            encryption.
          </p>
        </header>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto grid gap-6 lg:grid-cols-[1fr_400px] animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
          <div className="space-y-6">
            <CipherInterface onHistoryRestore={handleHistoryRestore} />
            <div className="lg:hidden">
              <InfoCard />
            </div>
          </div>
          <div className="space-y-6">
            <div className="hidden lg:block">
              <InfoCard />
            </div>
            <HistoryPanel onRestore={handleHistoryRestore} />
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center mt-16 text-sm text-muted-foreground animate-in fade-in duration-1000 delay-500">
          <p className="text-pretty">End-to-end encryption • No server storage • Browser-based security</p>
        </footer>
      </div>
    </main>
  )
}
