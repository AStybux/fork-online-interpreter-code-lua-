--[[
	Small script to peep insight Redis
	Parameters:
    KEYS[1] = Table to peep, "_G" if unspecified.
]]
local target = KEYS[1] or _G
local result = {}

local function countTable(tbl)
  local count = 0
  for _ in pairs(tbl) do
    count = count + 1
  end
  return count
end

if type(target) == 'string' then 
	target = _G[target]
end 

for k, v in pairs(target) do
	local t = type(v)
	if t == "string" then 
		table.insert(result, "<br />"..k .. " : " .. t.." = ".."'"..v.."" )
	elseif t=="table" then 
		table.insert(result, "<br />"..k .. " : " .. t.." ["..countTable(v).."]")
	else
		table.insert(result, "<br />"..k .. " : " .. t) 
	end 
end
return result