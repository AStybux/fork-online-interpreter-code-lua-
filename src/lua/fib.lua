--[[
	fib demo
]]

local number = tonumber(ARGV[1]) or 10

local function fib(n)
  local t = {}
  local a, b = 0, 1

  for i = 1, n do
    t[i] = a
    a, b = b, a + b
  end

  return t
end

return fib(number)
