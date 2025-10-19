
-- Flush all object(s)
-- @param KEYS[1] (string) The prefix 
-- @return (number) The number of successful DEL operation(s)

local result = nil
local cnt = 0

-- iterate through all matched object(s) 
result = redis.call("KEYS", KEYS[1] .. '*');
for _, value in pairs(result) do
    cnt = cnt + redis.call("DEL", value);		
end

return cnt
