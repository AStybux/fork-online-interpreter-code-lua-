--[[
	Small script to seed database
	Parameters: None
]]

redis.call("HSET", "OLI:scripts:init.lua", "code", "return 'init'", "updatedAt", "2025-08-12 11:02:01.769", "updateIdent", "0" )

redis.call("HSET", "OLI:scripts:do_this.lua", "code", "return 'do this'", "updatedAt", "2025-08-12 11:02:01.769", "updateIdent", "0" )

redis.call("HSET", "OLI:scripts:do_that.lua", "code", "return 'do that'", "updatedAt", "2025-08-12 11:02:01.769", "updateIdent", "0" )

redis.call("HSET", "OLI:scripts:do_nothing.lua", "code", "return 'do nothing'", "updatedAt", "2025-08-12 11:02:01.769", "updateIdent", "0" )

return redis.status_reply('Ok')
