--[[
	Small script to return sum and average of numbers 
	Parameters: 
		ARGV[] = numbers separated by space. 
]]

local function add(...)
    local args = {...}
    local sum = 0 
    for i, v in ipairs(args) do
      sum = sum + v 
    end
    return sum 
  end
  
  local function avg(...)
    local args = {...}
    local average = 0 
    for i, v in ipairs(args) do
      average = average + v 
    end
    if (#args ~= 0) then 
        return average / #args 
    else 
        return 0 
    end 
  end

  return { 
            'sum', add(unpack(ARGV)),
            'average', tostring(avg(unpack(ARGV))) 
        }
