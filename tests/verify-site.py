"""Check generated page inventory and local links before Pages deployment."""
from html.parser import HTMLParser
from pathlib import Path
import hashlib
import json
import re
from urllib.parse import urlparse, unquote

root = Path(__file__).resolve().parents[1]/'site'
release = json.loads((root/'release.json').read_text())
expected = {row['file'] for row in release['pages']}
assert expected == {p.name for p in root.glob('*.html')}
assert 'index.html' in expected

class Links(HTMLParser):
    def __init__(self, parent):
        super().__init__()
        self.parent = parent

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        attribute = {'a': 'href', 'iframe': 'src', 'img': 'src', 'script': 'src',
                     'video': 'src', 'source': 'src'}.get(tag)
        if not attribute or attribute not in attrs:
            return
        link = urlparse(attrs[attribute])
        if not link.scheme and link.path:
            target = (self.parent/unquote(link.path)).resolve()
            assert target.is_relative_to(root.resolve()) and target.is_file(), attrs[attribute]

assets = release.get('assets', [])
for row in assets:
    path = root/row['file']
    assert hashlib.sha256(path.read_bytes()).hexdigest() == row['sha256'], row['file']

for name in sorted(expected | {row['file'] for row in assets}):
    path = root/name
    if path.suffix == '.mp4':
        # Binary recordings are covered by the asset SHA256 check above.
        assert path.stat().st_size < 100 * 1024 * 1024, name
        continue
    content = path.read_text()
    assert '/home/gnc' not in content
    assert 'artifacts/research' not in content
    assert 'docs/superpowers' not in content
    assert not re.search(r'(?i:sk-[a-z0-9]{20,}|gh[pousr]_[a-z0-9]{30,}|dckr_pat_[a-z0-9_-]{20,})', content)
    if path.suffix == '.html':
        Links(path.parent).feed(content)
print(f'Verified {len(expected)} public documentation pages and {len(assets)} assets.')
