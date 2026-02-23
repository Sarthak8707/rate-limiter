const map = new Map();

export const rateLimiter = (req, res, next) => {
    const id = req.user.id;

    // if request is made first time

    if(!map.has(id)) map.set(id, 1);

    // if request is not made first time

    else {
        const requests = map.get(id) + 1;
        map.set(id, requests)
    }

    const totalRequests = map.get(id);

    if(totalRequests > 1000) res.status(429).json({msg: "Too many requests"});
    
}