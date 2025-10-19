-- Invalidate tag(s)
-- @param KEYS[1] (string) The prefix 
-- @param ARGV[1]~ARGV[n] (string) The tag(s)
-- @return (number) The number of successful DEL operation(s)

local result = nil
local cursor = "0"
local members = nil
local cnt = 0

-- iterate through each tag set(s)
for _, value in pairs(ARGV) do
    -- iterate through each member of individual set via SSCAN
    repeat
        result = redis.call("SSCAN", KEYS[1]..'tag:'..value, cursor)
        cursor = result[1]  -- prepare for next SSCAN operation 
        members = result[2] -- members returned so far 
        
        -- iterate through each member of in members 
        for _, member in pairs(members) do
            -- DEL a stored value
            cnt = cnt + redis.call('DEL', member) 
        end
    until cursor == "0"

    -- DEL the tag set
    cnt = cnt + redis.call('DEL', KEYS[1]..'tag:'..value) 
end

return cnt