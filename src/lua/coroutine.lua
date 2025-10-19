local ret, msg, output = true, '', {} 

local function taskA(x)
  table.insert(output, ' x = ' .. x)
  local y = coroutine.yield(x)
  table.insert(output, ' y = ' .. y)
  local z = coroutine.yield(y)
  table.insert(output, ' z = ' .. z)

  return z
end

local function print(r, m) 
	table.insert(output, ' ret = '.. tostring(r))
	table.insert(output, ' msg = '.. tostring(m))
end 

local co = coroutine.create(taskA)
ret, msg = coroutine.resume(co, "fossil")
print(ret, msg)
ret, msg = coroutine.resume(co, "stigmata")
print(ret, msg)
ret, msg = coroutine.resume(co, "delirium")
print(ret, msg)
ret, msg = coroutine.resume(co, "ecstasy")
print(ret, msg)

return output
