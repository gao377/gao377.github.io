"""Check generated page inventory and local links before Pages deployment."""
from html.parser import HTMLParser
from pathlib import Path
import json
from urllib.parse import urlparse, unquote

root = Path(__file__).resolve().parents[1]/'site'
release = json.loads((root/'release.json').read_text())
expected = {row['file'] for row in release['pages']}
assert expected == {p.name for p in root.glob('*.html')}
assert 'index.html' in expected

class Links(HTMLParser):
    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag != 'a' or 'href' not in attrs:
            return
        link = urlparse(attrs['href'])
        if not link.scheme and link.path:
            target = (root/unquote(link.path)).resolve()
            assert target.is_relative_to(root.resolve()) and target.is_file(), attrs['href']

for name in sorted(expected):
    content = (root/name).read_text()
    assert '/home/gnc' not in content
    assert 'artifacts/research' not in content
    assert 'docs/superpowers' not in content
    Links().feed(content)
print(f'Verified {len(expected)} public documentation pages.')
