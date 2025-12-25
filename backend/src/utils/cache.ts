export class ExpiringCache<T> {
  private value?: T;
  private expiresAt: number = 0;

  constructor(private ttlMs: number) {}

  set(val: T) {
    this.value = val;
    this.expiresAt = Date.now() + this.ttlMs;
  }

  get(): T | undefined {
    if (!this.value) return undefined;
    if (Date.now() > this.expiresAt) {
      this.value = undefined;
      this.expiresAt = 0;
      return undefined;
    }
    return this.value;
  }

  clear() {
    this.value = undefined;
    this.expiresAt = 0;
  }
}