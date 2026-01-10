function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes.buffer
}

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16))

  const encoder = new TextEncoder()
  const passwordData = encoder.encode(password)

  const key = await crypto.subtle.importKey('raw', passwordData, { name: 'PBKDF2' }, false, [
    'deriveBits',
  ])

  const hashBuffer = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256',
    },
    key,
    256,
  )

  const saltBase64 = arrayBufferToBase64(salt.buffer)
  const hashBase64 = arrayBufferToBase64(hashBuffer)

  return `${saltBase64}:${hashBase64}`
}

export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  try {
    const [saltBase64, hashBase64] = storedHash.split(':')
    if (!saltBase64 || !hashBase64) {
      return false
    }

    const salt = new Uint8Array(base64ToArrayBuffer(saltBase64))

    const encoder = new TextEncoder()
    const passwordData = encoder.encode(password)

    const key = await crypto.subtle.importKey('raw', passwordData, { name: 'PBKDF2' }, false, [
      'deriveBits',
    ])

    const hashBuffer = await crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: 100000,
        hash: 'SHA-256',
      },
      key,
      256,
    )

    const derivedHashBase64 = arrayBufferToBase64(hashBuffer)

    return derivedHashBase64 === hashBase64
  } catch (error) {
    console.error('Error verifying password:', error)
    return false
  }
}
