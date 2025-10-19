--[[
    Sum score of Sorted Set
    Parameters: 
      KEYS[1] = Sorted Set key
      KEYS[2] = Segment size (optional, default = 1000)
]]

local key = KEYS[1]
--local segmentSize = tonumber(KEYS[2]) or 1000
local segmentSize = (KEYS[2] == "0") and 1 or tonumber(KEYS[2]) or 1000
local total = 0
local start = 0
local batch

repeat
  batch = redis.call('ZRANGE', key, start, start + segmentSize - 1, 'WITHSCORES')
  for i = 2, #batch, 2 do
  total = total + tonumber(batch[i])
  end
  start = start + segmentSize
until #batch == 0

return total
