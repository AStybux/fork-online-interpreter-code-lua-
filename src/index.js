// app.js
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cookieParser from 'cookie-parser';
import indexRouter from './routes/index.js';
import apiRouter from './routes/api.js';
import imgRoute from './routes/imgroute.js';
import mdRoute from './routes/mdroute.js';
import { redis } from './redis/redis.js'

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

app.use('/', indexRouter);
app.use('/', mdRoute);
app.use('/api/v1', apiRouter);
app.use('/img', imgRoute);

// Start server
const HOST = process.env.HOST || 'localhost';
const PORT = process.env.PORT || 3000;
const RESP = process.env.RESP || '2';

await redis.connect()
await redis.sendCommand(['HELLO', RESP])

app.listen(PORT, () => {
  console.log(`Server running at http://${HOST}:${PORT}${ RESP==='3'? ', RESP3 is enabled' : ''}`);
} ).on('error', (error) => {
  throw new Error(error.message)
} );

process.on('SIGINT', async () => {
  await redis.close()
  console.log('Caught Ctrl+C (SIGINT). Cleaning up...');
  // Perform cleanup here (e.g., close DB, stop server)
  process.exit(0); // Exit gracefully
});
