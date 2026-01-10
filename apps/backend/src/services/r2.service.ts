import type { R2Bucket, ReadableStream } from '@cloudflare/workers-types'

export interface R2ObjectMetadata {
  data: ArrayBuffer
  metadata?: Record<string, string>
  etag?: string
}

export interface PutObjectOptions {
  customMetadata?: Record<string, string>
}

export async function getObject(bucket: R2Bucket, key: string): Promise<R2ObjectMetadata | null> {
  try {
    const object = await bucket.get(key)

    if (!object) {
      return null
    }

    return {
      data: await object.arrayBuffer(),
      metadata: object.customMetadata,
      etag: object.etag,
    }
  } catch (error) {
    console.error(`Failed to get object ${key}:`, error)
    throw new Error(`Failed to get object: ${error}`)
  }
}

export async function putObject(
  bucket: R2Bucket,
  key: string,
  data: string | ArrayBuffer | ReadableStream | ArrayBufferView | Blob | null,
  options?: PutObjectOptions,
) {
  try {
    const dataToUpload = data instanceof Blob ? await data.arrayBuffer() : data
    const object = await bucket.put(key, dataToUpload, {
      customMetadata: options?.customMetadata,
    })

    return object
  } catch (error) {
    console.error(`Failed to put object ${key}:`, error)
    throw new Error(`Failed to put object: ${error}`)
  }
}

export async function deleteObject(bucket: R2Bucket, key: string): Promise<void> {
  try {
    await bucket.delete(key)
  } catch (error) {
    console.error(`Failed to delete object ${key}:`, error)
    throw new Error(`Failed to delete object: ${error}`)
  }
}

export async function listObjects(
  bucket: R2Bucket,
  prefix?: string,
  options?: {
    limit?: number
    cursor?: string
  },
) {
  try {
    const result = await bucket.list({
      prefix,
      limit: options?.limit,
      cursor: options?.cursor,
    })

    return result
  } catch (error) {
    console.error('Failed to list objects:', error)
    throw new Error(`Failed to list objects: ${error}`)
  }
}

export async function objectExists(bucket: R2Bucket, key: string): Promise<boolean> {
  try {
    const object = await bucket.head(key)
    return object !== null
  } catch (error) {
    console.error(`Failed to check if object ${key} exists:`, error)
    return false
  }
}
