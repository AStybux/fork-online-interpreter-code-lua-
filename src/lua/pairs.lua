--[[
	pairs demo
]]

local input = { a = "apple", b = "banana", c = "cherry" }
local output = {}

for k, v in pairs(input) do
  table.insert(output, k .. '=' .. v)
end

return output