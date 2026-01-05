// Encryption and Decryption utilities using Web Crypto API with AES-GCM

const ALGORITHM = "AES-GCM"
const KEY_LENGTH = 256
const IV_LENGTH = 12
const SALT_LENGTH = 16

// Static password for symmetric encryption (same key for encrypt/decrypt)
// In production, this could be user-configurable
const PASSWORD = "cipherlink-secure-key-2024"

/**
 * Derives a cryptographic key from the password using PBKDF2
 */
async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const encoder = new TextEncoder()
  const passwordBuffer = encoder.encode(password)

  const keyMaterial = await crypto.subtle.importKey("raw", passwordBuffer, "PBKDF2", false, ["deriveKey"])

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt as BufferSource,
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: ALGORITHM, length: KEY_LENGTH },
    false,
    ["encrypt", "decrypt"],
  )
}

/**
 * Encrypts a plaintext message
 * Returns base64-encoded string containing salt + iv + encrypted data
 */
export async function encryptMessage(plaintext: string): Promise<string> {
  try {
    const encoder = new TextEncoder()
    const data = encoder.encode(plaintext)

    // Generate random salt and IV
    const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH))
    const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH))

    // Derive key from password and salt
    const key = await deriveKey(PASSWORD, salt)

    // Encrypt the data
    const encryptedData = await crypto.subtle.encrypt(
      {
        name: ALGORITHM,
        iv,
      },
      key,
      data,
    )

    // Combine salt + iv + encrypted data
    const combined = new Uint8Array(salt.length + iv.length + encryptedData.byteLength)
    combined.set(salt, 0)
    combined.set(iv, salt.length)
    combined.set(new Uint8Array(encryptedData), salt.length + iv.length)

    // Convert to base64
    return btoa(String.fromCharCode(...combined))
  } catch (error) {
    throw new Error("Encryption failed: " + (error instanceof Error ? error.message : "Unknown error"))
  }
}

/**
 * Decrypts an encrypted message
 * Takes base64-encoded string and returns plaintext
 */
export async function decryptMessage(encryptedBase64: string): Promise<string> {
  try {
    // Decode base64
    const combined = new Uint8Array(
      atob(encryptedBase64)
        .split("")
        .map((char) => char.charCodeAt(0)),
    )

    // Extract salt, iv, and encrypted data
    const salt = combined.slice(0, SALT_LENGTH)
    const iv = combined.slice(SALT_LENGTH, SALT_LENGTH + IV_LENGTH)
    const encryptedData = combined.slice(SALT_LENGTH + IV_LENGTH)

    // Derive key from password and salt
    const key = await deriveKey(PASSWORD, salt)

    // Decrypt the data
    const decryptedData = await crypto.subtle.decrypt(
      {
        name: ALGORITHM,
        iv,
      },
      key,
      encryptedData,
    )

    // Convert to string
    const decoder = new TextDecoder()
    return decoder.decode(decryptedData)
  } catch (error) {
    throw new Error("Decryption failed: Invalid encrypted message or corrupted data")
  }
}

/**
 * Validates if a string appears to be a valid encrypted message
 */
export function isValidEncryptedFormat(text: string): boolean {
  try {
    // Check if it's valid base64
    const decoded = atob(text)
    // Check if it has minimum required length (salt + iv + some data)
    return decoded.length >= SALT_LENGTH + IV_LENGTH + 1
  } catch {
    return false
  }
}
