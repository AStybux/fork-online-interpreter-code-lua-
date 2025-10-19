import { redis } from './redis/redis.js'
import { readFile } from 'fs/promises';

/*
   main 
*/
await redis.connect();

// Load Lua function from file
const luaScript = await readFile('./src/lua/findLib.lua', 'utf8');
console.log(await redis.sendCommand(['FUNCTION', 'LOAD', 'REPLACE', luaScript]), 'loaded');

await redis.close();
process.exit(0)
