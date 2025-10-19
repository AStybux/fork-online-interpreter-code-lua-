local ret, msg, joblist, output = true, '', 'prodcons:joblist', {} 
local timestamp = unpack(redis.call('TIME'))
math.randomseed(tonumber(timestamp))

local function producer() 
	while true do
		local n = math.random(1, 10)
		for j=1, n do 
			redis.call('LPUSH', joblist, math.random(1, 9999))
		end 
		coroutine.yield(n)
	end 
end 
local function consumer() 
	while true do
		local n = math.random(1, 15)
		for j=1, n do 
			local val = redis.call('RPOP', joblist)
			if (val == false) then 
				coroutine.yield((j-1)..'/'..n)
				n = 0
				break
			end
		end 
		if n~=0 then 
			coroutine.yield(n)
		end
	end 
end 
local function print(m) 
	table.insert(output, m)
end 

local coprod = coroutine.create(producer)
local cocons = coroutine.create(consumer)

print('initial len = '..redis.call('LLEN', joblist))
for i=1, 10 do 
	ret, msg = coroutine.resume(coprod) 
	print(' ret ='..tostring(ret)..', produced = '..msg)
	print(' len = '..redis.call('LLEN', joblist))
	ret, msg = coroutine.resume(cocons) 
	print(' ret ='..tostring(ret)..', consumed = '..msg)
    print(' len = '..redis.call('LLEN', joblist))
end

return output