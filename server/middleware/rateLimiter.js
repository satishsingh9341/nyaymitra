/**
 * In-memory sliding-window rate limiter per authenticated user.
 * PRD 6.3: Rate-limit the AI-calling routes per user to control cost/abuse.
 */
const rateLimitMap = new Map();

function createRateLimiter({ windowMs = 60 * 1000, maxRequests = 20, message = 'Rate limit exceeded. Please wait a moment before trying again.' } = {}) {
  return function rateLimiter(req, res, next) {
    const key = req.user?.uid || req.ip || 'anonymous';
    const now = Date.now();

    if (!rateLimitMap.has(key)) {
      rateLimitMap.set(key, []);
    }

    const timestamps = rateLimitMap.get(key);
    // Remove timestamps outside current sliding window
    const windowStart = now - windowMs;
    const activeTimestamps = timestamps.filter((t) => t > windowStart);

    if (activeTimestamps.length >= maxRequests) {
      const retryAfter = Math.ceil((activeTimestamps[0] + windowMs - now) / 1000);
      res.set('Retry-After', String(retryAfter));
      return res.status(429).json({
        error: message,
      });
    }

    activeTimestamps.push(now);
    rateLimitMap.set(key, activeTimestamps);
    next();
  };
}

module.exports = {
  createRateLimiter,
};
