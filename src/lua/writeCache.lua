-- Store a value in 'prefix:data:<key>' key format and 
-- add the key to tag set(s) in 'prefix:tag:<tag>' key format
-- @param KEYS[1] (string) The prefix 
-- @param KEYS[2] (string) The key
-- @param KEYS[3] (string) The TTL
-- @param ARGV[1] (string) The value
-- @param ARGV[2]~ARGV[n] (string) The tag(s)
-- @return (number) The number of successful SADD operation(s)

local key = KEYS[1]..'data:'..KEYS[2] 
local ttl = tonumber(KEYS[3], 10)
local value = ARGV[1]

-- check TTL 
assert (type(ttl) == 'number', "Invalid TTL in 'writeCache'")

-- store the value 
local result1 = nil
if ttl==-1 then
    result1 = redis.call('SET', key, value)
else
    result1 = redis.call('SET', key, value, 'EX', tostring(ttl))
end
assert (result1.ok == 'OK', "Failed to SET in 'writeCache'")

-- iterate through each tag(s) and add key to set
local result2 = 0
for i = 2, #ARGV do
    result2 = result2 + redis.call('SADD', KEYS[1]..'tag:'..ARGV[i], key)
end

return result2