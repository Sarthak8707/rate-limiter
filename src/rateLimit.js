import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { redisClient } from "./redisClient.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const scriptPath = path.join(__dirname, "./rateLimitLogic.lua");
const slidingWindowScript = fs.readFileSync(scriptPath, "utf8");

const WINDOW_SIZE = 60_000; // 60 seconds (milliseconds)
const MAX_REQUESTS = 10;


export const rateLimiter = async (req, res, next) => {
    
    try {
    const key = `rate:${req.ip}`;

    const allowed = await redisClient.eval(slidingWindowScript, {
      keys: [key],
      arguments: [Date.now(), WINDOW_SIZE, MAX_REQUESTS],
    });

    if (allowed === 0) {
      return res.status(429).json({
        message: "Too many requests",
      });
    }

    next();
  } catch (err) {
    console.error("Rate limiter error:", err);
    next(); // fail-open strategy
  }


}