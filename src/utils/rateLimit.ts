// Rate limit tracking utilities

interface RateLimitInfo {
  requestedQueryCost: number;
  actualQueryCost: number;
  maximumAvailable: number;
  currentlyAvailable: number;
  restoreRate: number;
  timestamp: number;
}

let lastRateLimitInfo: RateLimitInfo | null = null;

export function updateRateLimit(cost: any) {
  if (!cost) return;

  lastRateLimitInfo = {
    requestedQueryCost: cost.requestedQueryCost,
    actualQueryCost: cost.actualQueryCost,
    maximumAvailable: cost.throttleStatus.maximumAvailable,
    currentlyAvailable: cost.throttleStatus.currentlyAvailable,
    restoreRate: cost.throttleStatus.restoreRate,
    timestamp: Date.now(),
  };

  const percentUsed = ((lastRateLimitInfo.maximumAvailable - lastRateLimitInfo.currentlyAvailable) / lastRateLimitInfo.maximumAvailable) * 100;

  if (percentUsed > 80) {
    console.warn(`[Rate Limit] Warning: ${percentUsed.toFixed(1)}% of rate limit used`);
  }
}

export function shouldBackoff(): boolean {
  if (!lastRateLimitInfo) return false;

  const percentUsed = ((lastRateLimitInfo.maximumAvailable - lastRateLimitInfo.currentlyAvailable) / lastRateLimitInfo.maximumAvailable) * 100;

  return percentUsed > 90;
}

export function getBackoffDelay(): number {
  if (!lastRateLimitInfo) return 0;

  // Calculate time to restore some capacity
  const restoreRate = lastRateLimitInfo.restoreRate;
  const needed = lastRateLimitInfo.maximumAvailable * 0.2; // Wait for 20% to restore
  
  return Math.ceil((needed / restoreRate) * 1000); // Convert to milliseconds
}

export function getRateLimitInfo(): RateLimitInfo | null {
  return lastRateLimitInfo;
}
