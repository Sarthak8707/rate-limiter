
const map = new Map();

const checkForLimit = (userId) => {

    const {reqCount, currentTime} = map.get(userId);
    
    const timeDiff = Date.now() - currentTime;
    
    if(timeDiff > 60000) reqCount = 1, currentTime = Date.now();
    else reqCount++; 

    if(reqCount > 1000) return false;

    return true;
}

export const rateLimiter = (req, res, next) => {
    const id = req.user.id;

    // if request is made first time

    if(!map.has(id)) {
        map.set(id, {reqCount: 1, currentTime: Date.now()});
    }

    const underLimit = checkForLimit(id);

    if(!underLimit) res.status(429).json({msg: "Too many requests"})

    next();
    
}