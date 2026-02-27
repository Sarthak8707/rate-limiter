import { redisClient } from "./redisClient.js";

const WINDOW_SIZE = 60; // 60 secs for redis  
const MAX_REQUESTS = 1000;

export const rateLimiter = async (req, res, next) => {
    
    const id = req.id;
    const requests = await redisClient.incr(id); // will produce unique value for every server/thread so NO race condition
    
    if(requests === 1){
        await redisClient.expire(id, WINDOW_SIZE);
    }
    
    if(requests > MAX_REQUESTS){
        return res.status(429).json({msg: "Too many requests"});
    }

    next();


}