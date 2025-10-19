--[[
	Small script to return Redis and Lua Version
	Parameters: None
]]

return 'Redis '..redis.REDIS_VERSION..' / '.._G["_VERSION"]