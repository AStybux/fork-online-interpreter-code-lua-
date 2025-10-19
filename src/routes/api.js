// routes/api.js
import express from 'express';
import { redis } from '../redis/redis.js'
import MarkdownIt from 'markdown-it';
import { getScriptKeyName, getLastEditKey, objectToString, mySplit, countWords, countLines } from '../utils.js';

const router = express.Router();

// Get available scripts names and last edit
// scan 0 MATCH OLI:scripts:* COUNT 100 TYPE HASH
// GET OLI:lastEdit
router.get('/scripts', async (req, res) => {
  let cursor = '0';
  let keys = [];
  const scripts = [];

  do {
    // Returns [ cursor, keys ] in RESP2
    // Returns { cursor, keys } in RESP3
    const result = await redis.scan(cursor, {
      MATCH: getScriptKeyName(),
      COUNT: 100,
      TYPE: 'hash'
    });
    // Note the difference...

    cursor = result.cursor
    keys = result.keys 

    scripts.push(...keys);
  } while (cursor !== '0');

  // check existence
  const lastEdit = await redis.get(getLastEditKey())
  const exists = await redis.exists(getScriptKeyName(lastEdit))

  return res.status(200).json({
    success: true, 
    scripts: scripts.map(script => script.split(':')[2]),
    lastEdit: exists ? lastEdit: ''
  })
})

// Load a script 
router.get('/load', async (req, res) => {
  const scriptName = req.query.name;

  //console.log('LOAD, scriptName =', scriptName)
  if (!scriptName) {
    return res.status(400).json({
      success: false,
      message: 'Missing script name'
    });
  }

  const code = await redis.hGet(getScriptKeyName(scriptName), 'code')
  return res.json({
      success: true,
      code,
      message: `${scriptName} loaded, ${countWords(code)} words in ${countLines(code)} lines.`
  });
});

// Save a script
router.put('/save', async (req, res) => {
  const scriptName = req.body.name;
  const code = req.body.code;

  const now = new Date(); 
  const isoDate = now.toISOString(); 

  //console.log('SAVE, scriptName =', scriptName)
  if (!scriptName || !code ) {
    return res.status(400).json({
      success: false,
      message: 'Missing Script name and/or code'
    });
  }

  // check existence 
  const exists = await redis.exists(getScriptKeyName(scriptName))
  if (! exists ) {
      // Create
      await redis.multi()
          .hSet(getScriptKeyName(scriptName), { 
            name: scriptName, 
            code,
            createdAt: isoDate,
            updateIdent: 0
          })
          .set(getLastEditKey(), scriptName)
          .exec()

      return res.json({
      success: true,
      message: `${scriptName} created`
    });    
  } else {
      // Update 
      await redis.multi()
          .hSet(getScriptKeyName(scriptName), { 
            code,
            updatedAt: isoDate,
          })
          .hIncrBy(getScriptKeyName(scriptName), 'updateIdent', 1)
          .set(getLastEditKey(), scriptName)
          .exec()

      return res.json({
      success: true,
      message: `${scriptName} saved, ${countWords(code)} words in ${countLines(code)} lines.`
    });    
  }
});

// Delete a script
router.delete('/delete', async (req, res) => {
  const scriptName = req.query.name;

  //console.log('DELETE, scriptName =', scriptName)
  if (!scriptName ) {
    return res.status(400).json({
      success: false,
      message: 'Missing Script name'
    });
  }

  await redis.del(getScriptKeyName(scriptName))

  return res.json({
      success: true,
      message: `${scriptName} deleted`
    });
  });

// EVAL a script
router.post('/eval', async (req, res) => {
  const keys = req.body.keys;
  const argv = req.body.argv;
  const code = req.body.code;
  const scriptName = req.body.name;

  console.log('EVAL, scriptName =', scriptName)
  if (!scriptName || !code ) {
    return res.status(400).json({
      success: false,
      message: 'Missing Script name and/or code'
    });
  }

  let output = ""
  let success = true
  const start = Date.now();

  // Multi-format support
  if (scriptName.endsWith('.lua')) {
      try {
        output = await redis.eval(code, 
          { keys: keys ? mySplit(keys) : [ ], 
            arguments: argv ? mySplit(argv) : [ ] 
          })
        
        // In case RESP3 is enabled. 
        output = objectToString(output)
      } catch (err) {
        output = err.toString()
        success = false
      }
  } else if (scriptName.endsWith('.md')) {
    const md = new MarkdownIt({
        html: true,
        linkify: true,
        typographer: true
      });
      output = md.render(code);
  } else {
      // Leave it as it is...
      output = code 
  }
  const duration = Date.now() - start;

  return res.json({
      success,
      lastEdit: scriptName, 
      code, 
      output,
      meta: {
        time: duration + ' ms',
        timestamp: new Date().toISOString()
      }  
    });
  });

router.get('/runtime', async (req, res) => {
    const output = await redis.eval(inspectorScript); // Your interpreter logic
    res.json(output);
  });

// https://dev.fandom.com/wiki/Lua_reference_manual/Standard_libraries#pairs
// https://dev.fandom.com/wiki/Lua_reference_manual/Standard_libraries#table.insert

// https://redis.io/docs/latest/develop/programmability/lua-api/#:~:text=redis.setresp
// https://redis.io/docs/latest/develop/programmability/lua-api/#:~:text=redis.setresp

const inspectorScript = `
      local libs = { redis=true, struct=true, cjson=true, cmsgpack=true, bitop=true, bit=true }
      local fandomUrl = 'https://dev.fandom.com/wiki/Lua_reference_manual/Standard_libraries#'
      local redisUrl = 'https://redis.io/docs/latest/develop/programmability/lua-api/#:~:text='
      local coroutineUrl = 'https://www.lua.org/manual/5.1/manual.html#5.2/#:~:text='
      local result = {}

      local function countTable(tbl)
        local count = 0
        for _ in pairs(tbl) do
          count = count + 1
        end
        return count
      end

      local function makeLink(lib, keyword)
        if lib == "coroutine" then 
          return "<a href='"..coroutineUrl..keyword.."' target=_blank>"..keyword.."</a>"
        elseif libs[lib] then 
          return "<a href='"..redisUrl..keyword.."' target=_blank>"..keyword.."</a>"
        else 
          return "<a href='"..fandomUrl..keyword.."' target=_blank>"..keyword.."</a>"
        end 
      end 

      local function addEntry(lib, key, value, indent) 
        local t = type(value)
        local fullKey = key
        if (lib) then 
          fullKey = lib.."."..key
        end 

        if t == "string" then 
          table.insert(result, string.rep("\t", indent)..t.." "..fullKey.." = '"..value.."'") 
        elseif t == "number" then 
          table.insert(result, string.rep("\t", indent)..t.." "..fullKey.." = "..tostring(value)) 
        elseif t == "function" then 
          table.insert(result, string.rep("\t", indent)..t.." "..makeLink(lib, fullKey)) 
        elseif t == "table" then 
          if indent == 0 then
            table.insert(result, string.rep("\t", indent)..t.." <strong>"..fullKey.."</strong> ["..countTable(value).."]")        
          else 
            table.insert(result, string.rep("\t", indent)..t.." "..fullKey.." ["..countTable(value).."]")        
          end 
        else
          table.insert(result, string.rep("\t", indent).."type = "..t..", lib = "..lib..", key = "..key..", value = "..tostring(value)) 
        end 
      end 

      --[[ 
          main 
      ]]
      -- string and number
      for k, v in pairs(_G) do
        local t = type(v)

        if t=="string" or t=="number" then 
          addEntry(nil, k, v, 0)
        end 
      end

      -- function
      for k, v in pairs(_G) do
        local t = type(v)

        if t=="function" then 
          addEntry(nil, k, v, 0)
        end 
      end

      -- table
      for k, v in pairs(_G) do
        local t = type(v)

        if t=="table" and k ~="_G" then 
          addEntry(nil, k, v, 0)

          for k1, v1 in pairs(v) do 
            local t1 = type(v1)

            if k1 ~= "__index" then
              addEntry(k, k1, v1, 1)
              -- table within table... 
              if t1=="table" then
                for k2, v2 in pairs(v1) do 
                  addEntry(k.."."..k1, k2, v2, 2)
                end
              end 
            end

          end 
        end 
      end

      return result
    `;  

export default router;

/*
  const inspectorScript = `
      local libs = { redis=true, struct=true, cjson=true, cmsgpack=true, bitop=true, bit=true }
      local fandomUrl = 'https://dev.fandom.com/wiki/Lua_reference_manual/Standard_libraries#'
      local redisUrl = 'https://redis.io/docs/latest/develop/programmability/lua-api/#:~:text='
      local coroutineUrl = 'https://www.lua.org/manual/5.1/manual.html#5.2/#:~:text='
      local result = {}

      local function countTable(tbl)
        local count = 0
        for _ in pairs(tbl) do
          count = count + 1
        end
        return count
      end

      local function makeLink(lib, keyword)
        if lib == "coroutine" then 
          return "<a href='"..coroutineUrl..keyword.."' target=_blank>"..keyword.."</a>"
        elseif libs[lib] then 
          return "<a href='"..redisUrl..keyword.."' target=_blank>"..keyword.."</a>"
        else 
          return "<a href='"..fandomUrl..keyword.."' target=_blank>"..keyword.."</a>"
        end 
      end 

      -- string and number
      for k, v in pairs(_G) do
        local t = type(v)
        if t=="string" then 
          table.insert(result, t.." "..k.." = '"..v.."'") 
        elseif t=="number" then 
          table.insert(result, t.." "..k.." = "..tostring(v)) 
        end 
      end

      -- function
      for k, v in pairs(_G) do
        local t = type(v)
        if t=="function" then 
          table.insert(result, t.." "..makeLink('', k)) 
        end 
      end

      -- table
      for k, v in pairs(_G) do
        local t = type(v)
        if t=="table" and k ~="_G" then 
          table.insert(result, t .. " <strong>" ..k.."</strong> ["..countTable(v).."]")

          for k2, v2 in pairs(v) do 
            local t2 = type(v2)
            if t2 == "function" then 
              table.insert(result, "\t"..t2.." "..makeLink(k, k.."."..k2)) 
            elseif t2 == "table" then 
              table.insert(result, "\t"..k2 .. " : " .. t2.." ["..countTable(v2).."]")
            elseif t2 == "string" then 
              table.insert(result, "\t"..t2.." "..k.."."..k2.." = '"..v2.."'") 
            elseif t2 == "number" then 
              table.insert(result, "\t"..t2.." "..k.."."..k2.." = "..tostring(v2)) 
            else
              table.insert(result, "\ttype = "..t2..", key = "..k2..", value = "..tostring(v2)) 
            end 
          end 
        end 
      end
      return result
    `;  
*/