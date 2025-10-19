--[[
	Small script to return keys of a pattern 
    Parameters: 
		ARGV[1] = pattern name, * if unspecified. 
		ARGV[2] = max returns, 100 if unspecified. 
]]

local pattern = ARGV[1] or ''
local limit= tonumber(ARGV[2]) or 100
local cursor = '0'
local count = 100 
local n = 0 
local output = {}

pattern = pattern .. '*'
repeat
  -- SCAN returns [ cursor, keys ]
  local result = redis.call('SCAN', cursor, 'MATCH', pattern, 'COUNT', count)
  cursor = result[1] 
  local keys = result[2]

  -- keys is [key1, key2, ...]
  for i = 1, #keys do
    table.insert(output, keys[i])
	  n = n + 1 

    -- reach return limit
    if (n == limit) then 
      return output
    end 
  end
until cursor == '0'

-- finish scan 
return output
