"use client"

import { useState, useEffect, SetStateAction } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Lock, Unlock, Copy, Trash2, Check, AlertCircle, Keyboard, Hash } from "lucide-react"
import { encryptMessage, decryptMessage, isValidEncryptedFormat, hashString } from "@/lib/crypto"
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
  const [hashStatus, setHashStatus] = useState<{ message: string; type: "success" | "error" } | null>(null)

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

  // Hashing state
  const [hashInput, setHashInput] = useState("")
  const [hashOutput, setHashOutput] = useState("")
  const [isHashing, setIsHashing] = useState(false)
  const [hashCopied, setHashCopied] = useState(false)

  // Active tab state
  const [activeTab, setActiveTab] = useState<"encrypt" | "decrypt" | "hash">("encrypt")

  const [isMac, setIsMac] = useState(false)

  useEffect(() => {
    setIsMac(navigator.platform.toUpperCase().indexOf("MAC") >= 0)
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault()
        if (activeTab === "encrypt" && plaintext.trim()) {
          handleEncrypt()
        } else if (activeTab === "decrypt" && ciphertext.trim()) {
          handleDecrypt()
        } else if (activeTab === "hash" && hashInput.trim()) {
          handleHash()
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [activeTab, plaintext, ciphertext, hashInput])

  const handleRestore = (entry: HistoryEntry) => {
    if (entry.action === "encrypt") {
      setActiveTab("encrypt")
      setPlaintext(entry.input)
      setEncryptedText(entry.output)
      setEncryptStatus({ message: "Restored from history", type: "success" })
    } else if (entry.action === "decrypt") {
      setActiveTab("decrypt")
      setCiphertext(entry.input)
      setDecryptedText(entry.output)
      setDecryptError(null)
      setDecryptStatus({ message: "Restored from history", type: "success" })
    } else if (entry.action === "hash") {
      setActiveTab("hash")
      setHashInput(entry.input)
      setHashOutput(entry.output)
      setHashStatus({ message: "Restored from history", type: "success" })
    }
  }

  if (onHistoryRestore) {
    onHistoryRestore(handleRestore as any)
  }

  const handleEncrypt = async () => {
    if (!plaintext.trim()) return
    setIsEncrypting(true)
    setEncryptStatus(null)
    try {
      const encrypted = await encryptMessage(plaintext)
      setEncryptedText(encrypted)
      addToHistory("encrypt", plaintext, encrypted)
      window.dispatchEvent(new Event("history-updated"))
      setEncryptStatus({ message: "Your message is now locked!", type: "success" })
    } catch (error) {
      setEncryptStatus({ message: "Could not lock the message", type: "error" })
    } finally {
      setIsEncrypting(false)
    }
  }

  const handleDecrypt = async () => {
    if (!ciphertext.trim()) return
    setIsDecrypting(true)
    setDecryptError(null)
    setDecryptStatus(null)
    if (!isValidEncryptedFormat(ciphertext)) {
      const errorMsg = "This does not look like a locked message."
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
      setDecryptStatus({ message: "Your message is now unlocked!", type: "success" })
    } catch (error) {
      const errorMsg = "Could not unlock the message"
      setDecryptError(errorMsg)
      setDecryptedText("")
      setDecryptStatus({ message: errorMsg, type: "error" })
    } finally {
      setIsDecrypting(false)
    }
  }

  const handleHash = async () => {
    if (!hashInput.trim()) return
    setIsHashing(true)
    setHashStatus(null)
    try {
      const hashed = await hashString(hashInput)
      setHashOutput(hashed)
      addToHistory("hash", hashInput, hashed)
      window.dispatchEvent(new Event("history-updated"))
      setHashStatus({ message: "Text successfully hashed!", type: "success" })
    } catch (error) {
      setHashStatus({ message: "Could not hash the text", type: "error" })
    } finally {
      setIsHashing(false)
    }
  }

  const copyToClipboard = async (text: string, type: "encrypt" | "decrypt" | "hash") => {
    try {
      await navigator.clipboard.writeText(text)
      if (type === "encrypt") {
        setEncryptCopied(true)
        setEncryptStatus({ message: "Copied!", type: "success" })
        setTimeout(() => setEncryptCopied(false), 2000)
      } else if (type === "decrypt") {
        setDecryptCopied(true)
        setDecryptStatus({ message: "Copied!", type: "success" })
        setTimeout(() => setDecryptCopied(false), 2000)
      } else {
        setHashCopied(true)
        setHashStatus({ message: "Copied!", type: "success" })
        setTimeout(() => setHashCopied(false), 2000)
      }
    } catch (error) {
      const errorMsg = "Could not copy"
      if (type === "encrypt") setEncryptStatus({ message: errorMsg, type: "error" })
      else if (type === "decrypt") setDecryptStatus({ message: errorMsg, type: "error" })
      else setHashStatus({ message: errorMsg, type: "error" })
    }
  }

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

  const clearHash = () => {
    setHashInput("")
    setHashOutput("")
    setHashCopied(false)
    setHashStatus(null)
  }

  return (
    <Card className="w-full border-border/50 bg-card/50 backdrop-blur-sm shadow-2xl">
      <CardHeader className="space-y-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl font-bold text-balance">CipherLink</CardTitle>
          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge variant="outline" className="gap-1.5 px-2 py-1 cursor-help">
                    <Keyboard className="h-3 w-3" />
                  </Badge>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-xs">
                  <p className="text-xs font-medium mb-1">Quick Tips</p>
                  <p className="text-xs text-muted-foreground">
                    {isMac ? "⌘" : "Ctrl"} + Enter: Press to lock, unlock, or hash.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <Badge variant="secondary" className="gap-1.5 px-3 py-1">
              <Lock className="h-3 w-3" />
              AES-256-GCM
            </Badge>
          </div>
        </div>
        <CardDescription className="text-muted-foreground">
          A modern tool for secure encryption and text hashing.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Tabs
          value={activeTab}
          onValueChange={(v: string) => setActiveTab(v as "encrypt" | "decrypt" | "hash")}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="encrypt" className="gap-2">
              <Lock className="h-4 w-4" />
              Lock
            </TabsTrigger>
            <TabsTrigger value="decrypt" className="gap-2">
              <Unlock className="h-4 w-4" />
              Unlock
            </TabsTrigger>
            <TabsTrigger value="hash" className="gap-2">
              <Hash className="h-4 w-4" />
              Hash
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
                <label className="text-sm font-medium">Your Message</label>
                <span className="text-xs text-muted-foreground">{plaintext.length} characters</span>
              </div>
              <Textarea
                placeholder="Write your secret message here..."
                value={plaintext}
                onChange={(e: { target: { value: SetStateAction<string> } }) => setPlaintext(e.target.value)}
                className="min-h-[120px] resize-none bg-input/50 font-mono text-sm focus:bg-input transition-colors"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleEncrypt} disabled={!plaintext.trim() || isEncrypting} className="flex-1 gap-2">
                <Lock className="h-4 w-4" />
                {isEncrypting ? "Locking..." : "Lock it"}
              </Button>
              <Button onClick={clearEncrypt} variant="outline" size="icon" disabled={!plaintext && !encryptedText}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            {encryptedText && (
              <div className="space-y-2 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-primary">Your Locked Message</label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(encryptedText, "encrypt")}
                    className="gap-2 h-8"
                  >
                    {encryptCopied ? <Check className="h-3.5 w-3.5 text-primary" /> : <Copy className="h-3.5 w-3.5" />}
                    {encryptCopied ? "Copied" : "Copy"}
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
                <label className="text-sm font-medium">The Locked Message</label>
                <span className="text-xs text-muted-foreground">{ciphertext.length} characters</span>
              </div>
              <Textarea
                placeholder="Paste the locked message here..."
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
                {isDecrypting ? "Unlocking..." : "Unlock it"}
              </Button>
              <Button onClick={clearDecrypt} variant="outline" size="icon" disabled={!ciphertext && !decryptedText}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            {decryptError && (
              <div className="flex items-start gap-3 p-4 rounded-lg bg-destructive/10 border border-destructive/20 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm font-medium text-destructive">Something went wrong</p>
                  <p className="text-sm text-destructive/80">{decryptError}</p>
                </div>
              </div>
            )}
            {decryptedText && !decryptError && (
              <div className="space-y-2 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-accent">Your Unlocked Message</label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(decryptedText, "decrypt")}
                    className="gap-2 h-8"
                  >
                    {decryptCopied ? <Check className="h-3.5 w-3.5 text-accent" /> : <Copy className="h-3.5 w-3.5" />}
                    {decryptCopied ? "Copied" : "Copy"}
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

          {/* Hash Tab */}
          <TabsContent value="hash" className="space-y-4">
            <StatusMessage
              message={hashStatus?.message ?? null}
              type={hashStatus?.type}
              onClear={() => setHashStatus(null)}
            />
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Text to Hash</label>
                <span className="text-xs text-muted-foreground">{hashInput.length} characters</span>
              </div>
              <Textarea
                placeholder="Enter text to generate a SHA-256 hash..."
                value={hashInput}
                onChange={(e: { target: { value: SetStateAction<string> } }) => setHashInput(e.target.value)}
                className="min-h-[120px] resize-none bg-input/50 font-mono text-sm focus:bg-input transition-colors"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleHash} disabled={!hashInput.trim() || isHashing} className="flex-1 gap-2">
                <Hash className="h-4 w-4" />
                {isHashing ? "Hashing..." : "Generate Hash"}
              </Button>
              <Button onClick={clearHash} variant="outline" size="icon" disabled={!hashInput && !hashOutput}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            {hashOutput && (
              <div className="space-y-2 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-green-500">SHA-256 Hash</label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(hashOutput, "hash")}
                    className="gap-2 h-8"
                  >
                    {hashCopied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.se w-3.5" />}
                    {hashCopied ? "Copied" : "Copy"}
                  </Button>
                </div>
                <Textarea
                  value={hashOutput}
                  readOnly
                  className="min-h-[120px] resize-none bg-green-500/5 border-green-500/20 font-mono text-sm"
                />
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
