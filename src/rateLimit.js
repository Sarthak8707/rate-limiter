
const requestLog = new Map(); // store (id, {currentWindow, currentCount, previousCount})
const WINDOW_SIZE = 60*1000;  
const MAX_REQUESTS = 1000;

export const rateLimiter = (req, res, next) => {
    const id = req.id;
    const now = Date.now();
    const currentWindow = Math.floor(now/WINDOW_SIZE)*WINDOW_SIZE;
    if(!requestLog.has(id)){
        requestLog.set(id, {currentWindow: currentWindow, currentCount: 0, previousCount: 0});
    }
    const data = requestLog.get(id);

    // Not in the same window
    if(data.currentWindow != currentWindow){
        const windowDiff = (currentWindow-data.currentWindow)/WINDOW_SIZE;
        if(windowDiff == 1){
            data.previousCount = data.currentCount;
        }
        else{
            data.previousCount = 0;
        }
        data.currentCount = 0;
        data.currentWindow = currentWindow;
    }
    const timeIntoWindow = now - currentWindow;
    const timeLeft = WINDOW_SIZE - timeIntoWindow;
    const overlapRatio = timeLeft/WINDOW_SIZE;
    const requests = data.currentCount + data.previousCount*overlapRatio;

    if(requests > MAX_REQUESTS){
        return res.status(429).json({msg: "Too manny requests"});
    }

    data.currentCount += 1;
    next();

    

}