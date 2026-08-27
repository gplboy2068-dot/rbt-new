import { RateLimitConfig } from '@/types';

// Default Anonymous rate limit configuration
export const defaultRateLimitConfig: RateLimitConfig = {
  aiQueriesPerHourPerIp: 15,
  aiQueriesPerDayPerIp: 50,
  maxBatchGeneration: 5,
  aiTutorEnabled: true,
  rateLimitWindowMs: 60 * 60 * 1000, // 1 hour
};

// Global in-memory storage for rate limits (persists across hot reloads in dev)
interface IpUsage {
  hourlyCount: number;
  hourlyReset: number;
  dailyCount: number;
  dailyReset: number;
}

class InMemoryRateLimiter {
  private ipMap = new Map<string, IpUsage>();
  private currentConfig: RateLimitConfig = { ...defaultRateLimitConfig };

  getConfig(): RateLimitConfig {
    return { ...this.currentConfig };
  }

  updateConfig(newConfig: Partial<RateLimitConfig>): RateLimitConfig {
    this.currentConfig = { ...this.currentConfig, ...newConfig };
    return this.currentConfig;
  }

  checkLimit(ip: string): {
    allowed: boolean;
    remainingHourly: number;
    remainingDaily: number;
    resetHourInSeconds: number;
    reason?: string;
  } {
    if (!this.currentConfig.aiTutorEnabled) {
      return {
        allowed: false,
        remainingHourly: 0,
        remainingDaily: 0,
        resetHourInSeconds: 0,
        reason: 'AI study assistance is temporarily paused by platform administrators.',
      };
    }

    const now = Date.now();
    let usage = this.ipMap.get(ip);

    if (!usage) {
      usage = {
        hourlyCount: 0,
        hourlyReset: now + this.currentConfig.rateLimitWindowMs,
        dailyCount: 0,
        dailyReset: now + 24 * 60 * 60 * 1000,
      };
      this.ipMap.set(ip, usage);
    }

    // Reset hourly window if expired
    if (now > usage.hourlyReset) {
      usage.hourlyCount = 0;
      usage.hourlyReset = now + this.currentConfig.rateLimitWindowMs;
    }

    // Reset daily window if expired
    if (now > usage.dailyReset) {
      usage.dailyCount = 0;
      usage.dailyReset = now + 24 * 60 * 60 * 1000;
    }

    const remainingHourly = Math.max(0, this.currentConfig.aiQueriesPerHourPerIp - usage.hourlyCount);
    const remainingDaily = Math.max(0, this.currentConfig.aiQueriesPerDayPerIp - usage.dailyCount);
    const resetHourInSeconds = Math.ceil(Math.max(0, usage.hourlyReset - now) / 1000);

    if (usage.hourlyCount >= this.currentConfig.aiQueriesPerHourPerIp) {
      return {
        allowed: false,
        remainingHourly: 0,
        remainingDaily,
        resetHourInSeconds,
        reason: `Hourly rate limit reached (${this.currentConfig.aiQueriesPerHourPerIp}/hr). Resets in ${Math.ceil(resetHourInSeconds / 60)} minutes.`,
      };
    }

    if (usage.dailyCount >= this.currentConfig.aiQueriesPerDayPerIp) {
      return {
        allowed: false,
        remainingHourly,
        remainingDaily: 0,
        resetHourInSeconds,
        reason: `Daily anonymous AI allowance reached (${this.currentConfig.aiQueriesPerDayPerIp}/day). Resets at midnight.`,
      };
    }

    return {
      allowed: true,
      remainingHourly,
      remainingDaily,
      resetHourInSeconds,
    };
  }

  recordUsage(ip: string): void {
    const usage = this.ipMap.get(ip);
    if (usage) {
      usage.hourlyCount += 1;
      usage.dailyCount += 1;
    }
  }

  getMetricsSummary(): {
    trackedIpsCount: number;
    activeSessionsToday: number;
  } {
    return {
      trackedIpsCount: this.ipMap.size,
      activeSessionsToday: Array.from(this.ipMap.values()).filter((u) => u.dailyCount > 0).length,
    };
  }
}

// Singleton global rate limiter instance
declare global {
  var __rtbRateLimiter: InMemoryRateLimiter | undefined;
}

export const rateLimiter = globalThis.__rtbRateLimiter || new InMemoryRateLimiter();
if (process.env.NODE_ENV !== 'production') {
  globalThis.__rtbRateLimiter = rateLimiter;
}
