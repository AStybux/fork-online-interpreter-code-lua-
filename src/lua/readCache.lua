-- Retrieve a stored value in 'prefix:data:<key>' key format
-- @param KEYS[1] (string) The prefix 
-- @param KEYS[2] (string) The key
-- @return (string) The result of the GET operation.

local key = KEYS[1]..'data:'..KEYS[2] 
local value = redis.call('GET', key)

return value