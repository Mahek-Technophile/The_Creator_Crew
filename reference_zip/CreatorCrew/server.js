// The Creator Crew - tiny static server for Node.js (no packages needed).
// Usage: node server.js [port]   (default 8080)
const http = require('http'), fs = require('fs'), path = require('path'), os = require('os');
const PORT = parseInt(process.argv[2] || '8080', 10);
const ROOT = __dirname;
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.json': 'application/json', '.ico': 'image/x-icon' };

http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0].split('#')[0]);
  let base = path.join(ROOT, 'ui'), rel = p;
  if (p === '/docs' || p.startsWith('/docs/')) { base = path.join(ROOT, 'docs'); rel = p.slice(5); }
  let file = path.normalize(path.join(base, rel));
  if (!file.startsWith(base)) { res.writeHead(403); return res.end('Forbidden'); }
  if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, rel.endsWith('/') || rel === '' ? 'index.html' : 'index.html');
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404); return res.end('Not found'); }
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(file).toLowerCase()] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    res.end(data);
  });
}).listen(PORT, '0.0.0.0', () => {
  let ip = '127.0.0.1';
  for (const list of Object.values(os.networkInterfaces()))
    for (const n of list) if (n.family === 'IPv4' && !n.internal) { ip = n.address; break; }
  console.log('\n  The Creator Crew is running\n');
  console.log('  On this PC:        http://localhost:' + PORT);
  console.log('  On your network:   http://' + ip + ':' + PORT + '   <- open this on your phone / other devices');
  console.log('  Design document:   http://' + ip + ':' + PORT + '/docs/HLD.html');
  console.log('\n  Press Ctrl+C to stop.\n');
});
