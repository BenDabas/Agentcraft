/**
 * Dev server. `node serve.mjs [port] [--no-open]`
 *
 * The site is plain static files, so this exists only because browsers restrict
 * some behaviour on file:// URLs (the web manifest, mainly). Nothing here is
 * needed in production — deploy the folder to any static host as-is.
 *
 * Opens the default browser on start unless --no-open is passed or $CI is set.
 */
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize, resolve } from 'node:path';
import { exec } from 'node:child_process';

const root = resolve(import.meta.dirname);
const args = process.argv.slice(2).filter((a) => a !== '--no-open');
const port = Number(args[0]) || 4300;
const shouldOpen = !process.argv.includes('--no-open') && !process.env.CI;

function openBrowser(url) {
  const cmd =
    process.platform === 'win32'
      ? `start "" "${url}"`
      : process.platform === 'darwin'
        ? `open "${url}"`
        : `xdg-open "${url}"`;
  exec(cmd, (err) => {
    if (err) console.log(`(couldn't auto-open a browser — open ${url} manually)`);
  });
}

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
};

createServer(async (req, res) => {
  try {
    let rel = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    if (rel.endsWith('/')) rel += 'index.html';

    // Contain the path inside the project root.
    const file = join(root, normalize(rel).replace(/^([/\\])+/, ''));
    if (!file.startsWith(root)) {
      res.writeHead(403).end('Forbidden');
      return;
    }

    const info = await stat(file);
    const target = info.isDirectory() ? join(file, 'index.html') : file;
    const body = await readFile(target);

    res.writeHead(200, {
      'Content-Type': TYPES[extname(target)] || 'application/octet-stream',
      'Cache-Control': 'no-cache',
    });
    res.end(body);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end('<h1>404</h1><p><a href="/index.html">Agentcraft</a></p>');
  }
}).listen(port, () => {
  const url = `http://localhost:${port}/`;
  console.log(`Agentcraft → ${url}`);
  if (shouldOpen) openBrowser(url);
});
