--[[
  Add member to Sorted Set
  Parameters:
    KEYS[1] = Sorted Set key
    ARGV[] = One or more members 
]]

local key = KEYS[1]
local added = 0
local n = 0

for i = 1, #ARGV do
  -- Add with initial score of 1
  added = redis.call('ZADD', key, 'NX', 1, ARGV[i])

  -- Member existed, increment score
  if added == 0 then 
    redis.call('ZINCRBY', key, 1, ARGV[i])
  end
  n = n + 1
end

return n
