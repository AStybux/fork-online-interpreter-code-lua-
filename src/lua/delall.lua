--[[
    Delete keys of a pattern
    Parameters
        ARGV[1] = Prefix pattern (e.g., "user:*")
        ARGV[2] = max deletes, 1000 if unspecified. 
]]

local pattern = ARGV[1]
local limit= tonumber(ARGV[2]) or 1000
local cursor = "0"
local count = 100 
local deletedCount = 0

if (pattern == nil or pattern == '*') then
    return -1
end    
repeat
    local result = redis.call("SCAN", cursor, "MATCH", pattern, "COUNT", count)
    cursor = result[1]
    local keys = result[2]

    for i = 1, #keys do
        redis.call("UNLINK", keys[i])
        deletedCount = deletedCount + 1

    -- reach return limit
    if (deletedCount == limit) then 
        return deletedCount
      end 
    end
until cursor == "0"

-- finish scan 
return deletedCount
