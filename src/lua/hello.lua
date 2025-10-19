--[[
	Small script to return "hello, lua"
	Parameters: None
]]

return redis.status_reply("hello, lua")
