-- Remove a value in 'prefix:data:<key>' key format and 
-- remove the key from tag set(s) in 'prefix:tag:<tag>' key format
-- @param KEYS[1] (string) The prefix 
-- @param KEYS[2] (string) The key
-- @param ARGV[1]~ARGV[n] (string) The tag(s)
-- @return (number) The number of successful SREM operation(s)

local key = KEYS[1]..'data:'..KEYS[2] 

-- del the value 
redis.call('DEL', key)

-- iterate through each tag(s) and add key to set
local result = 0
for i = 1, #ARGV do
    result = result + redis.call('SREM', KEYS[1]..'tag:'..ARGV[i], key)
end

return result