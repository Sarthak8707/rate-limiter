local key = KEYS[1]

local now = tonumber(ARGV[1])
local windowSize = tonumber(ARGV[2])
local maxRequests = tonumber(ARGV[3])

local currentWindow = math.floor(now/windowSize)*windowSize

local data = redis.call("HMGET", key,
  "currentWindow",
  "currentCount",
  "previousCount"
)

local storedWindow = tonumber(data[1])
local currentCount = tonumber(data[2]) or 0
local previousCount = tonumber(data[3]) or 0

if not storedWindow then
  storedWindow = currentWindow
  currentCount = 0
  previousCount = 0
end

if storedWindow ~= currentWindow then
  local windowDiff = (currentWindow - storedWindow)/windowSize
  if windowDiff == 1 then
    previousCount = currentCount
  else
    previousCount = 0
  end
  currentCount = 0
  storedWindow = currentWindow
end

local timeIntoWindow = now - currentWindow
local timeLeft = windowSize - timeIntoWindow
local overlapRatio = timeLeft/windowSize

local requests = currentCount + previousCount * overlapRatio

if requests > maxRequests then
  return 0
end

currentCount = currentCount + 1

redis.call("HMSET", key,
  "currentWindow", storedWindow,
  "currentCount", currentCount,
  "previousCount", previousCount
)

redis.call("EXPIRE", key, math.ceil(windowSize*2/1000))

return 1