"""The Creator Crew - tiny static server (Python standard library only).
Serves the app on your network IP so you can open it from this PC, your phone, or any device on the same Wi-Fi.
Usage:  python server.py [port]        (default port 8080)
"""
import http.server, socket, sys, os, functools

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8080
ROOT = os.path.dirname(os.path.abspath(__file__))

class Handler(http.server.SimpleHTTPRequestHandler):
    def translate_path(self, path):
        p = path.split('?', 1)[0].split('#', 1)[0]
        if p == '/docs' or p.startswith('/docs/'):
            base = os.path.join(ROOT, 'docs'); rel = p[len('/docs'):]
        else:
            base = os.path.join(ROOT, 'ui'); rel = p
        full = os.path.normpath(os.path.join(base, rel.lstrip('/').replace('/', os.sep)))
        return full if full.startswith(base) else base
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store')
        super().end_headers()
    def log_message(self, fmt, *args):
        sys.stdout.write('  %s - %s\n' % (self.address_string(), fmt % args))

def lan_ip():
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        s.connect(('10.255.255.255', 1)); return s.getsockname()[0]
    except Exception:
        return '127.0.0.1'
    finally:
        s.close()

if __name__ == '__main__':
    ip = lan_ip()
    srv = http.server.ThreadingHTTPServer(('0.0.0.0', PORT), Handler)
    print('\n  The Creator Crew is running\n')
    print('  On this PC:        http://localhost:%d' % PORT)
    print('  On your network:   http://%s:%d   <- open this on your phone / other devices' % (ip, PORT))
    print('  Design document:   http://%s:%d/docs/HLD.html' % (ip, PORT))
    print('\n  Press Ctrl+C to stop.\n')
    try:
        srv.serve_forever()
    except KeyboardInterrupt:
        print('\n  Stopped.')
