import { logger } from '../config/logger'
import { getDb } from '../database/db'
import { BoardRepository } from '../database/repositories'
import type { Env } from '../types/bindings'

/**
 * Cron job to delete boards inactive for 30+ days
 * Runs daily at midnight UTC
 */
export async function cleanupInactiveBoards(env: Env) {
  const db = getDb(env.DB, env.ENVIRONMENT)
  const boardRepo = new BoardRepository(db)

  try {
    const deletedCount = await boardRepo.deleteInactive(30)
    logger.info({ deletedCount }, 'Cleanup job completed')
    return { success: true, deletedCount }
  } catch (error) {
    logger.error({ error }, 'Cleanup job failed')
    throw error
  }
}

export default {
  async scheduled(
    _event: { scheduledTime: number; cron: string },
    env: Env,
    ctx: { waitUntil: (promise: Promise<unknown>) => void },
  ) {
    ctx.waitUntil(cleanupInactiveBoards(env))
  },
}
