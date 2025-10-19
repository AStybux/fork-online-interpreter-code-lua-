import 'dotenv/config'
import { createClient } from 'redis'

const redis = createClient({ 
        socket: {
            port: process.env.REDIS_PORT,       // Redis port
            host: process.env.REDIS_HOST,       // Redis host    
            tls: false
        }, 
        username: process.env.REDIS_USERNAME,   // Redis user
        password: process.env.REDIS_PASSWORD,   // Redis password 

        reconnectStrategy: (retries, cause) => {
          // By default, do not reconnect on socket timeout.
          if (cause instanceof SocketTimeoutError) {
            return false;
          }
  
          // Generate a random jitter between 0 – 200 ms:
          const jitter = Math.floor(Math.random() * 200);
          // Delay is an exponential back off, (times^2) * 50 ms, with a maximum value of 2000 ms:
          const delay = Math.min(Math.pow(2, retries) * 50, 2000);
  
          return delay + jitter;
      }
    })

redis.on('connect', () => {
  console.log('Redis client connected');
});

redis.on('reconnecting', (delay) => {
  console.log(`Redis client reconnecting in ${delay} ms`);
});

redis.on('ready', () => {
  console.log('Redis client is ready to use');
});

redis.on('end', () => {
  console.log('Redis connection closed');
});

redis.on('error', (err) => {
  console.error('Redis error:', err);
});

export { redis }