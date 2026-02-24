
const requestLog = new Map(); // store (id, array of timestamps)
const WINDOW_SIZE = 60*1000;  
const MAX_REQUESTS = 1000;

export const rateLimiter = (req, res, next) => {
    
    const id = req.user.id;
    let timeStamps = requestLog.get(id) || [];
    const now = Date.now();

    // remove timestamps older than a minute

    timeStamps.filter((timeStamp) => now - timeStamp < WINDOW_SIZE);

    // check limit

    if(timeStamps.length >= MAX_REQUESTS) return res.status(429).json({msg: "Too many requests"});

    // add to log
    
    timeStamps.push(now);

    requestLog.set(id, timeStamps);

    next();

}