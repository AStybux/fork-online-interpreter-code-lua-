-- Operator precedence and associativity
local precedence = {
    ["not"] = { prec = 3, assoc = "right" },
    ["="]   = { prec = 2, assoc = "left" },
    ["<>"]  = { prec = 2, assoc = "left" },
    [">="]  = { prec = 2, assoc = "left" },
    ["<="]  = { prec = 2, assoc = "left" },
    ["and"] = { prec = 1, assoc = "left" },
    ["or"]  = { prec = 1, assoc = "left" },
    ["+"]   = {prec = 5, assoc = "left"},
    ["-"]   = {prec = 5, assoc = "left"},
    ["*"]   = {prec = 6, assoc = "left"},
    ["/"]   = {prec = 6, assoc = "left"}
  }
  
  -- Tokenizer: splits expression into tokens
  local function tokenize(expr)
      local tokens = {}
      local i = 1
      local len = #expr
    
      local function peek(n)
        return expr:sub(i, i + (n or 0))
      end
    
      local function advance(n)
        i = i + (n or 1)
      end
    
      local function skip_whitespace()
        while i <= len and expr:sub(i, i):match("%s") do
          advance()
        end
      end
    
      while i <= len do
        skip_whitespace()
        local c = peek()
    
        -- Parentheses
        if c == "(" or c == ")" then
          table.insert(tokens, c)
          advance()
    
        -- Multi-char comparison operators
        elseif peek(1) == ">=" or peek(1) == "<=" or peek(1) == "<>" then
          table.insert(tokens, peek(1))
          advance(2)
    
        -- Single-char comparison or arithmetic operators
        elseif c == "=" or c == "<" or c == ">" or c == "+" or c == "-" or c == "*" or c == "/" then
          table.insert(tokens, c)
          advance()
    
        -- Quoted strings
        elseif c == "'" or c == '"' then
          local quote = c
          local j = i + 1
          while j <= len and expr:sub(j, j) ~= quote do
            j = j + 1
          end
          local str = expr:sub(i, j)
          table.insert(tokens, str)
          i = j + 1
    
        -- Identifiers and keywords
        elseif c:match("[%w_]") then
          local j = i
          while j <= len and expr:sub(j, j):match("[%w_]") do
            j = j + 1
          end
          local word = expr:sub(i, j - 1)
          table.insert(tokens, word)
          i = j
    
        else
          -- Unknown character, skip
          advance()
        end
      end
    
      return tokens
    end
  
  -- Infix to RPN using Shunting Yard algorithm
  local function infix_to_rpn(expr_str)
    local output, stack = {}, {}
    local tokens = tokenize(expr_str)
  
    for _, token in ipairs(tokens) do
      if token == "(" then
        table.insert(stack, token)
      elseif token == ")" then
        while #stack > 0 and stack[#stack] ~= "(" do
          table.insert(output, table.remove(stack))
        end
        table.remove(stack) -- remove "("
      elseif precedence[token] then
        while #stack > 0 do
          local top = stack[#stack]
          local p1 = precedence[token]
          local p2 = precedence[top]
          if p2 and ((p1.assoc == "left" and p1.prec <= p2.prec) or
                     (p1.assoc == "right" and p1.prec < p2.prec)) then
            table.insert(output, table.remove(stack))
          else
            break
          end
        end
        table.insert(stack, token)
      else
        table.insert(output, token)
      end
    end
  
    while #stack > 0 do
      table.insert(output, table.remove(stack))
    end
  
    return output
  end
  
  -- Utility: strip quotes from string
  local function stripQuotes(s)
    return s:match("^'(.*)'$") or s:match('^"(.*)"$') or s
  end
  
  -- Utility: convert to boolean
  local function toBoolean(v)
    if type(v) == "string" then
      return v ~= "" and v ~= "false"
    end
    return not not v
  end
  
  -- RPN evaluator
  local function evaluate_rpn(record, expr_table)
    local stack = {}
    
    for _, token in ipairs(expr_table) do
      if token == "=" then
        local b = stripQuotes(table.remove(stack))
        local a = table.remove(stack)
        table.insert(stack, tostring(record[a]) == b)
  
      elseif token == "<>" then
        local b = stripQuotes(table.remove(stack))
        local a = table.remove(stack)
        table.insert(stack, tostring(record[a]) ~= b)
  
      elseif token == ">=" then
        local b = tonumber(stripQuotes(table.remove(stack)))
        local a = tonumber(record[table.remove(stack)])
        table.insert(stack, a >= b)
  
      elseif token == "<=" then
        local b = tonumber(stripQuotes(table.remove(stack)))
        local a = tonumber(record[table.remove(stack)])
        table.insert(stack, a <= b)
  
      elseif token == "and" then
        local b = toBoolean(table.remove(stack))
        local a = toBoolean(table.remove(stack))
        table.insert(stack, a and b)
  
      elseif token == "or" then
        local b = toBoolean(table.remove(stack))
        local a = toBoolean(table.remove(stack))
        table.insert(stack, a or b)
  
      elseif token == "not" then
        local a = toBoolean(table.remove(stack))
        table.insert(stack, not a)
  
      elseif token == "+" then
        local b = tonumber(table.remove(stack))
        local a = tonumber(table.remove(stack))
        table.insert(stack, a + b)
  
      elseif token == "-" then
        local b = tonumber(table.remove(stack))
        local a = tonumber(table.remove(stack))
        table.insert(stack, a - b)
  
      elseif token == "*" then
        local b = tonumber(table.remove(stack))
        local a = tonumber(table.remove(stack))
        table.insert(stack, a * b)
  
      elseif token == "/" then
        local b = tonumber(table.remove(stack))
        local a = tonumber(table.remove(stack))
        table.insert(stack, a / b)
  
      else
        -- Push raw token (could be a literal or a key)
        table.insert(stack, token)
      end
    end
  
    return toBoolean(stack[1])
  end
  
-- main 
local row = {
    id = 42,
    name = "alberto",
    role = "admin", 
    email = "abc@mail.com",
    status = 'active', 
    updatedAt = "",
    createdAt = "2025-08-20",
    updateIdent = 0
}
  
local expr1 = "(role='admin' and updatedAt<>'') or (name='alberto')"
local expr2 = "id=50 or name='albert'"
local expr3 = "id>=40 and id<=50"
  
return evaluate_rpn(row, infix_to_rpn(expr1))