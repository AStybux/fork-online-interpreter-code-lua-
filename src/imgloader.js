// imgloader.js
import fs from 'fs/promises';
import path from 'path';
import { performance } from 'perf_hooks';
import { redis } from './redis/redis.js'
import { getImageKeyName } from './utils.js'

const DEFAULT_DIR = './img';
const BATCH_SIZE = 10;

const getImageFiles = async (dir) => {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  return entries
    .filter(file => file.isFile())
    .filter(file => /\.(jpg|jpeg|png|gif|bmp)$/i.test(file.name))
    .map(file => path.join(dir, file.name));
};

const getTotalSize = async (files) => {
  const stats = await Promise.all(files.map(f => fs.stat(f)));
  return stats.reduce((sum, stat) => sum + stat.size, 0);
};

const uploadBatch = async (files) => {
  for (const filePath of files) {
    const fileName = path.basename(filePath);
    const key = getImageKeyName(fileName)
    const data = await fs.readFile(filePath);
    await redis.set(key, data.toString('base64'));
  }
};

const uploadImages = async (dir = DEFAULT_DIR) => {
  const start = performance.now();

  const files = await getImageFiles(dir);
  const totalSize = await getTotalSize(files);
  console.log(`Found ${files.length} image(s) in ${dir} folder, total size: ${(totalSize / 1024 / 1024).toFixed(2)} MB, batch size: ${BATCH_SIZE} `);

  for (let i = 0; i < files.length; i += BATCH_SIZE) {
    const batch = files.slice(i, i + BATCH_SIZE);
    await uploadBatch(batch);
    console.log(`Uploaded batch ${i / BATCH_SIZE + 1}`);
  }

  const end = performance.now();
  console.log(`Upload completed in ${(end - start).toFixed(2)} ms`);
};

/*
   main 
*/
const folderArg = process.argv[2];

await redis.connect();
await uploadImages(folderArg);

await redis.close();
process.exit(0); // Exit gracefully
