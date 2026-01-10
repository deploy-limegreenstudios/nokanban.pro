import { customType } from 'drizzle-orm/sqlite-core'
import type { ULID } from 'ulid'

export const ulidType = customType<{ data: string }>({
  dataType() {
    return 'text'
  },
  fromDriver(value) {
    return value as ULID
  },
  toDriver(value) {
    return value
  },
})
