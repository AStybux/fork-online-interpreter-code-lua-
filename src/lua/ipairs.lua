--[[
	ipairs demo
]]

local input= { [1] = "apple", [2] = "banana", [3] = "cherry" }
local output= {}

for i, v in ipairs(input) do
  table.insert(output, i .. '=' .. v)
end

return output
