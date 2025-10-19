
const nameSpace = 'OLI:'

export function getScriptKeyName(id = '*')
{
    return `${nameSpace}scripts:${id}`
}

export function getLastEditKey() {
    return `${nameSpace}lastEdit`
}

export function getImageKeyName(id)
{
    return `${nameSpace}images:${id}`
}

export function objectToString(obj) {
    if (
      typeof obj === 'object' &&
      obj !== null &&
      !Array.isArray(obj)
    ) {
      return `{ ${Object.entries(obj)
        .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
        .join(', ')} }`;
    } else {
      return String(obj);
    }
  }

export function mySplit(input) {
    const result = [];
    let i = 0;
    const len = input.length;
  
    while (i < len) {
      // Skip leading whitespace
      while (i < len && /\s/.test(input[i])) i++;
  
      if (i >= len) break;
  
      let char = input[i];
  
      // Handle quoted strings
      if (char === '"' || char === "'") {
        const quote = char;
        i++;
        let start = i;
        while (i < len && input[i] !== quote) i++;
        result.push(input.slice(start, i));
        i++; // Skip closing quote
      } else {
        // Handle unquoted tokens
        let start = i;
        while (i < len && !/\s/.test(input[i])) i++;
        result.push(input.slice(start, i));
      }
    }
  
    return result;
}

// Utility: Extract and normalize client IP
export function getClientIp(req) {
  const rawIp =
    req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    req.connection?.remoteAddress ||
    req.socket?.remoteAddress ||
    req.connection?.socket?.remoteAddress ||
    'unknown';

  if (rawIp === '::1') return '127.0.0.1';
  if (rawIp.startsWith('::ffff:')) return rawIp.replace('::ffff:', '');
  return rawIp;
}

export function countLines(str) {
  if (!str) return 0;
  return str.split(/\r\n|\r|\n/).length;
}

export function countWords(str) {
  if (!str) return 0;
  return str
    .split(/\s+/)           // Split by any whitespace (spaces, tabs, newlines)
    .filter(Boolean)        // Remove empty strings
    .length;
}

/*
HSET OLI:scripts:init.lua code "return 'Hello Lua'" updatedAt "2025-08-12 11:02:01.769" updateIdent 0 
HSET OLI:scripts:do_this.lua code "return 'Hello Lua'" updatedAt "2025-08-12 11:02:01.769" updateIdent 0 
HSET OLI:scripts:do_that.lua code "return 'Hello Lua'" updatedAt "2025-08-12 11:02:01.769" updateIdent 0 
HSET OLI:scripts:do_nothing.lua code "return 'Hello Lua'" updatedAt "2025-08-12 11:02:01.769" updateIdent 0 

SET OLI:lastEdit init.lua
*/