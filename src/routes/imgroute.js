import express from 'express';
import path from 'path';
import { redis } from '../redis/redis.js'
import { getImageKeyName } from '../utils.js'

const router = express.Router();

router.get('/:filename', async (req, res) => {
  const { filename } = req.params;
  const key = getImageKeyName(filename);

  try {
    const base64Data = await redis.get(key);

    if (!base64Data) {
      return res.status(404).send('Image not found in Redis');
    }

    const ext = path.extname(filename).toLowerCase();
    const mimeTypes = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.bmp': 'image/bmp'
    };
    const contentType = mimeTypes[ext] || 'application/octet-stream';

    const buffer = Buffer.from(base64Data, 'base64');
    res.set('Content-Type', contentType);
    res.send(buffer);
  } catch (err) {
    console.error('Error retrieving image:', err);
    res.status(500).send('Server error');
  }
});

export default router;