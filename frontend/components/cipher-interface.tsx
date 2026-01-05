"use client"

import { useState, useEffect, SetStateAction } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Lock, Unlock, Copy, Trash2, Check, AlertCircle, Keyboard } from "lucide-react"
import { encryptMessage, decryptMessage, isValidEncryptedFormat } from "@/lib/crypto"
import { addToHistory } from "@/lib/history"
import type { HistoryEntry } from "@/lib/history"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { StatusMessage } from "./status-message"

interface CipherInterfaceProps {
  onHistoryRestore?: (entry: HistoryEntry) => void
}

export function CipherInterface({ onHistoryRestore }: CipherInterfaceProps) {
  const [encryptStatus, setEncryptStatus] = useState<{ message: string; type: "success" | "error" } | null>(null)
  const [decryptStatus, setDecryptStatus] = useState<{ message: string; type: "success" | "error" } | null>(null)

  // Encryption state
  const [plaintext, setPlaintext] = useState("")
  const [encryptedText, setEncryptedText] = useState("")
  const [isEncrypting, setIsEncrypting] = useState(false)
  const [encryptCopied, setEncryptCopied] = useState(false)

  // Decryption state
  const [ciphertext, setCiphertext] = useState("")
  const [decryptedText, setDecryptedText] = useState("")
  const [isDecrypting, setIsDecrypting] = useState(false)
  const [decryptCopied, setDecryptCopied] = useState(false)
  const [decryptError, setDecryptError] = useState<string | null>(null)

  // Active tab state
  const [activeTab, setActiveTab] = useState<"encrypt" | "decrypt">("encrypt")

  const [isMac, setIsMac] = useState(false)

  useEffect(() => {
    setIsMac(navigator.platform.toUpperCase().indexOf("MAC") >= 0)
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + Enter to encrypt/decrypt
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault()
        if (activeTab === "encrypt" && plaintext.trim()) {
          handleEncrypt()
        } else if (activeTab === "decrypt" && ciphertext.trim()) {
          handleDecrypt()
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [activeTab, plaintext, ciphertext])

  const handleRestore = (entry: HistoryEntry) => {
    if (entry.action === "encrypt") {
      setActiveTab("encrypt")
      setPlaintext(entry.input)
      setEncryptedText(entry.output)
      setEncryptStatus({ message: "Encryption data restored from history", type: "success" })
    } else {
      setActiveTab("decrypt")
      setCiphertext(entry.input)
      setDecryptedText(entry.output)
      setDecryptError(null)
      setDecryptStatus({ message: "Decryption data restored from history", type: "success" })
    }
  }

  // Register restore handler
  if (onHistoryRestore) {
    onHistoryRestore(handleRestore as any)
  }

  // Handle encryption
  const handleEncrypt = async () => {
    if (!plaintext.trim()) return

    setIsEncrypting(true)
    setEncryptStatus(null)
    try {
      const encrypted = await encryptMessage(plaintext)
      setEncryptedText(encrypted)
      addToHistory("encrypt", plaintext, encrypted)
      window.dispatchEvent(new Event("history-updated"))
      setEncryptStatus({ message: "Message successfully encrypted", type: "success" })
    } catch (error) {
      setEncryptStatus({
        message: error instanceof Error ? error.message : "Encryption failed",
        type: "error",
      })
    } finally {
      setIsEncrypting(false)
    }
  }

  // Handle decryption
  const handleDecrypt = async () => {
    if (!ciphertext.trim()) return

    setIsDecrypting(true)
    setDecryptError(null)
    setDecryptStatus(null)

    // Validate format first
    if (!isValidEncryptedFormat(ciphertext)) {
      const errorMsg = "Invalid encrypted message format"
      setDecryptError(errorMsg)
      setIsDecrypting(false)
      setDecryptStatus({ message: errorMsg, type: "error" })
      return
    }

    try {
      const decrypted = await decryptMessage(ciphertext)
      setDecryptedText(decrypted)
      setDecryptError(null)
      addToHistory("decrypt", ciphertext, decrypted)
      window.dispatchEvent(new Event("history-updated"))
      setDecryptStatus({ message: "Message successfully decrypted", type: "success" })
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Decryption failed"
      setDecryptError(errorMsg)
      setDecryptedText("")
      setDecryptStatus({ message: errorMsg, type: "error" })
    } finally {
      setIsDecrypting(false)
    }
  }

  // Copy to clipboard
  const copyToClipboard = async (text: string, type: "encrypt" | "decrypt") => {
    try {
      await navigator.clipboard.writeText(text)
      if (type === "encrypt") {
        setEncryptCopied(true)
        setEncryptStatus({ message: "Copied to clipboard", type: "success" })
        setTimeout(() => setEncryptCopied(false), 2000)
      } else {
        setDecryptCopied(true)
        setDecryptStatus({ message: "Copied to clipboard", type: "success" })
        setTimeout(() => setDecryptCopied(false), 2000)
      }
    } catch (error) {
      const errorMsg = "Failed to copy to clipboard"
      if (type === "encrypt") {
        setEncryptStatus({ message: errorMsg, type: "error" })
      } else {
        setDecryptStatus({ message: errorMsg, type: "error" })
      }
    }
  }

  // Clear functions
  const clearEncrypt = () => {
    setPlaintext("")
    setEncryptedText("")
    setEncryptCopied(false)
    setEncryptStatus(null)
  }

  const clearDecrypt = () => {
    setCiphertext("")
    setDecryptedText("")
    setDecryptCopied(false)
    setDecryptError(null)
    setDecryptStatus(null)
  }

  return (
    <Card className="w-full border-border/50 bg-card/50 backdrop-blur-sm shadow-2xl">
      <CardHeader className="space-y-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl font-bold text-balance">Secure Messaging</CardTitle>
          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge variant="outline" className="gap-1.5 px-2 py-1 cursor-help">
                    <Keyboard className="h-3 w-3" />
                  </Badge>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-xs">
                  <p className="text-xs font-medium mb-1">Keyboard Shortcuts</p>
                  <p className="text-xs text-muted-foreground">{isMac ? "⌘" : "Ctrl"} + Enter: Encrypt/Decrypt</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <Badge variant="secondary" className="gap-1.5 px-3 py-1">
              <Lock className="h-3 w-3" />
              AES-256
            </Badge>
          </div>
        </div>
        <CardDescription className="text-muted-foreground">
          Encrypt and decrypt messages with military-grade security
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Tabs value={activeTab} onValueChange={(v: string) => setActiveTab(v as "encrypt" | "decrypt")} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="encrypt" className="gap-2">
              <Lock className="h-4 w-4" />
              Encrypt Message
            </TabsTrigger>
            <TabsTrigger value="decrypt" className="gap-2">
              <Unlock className="h-4 w-4" />
              Decrypt Message
            </TabsTrigger>
          </TabsList>

          {/* Encrypt Tab */}
          <TabsContent value="encrypt" className="space-y-4">
            <StatusMessage
              message={encryptStatus?.message ?? null}
              type={encryptStatus?.type}
              onClear={() => setEncryptStatus(null)}
            />
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Plain Text Message</label>
                <span className="text-xs text-muted-foreground">{plaintext.length} characters</span>
              </div>
              <Textarea
                placeholder="Enter your message to encrypt..."
                value={plaintext}
                onChange={(e: { target: { value: SetStateAction<string> } }) => setPlaintext(e.target.value)}
                className="min-h-[120px] resize-none bg-input/50 font-mono text-sm focus:bg-input transition-colors"
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={handleEncrypt} disabled={!plaintext.trim() || isEncrypting} className="flex-1 gap-2">
                <Lock className="h-4 w-4" />
                {isEncrypting ? "Encrypting..." : "Encrypt"}
              </Button>
              <Button onClick={clearEncrypt} variant="outline" size="icon" disabled={!plaintext && !encryptedText}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            {encryptedText && (
              <div className="space-y-2 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-primary">Encrypted Output</label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(encryptedText, "encrypt")}
                    className="gap-2 h-8"
                  >
                    {encryptCopied ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-primary" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>
                <Textarea
                  value={encryptedText}
                  readOnly
                  className="min-h-[120px] resize-none bg-primary/5 border-primary/20 font-mono text-sm"
                />
              </div>
            )}
          </TabsContent>

          {/* Decrypt Tab */}
          <TabsContent value="decrypt" className="space-y-4">
            <StatusMessage
              message={decryptStatus?.message ?? null}
              type={decryptStatus?.type}
              onClear={() => setDecryptStatus(null)}
            />
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Encrypted Message</label>
                <span className="text-xs text-muted-foreground">{ciphertext.length} characters</span>
              </div>
              <Textarea
                placeholder="Paste encrypted message here..."
                value={ciphertext}
                onChange={(e: { target: { value: SetStateAction<string> } }) => {
                  setCiphertext(e.target.value)
                  setDecryptError(null)
                }}
                className="min-h-[120px] resize-none bg-input/50 font-mono text-sm focus:bg-input transition-colors"
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={handleDecrypt} disabled={!ciphertext.trim() || isDecrypting} className="flex-1 gap-2">
                <Unlock className="h-4 w-4" />
                {isDecrypting ? "Decrypting..." : "Decrypt"}
              </Button>
              <Button onClick={clearDecrypt} variant="outline" size="icon" disabled={!ciphertext && !decryptedText}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            {decryptError && (
              <div className="flex items-start gap-3 p-4 rounded-lg bg-destructive/10 border border-destructive/20 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm font-medium text-destructive">Decryption Error</p>
                  <p className="text-sm text-destructive/80">{decryptError}</p>
                </div>
              </div>
            )}

            {decryptedText && !decryptError && (
              <div className="space-y-2 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-accent">Decrypted Message</label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(decryptedText, "decrypt")}
                    className="gap-2 h-8"
                  >
                    {decryptCopied ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-accent" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>
                <Textarea
                  value={decryptedText}
                  readOnly
                  className="min-h-[120px] resize-none bg-accent/5 border-accent/20 font-mono text-sm"
                />
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
