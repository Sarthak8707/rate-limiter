import express from "express";

const app = express();

/*
  CONFIG
*/
const CAPACITY = 10;        // max tokens
const REFILL_RATE = 1;      // tokens per second

/*
  In-memory store
*/
const buckets = new Map();

/*
  Token Bucket Middleware
*/
function tokenBucketRateLimiter(req, res, next) {
  const key = req.ip; // or req.user.id if authenticated
  const now = Date.now() / 1000; // current time in seconds

  let bucket = buckets.get(key);

  if (!bucket) {
    bucket = {
      tokens: CAPACITY,
      lastRefill: now
    };
    buckets.set(key, bucket);
  }

  /*
    Step 1: Refill tokens based on time passed
  */
  const elapsed = now - bucket.lastRefill;
  const refill = elapsed * REFILL_RATE;

  bucket.tokens = Math.min(CAPACITY, bucket.tokens + refill);
  bucket.lastRefill = now;

  /*
    Step 2: Check availability
  */
  if (bucket.tokens >= 1) {
    bucket.tokens -= 1;
    return next();
  }

  /*
    Step 3: Reject
  */
  return res.status(429).json({
    message: "Too many requests"
  });
}

app.use(rateLimiter);

app.get("/", (req, res) => {
  res.send("Allowed");
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});