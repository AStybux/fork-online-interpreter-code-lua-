--[[
	Count number of keys and size of a pattern
	Parameters: 
		KEYS[1] = Prefix pattern (e.g., "user:*"), * if unspecified
]]

local key = KEYS[1] or ''
local cursor = "0"
local totalCount = 0
local totalSize = 0

local function toFix(number, decimal)
  local n = tonumber(number)
  local digits = tonumber(decimal) or 2

  return string.format("%." .. digits .. "f", n)
end  

key = key .. '*'
repeat
  local result = redis.call("SCAN", cursor, "MATCH", key, "COUNT", 1000)
  cursor = result[1]
  local keys = result[2]

  for i = 1, #keys do
    totalCount = totalCount + 1
    local size = redis.call("MEMORY", "USAGE", keys[i])
    if size then
      totalSize = totalSize + size
    end
  end
until cursor == "0"

return { tostring(totalCount), toFix( totalSize / 1024 /1024 )..'M' }