"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, Zap, Archive } from "lucide-react"

export function InfoCard() {
  return (
    <Card className="w-full border-border/50 bg-card/50 backdrop-blur-sm shadow-xl">
      <CardHeader>
        <CardTitle className="text-xl">How It Works</CardTitle>
        <CardDescription>Secure, fast, and private encryption</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-primary/10 border border-primary/20 shrink-0">
            <Shield className="h-4 w-4 text-primary" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-semibold">Military-Grade Encryption</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Uses AES-256-GCM encryption with PBKDF2 key derivation for maximum security
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-accent/10 border border-accent/20 shrink-0">
            <Zap className="h-4 w-4 text-accent" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-semibold">Browser-Based Processing</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              All encryption happens locally in your browser. No data is sent to servers
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-secondary/50 border border-border shrink-0">
            <Archive className="h-4 w-4 text-foreground" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-semibold">Local History</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Recent operations are stored locally for quick access. Clear anytime
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
