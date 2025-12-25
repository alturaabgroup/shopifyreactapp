import { Session } from '@shopify/shopify-api';
import pino from 'pino';

const logger = pino({ name: 'sessionStorage' });

// In-memory session storage for development
// For production, use Redis, PostgreSQL, or other persistent storage
class MemorySessionStorage {
  private sessions: Map<string, Session>;

  constructor() {
    this.sessions = new Map();
  }

  async storeSession(session: Session): Promise<boolean> {
    try {
      this.sessions.set(session.id, session);
      logger.info({ sessionId: session.id, shop: session.shop }, 'Session stored');
      return true;
    } catch (error) {
      logger.error({ error, sessionId: session.id }, 'Failed to store session');
      return false;
    }
  }

  async loadSession(id: string): Promise<Session | undefined> {
    try {
      const session = this.sessions.get(id);
      if (session) {
        logger.info({ sessionId: id, shop: session.shop }, 'Session loaded');
      }
      return session;
    } catch (error) {
      logger.error({ error, sessionId: id }, 'Failed to load session');
      return undefined;
    }
  }

  async deleteSession(id: string): Promise<boolean> {
    try {
      const deleted = this.sessions.delete(id);
      if (deleted) {
        logger.info({ sessionId: id }, 'Session deleted');
      }
      return deleted;
    } catch (error) {
      logger.error({ error, sessionId: id }, 'Failed to delete session');
      return false;
    }
  }

  async deleteSessions(ids: string[]): Promise<boolean> {
    try {
      for (const id of ids) {
        this.sessions.delete(id);
      }
      logger.info({ count: ids.length }, 'Multiple sessions deleted');
      return true;
    } catch (error) {
      logger.error({ error, ids }, 'Failed to delete sessions');
      return false;
    }
  }

  async findSessionsByShop(shop: string): Promise<Session[]> {
    try {
      const sessions: Session[] = [];
      for (const session of this.sessions.values()) {
        if (session.shop === shop) {
          sessions.push(session);
        }
      }
      return sessions;
    } catch (error) {
      logger.error({ error, shop }, 'Failed to find sessions by shop');
      return [];
    }
  }
}

export const sessionStorage = new MemorySessionStorage();
