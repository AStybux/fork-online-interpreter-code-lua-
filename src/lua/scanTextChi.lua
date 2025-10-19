--[[
    Return Redis hashes matching a pattern and has a field which contains a value,
    Parameters:
        KEYS[1] - Key pattern to scan for, "documents:*" for example;
        KEYS[2] - Field name to check for, "textChi" for example;
        KEYS[3] - Value to to check for, "韓非子" for example; 
        KEYS[4] - Number of documents to skip, 0 if unspecified; 
        KEYS[5] - Maximum number of documents to return, 10 if unspecified; 
        ARGV[]  - Fields to return, ["id", "textChi", "visited"] for example, 
                  Return all fields if unspecified.
]]

local keyPrefix = KEYS[1]
local fieldName = KEYS[2]
local checkValue = KEYS[3]
local offset = tonumber(KEYS[4]) or 0
local limit = tonumber(KEYS[5]) or 10

local cursor = "0"  -- the cursor.
local matched = {}  -- result to be returned 
local index = 1     -- index to place retrieved value

repeat
local scan = redis.call("SCAN", cursor, "MATCH", keyPrefix, "COUNT", 100)
-- "scan" returns [ cursor, keys ]
cursor = scan[1]
local keys = scan[2]

for _, key in ipairs(keys) do
    -- Get the field value to inspect 
    local text = redis.call("HGET", key, fieldName)
    
    -- If found and contains the value
    -- if (text) and (string.find(text, checkValue)) then 
    if (text) and (string.find(string.lower(text), string.lower(checkValue))) then 
    -- Skip offset 
    if offset > 0 then 
        offset = offset - 1
    else 
        -- Take limit 
        if limit > 0 then 
        -- If no field names specified to return 
        if (ARGV[1] or "*") == "*" then
            matched[index] = redis.call("HGETALL", key)
        else        
            matched[index] = redis.call("HMGET", key, unpack(ARGV))
        end

        -- Increase the index 
        index = index + 1
        -- Decrease the limit
        limit = limit - 1
        else 
        -- Readhed limit before scan completed
        return matched
        end 
    end 
    end 
end
until (cursor == "0") -- Loop until no more keys found

-- Scan completed
return matched
