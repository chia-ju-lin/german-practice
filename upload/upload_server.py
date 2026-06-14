#!/usr/bin/env python3
"""Simple file upload server (no cgi module - Python 3.14 compatible)"""
import http.server
import json
import os
import sys
import re

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8001
UPLOAD_DIR = os.path.dirname(os.path.abspath(__file__))

def parse_multipart(body, boundary):
    parts = body.split(f'--{boundary}')
    for part in parts:
        if 'filename=' in part:
            # Extract filename
            name_match = re.search(r'filename="([^"]+)"', part)
            filename = name_match.group(1) if name_match else 'upload'
            # Split headers from content
            content_start = part.index('\r\n\r\n') + 4
            content = part[content_start:].strip()
            return filename, content
    return None, None

class UploadHandler(http.server.BaseHTTPRequestHandler):
    def do_POST(self):
        length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(length).decode('utf-8')
        ct = self.headers.get('Content-Type', '')
        
        # Extract boundary from Content-Type
        bd_match = re.search(r'boundary=(.*)', ct)
        boundary = bd_match.group(1) if bd_match else ''
        
        filename, content = parse_multipart(body, boundary)
        if filename and content:
            filepath = os.path.join(UPLOAD_DIR, filename)
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f'✅ Saved {filename} ({len(content)} bytes) → {filepath}')
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'status': 'ok', 'file': filename, 'size': len(content)}).encode())
        else:
            self.send_response(400)
            self.end_headers()
            self.wfile.write(b'{"error": "no file found"}')

    def do_GET(self):
        self.send_response(200)
        self.send_header('Content-Type', 'text/plain')
        self.end_headers()
        msg = f'Upload server running on port {PORT}\n\n'
        msg += f'curl -F "file=@sentences.json" http://localhost:{PORT}/\n'
        self.wfile.write(msg.encode())

    def log_message(self, format, *args):
        print(f'[upload] {args[0]}')

print(f'📥 Upload server on http://localhost:{PORT}')
http.server.HTTPServer(('0.0.0.0', PORT), UploadHandler).serve_forever()
