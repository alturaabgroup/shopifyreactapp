export class ExpiringCache<T> {
  private values: Map<string, T>;
  private expiresAt: Map<string, number>;
  private defaultKey = '__default__';

  constructor(private ttlMs: number) {
    this.values = new Map();
    this.expiresAt = new Map();
  }

  set(val: T, key: string = this.defaultKey) {
    this.values.set(key, val);
    this.expiresAt.set(key, Date.now() + this.ttlMs);
  }

  get(key: string = this.defaultKey): T | undefined {
    const value = this.values.get(key);
    if (!value) return undefined;
    
    const expiresAt = this.expiresAt.get(key) || 0;
    if (Date.now() > expiresAt) {
      this.values.delete(key);
      this.expiresAt.delete(key);
      return undefined;
    }
    return value;
  }

  clear(key?: string) {
    if (key) {
      this.values.delete(key);
      this.expiresAt.delete(key);
    } else {
      this.values.clear();
      this.expiresAt.clear();
    }
  }

  getAllKeys(): string[] {
    return Array.from(this.values.keys());
  }
}