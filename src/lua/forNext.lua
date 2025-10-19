--[[
	Small script to return "#" triangle
	Parameters: 
		KEYS[1] = length, 50 if unspecified. 
]]

local count = tonumber(KEYS[1]) or 50
local output = {}

for i = 1, count, 1 do
  output[i] = '<br />' .. string.rep('#', i)
end

return output
