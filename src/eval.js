import { redis } from './redis/redis.js'

/*
   main 
*/
const script = `
    local reply = redis.pcall('ECHO', unpack(ARGV))
    if reply['err'] ~= nil then
    -- Handle the error sometime, but for now just log it
    redis.log(redis.LOG_WARNING, reply['err'])
    reply['err'] = 'ERR Something is wrong, but no worries, everything is under control'
    end
    return reply
`
await redis.connect()
await redis.sendCommand(['HELLO', '3'])

// console.log(await redis.eval(script, { keys: [], arguments: ["hello", "world"] }))

await redis.close()
process.exit(0)

/*
node:internal/modules/run_main:104
    triggerUncaughtException(
    ^

[SimpleError: ERR redis.log() requires two arguments or more. script: 9a81afe7c8515723aefe02c8e6f7e1a87be3d5f2, on @user_script:18.]
*/
const script2 = `
    -- array style table
    local table1 = { "iong_dev", "active" }
    -- Or explicitly specify the index
    -- local table1 = { [2] = "iong_dev", [1] = "active" }

    -- dictionary style table
    local table2 = { name = "iong_dev", status = "active" }

    local table3 = { 'name', 'iong_dev', 'status', 'active', 'age', 59 }

    local table4 = { name = "iong_dev", status = "active", 
                     [1]="berto_dev", [2]="inactive" } 
    
    local table5 = { ["name"] = "iong_dev", ["status"] = "active" }

    -- unpack() looks for numeric index starting from 1, which 
    -- doesn't exist in dictionary style table. 
    redis.log(redis.LOG_NOTICE, unpack(table1))
    -- will output: 'iong_dev active' in redis.log  

    -- A call to unpack(table2) return nil, nil     
    -- redis.log(redis.LOG_NOTICE, unpack(table2))
    -- results in an error. 

    redis.log(redis.LOG_NOTICE, cjson.encode(table1))
    -- will output: '["iong_dev","active"]' in redis.log

    redis.log(redis.LOG_NOTICE, cjson.encode(table2))
    -- will output: '{"name":"iong_dev","status":"active"}' in redis.log
    
    -- Similarly, array style table has length; 
    -- dictionary style table HAS NOT... 

    -- Set the 'myhash', effectively the same as: 
    -- HSET myhash name iong_dev status active age 59
    redis.call('HSET', 'myhash', unpack(table3))

    redis.log(redis.LOG_NOTICE, unpack(table4))
    redis.log(redis.LOG_NOTICE, #table4)

    redis.log(redis.LOG_NOTICE, unpack(table5))
    redis.log(redis.LOG_NOTICE, #table5)

    -- returns: [ 2, 0 ]
    -- return { #table1, #table2 }
    -- return { name = "iong_dev", status = "active" }
    redis.setresp(3)
    return { map={ name = "iong_dev", status = "active" } }
`