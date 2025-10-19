import express from 'express';
import { redis } from '../redis/redis.js'
import { getScriptKeyName } from '../utils.js'
import MarkdownIt from 'markdown-it';

const router = express.Router();

router.get('/:filename', async (req, res) => {
  const { filename } = req.params;

  if (!filename.toLowerCase().endsWith('.md')) {
    return res.status(400).send('Invalid file type. Only .md files are allowed.');
  }

  const key = getScriptKeyName(filename);
  //console.log('key =', key)
  try {
    const md = new MarkdownIt({
        html: true,
        linkify: true,
        typographer: true
      });
    const markdown = await redis.hGet(key, 'code');

    if (!markdown) {
      return res.status(404).send('Markdown file not found in Redis');
    }

    const renderedHTML = md.render(markdown);
    const fullPage = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>${filename}</title>
        <style>
            body {
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
                background-color:rgb(0, 0, 0);
                color: #000000; /* Pure black text */
                padding: 2rem;
                max-width: 980px;
                margin: auto;
                font-size: 18px;
                line-height: 1.6;
                -webkit-font-smoothing: none;
                -moz-osx-font-smoothing: grayscale;
                text-rendering: optimizeSpeed;
            }
            h1, h2, h3, h4 {
                font-weight: 600;
                margin-top: 2rem;
                margin-bottom: 1rem;
                border-bottom: 1px solid #d0d7de;
                padding-bottom: 0.3em;
                color: #000000;
            }
            p {
                margin: 1rem 0;
            }
            ul, ol {
                margin: 1rem 0;
                padding-left: 2rem;
            }
            li {
                margin: 0.5rem 0;
            }
            pre {
            background-color:rgb(0, 0, 0);
            border: 1px solid:rgb(0, 0, 0);
            border-radius: 6px;
            padding: 1rem;
            overflow-x: auto;
            font-family: SFMono-Regular, Consolas, "Liberation Mono", Menlo, monospace;
            font-size: 16px;
            line-height: 1.45;
            color: #000000;
            text-align: left;         /* 👈 Ensures left alignment */
            white-space: pre-wrap;    /* 👈 Wrap long lines if needed */
            }
            code {
            background-color: rgba(27,31,35,0.07);
            padding: 0.2em 0.4em;
            border-radius: 3px;
            font-size: 95%;
            font-family: SFMono-Regular, Consolas, "Liberation Mono", Menlo, monospace;
            color: #000000;
            text-align: left;         /* 👈 Ensures inline code stays left-aligned */
            }
            blockquote {
                margin: 1rem 0;
                padding-left: 1rem;
                border-left: 0.25em solid #d0d7de;
                color: #000000;
            }
            a {
                color: #0366d6;
                text-decoration: none;
            }
            a:hover {
                text-decoration: underline;
            }
            hr {
                border: none;
                border-top: 1px solid #d0d7de;
                margin: 2rem 0;
            }
        </style>
        </head>
        <body>
            ${renderedHTML}
        </body>
        </html>
    `;
    res.set('Content-Type', 'text/html; charset=utf-8');
    res.send(fullPage);
  } catch (err) {
    console.error('Error rendering markdown:', err);
    res.status(500).send('Server error');
  }
});

export default router;