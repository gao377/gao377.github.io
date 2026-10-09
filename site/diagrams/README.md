# Editable architecture atlas

The `.drawio` files are the editable source. Their HTML viewers are exported
with draw.io Desktop 32.3.0; SVG provides a static first-page preview.

| File | Pages |
| --- | --- |
| system-architecture.drawio | S2: 18 stable system responsibilities |
| software-architecture.drawio | W1-A: task/control; W1-B: observations; W1-C: support/RSI; W4: deployment |
| runtime-sequences.drawio | W3-A: task; W3-B: capability; W3-C: RSI design |
| algorithm-map.drawio | Clickable map of 20 algorithm topics inside their owning software modules; active, optional and unwired paths |
| manipulation-runtime.drawio | Components; planning and repairs; pick/holding sequence |
| navigation-runtime.drawio | Components; coarse braking; visual adjustment sequence |
| body-adapter.drawio | Gateway/backend composition; one control tick |
| perception-runtime.drawio | Components; pixel-to-local geometry |
| spatial-runtime.drawio | Components; map save; relocalization sequence |

Software IDs and implementation labels correspond to `docs/architecture-map.json`.
I means functional code in the documented scope; P means partial or fixed policy;
M means mock or fixture; D means a design not wired into the runtime. These are
implementation labels, not simulation or hardware acceptance labels.

Edit in draw.io and export using the official CLI:

```bash
drawio --export --format html --all-pages --html-theme light \
  --html-link-target blank --output docs/diagrams/software-architecture.html \
  docs/diagrams/software-architecture.drawio
drawio --export --format svg --output docs/diagrams/software-architecture.svg \
  docs/diagrams/software-architecture.drawio
python3 tools/docs/check_architecture.py
python3 tools/docs/build.py
```

For an online edit shortcut, export with `--html-edit-link` pointing to the
corresponding `https://app.diagrams.net/#Uhttps://gao377.github.io/diagrams/` source.
The exported viewer loads official `viewer-static.min.js` from diagrams.net.
For offline use, open the `.drawio` file in the desktop app.

For diagrams with topic links, check the exported SVG anchors. draw.io Desktop
may resolve relative links against its local installation; normalize those
`file:` links back to site-relative `../algo-*.html` links before publication.
The editable source and HTML viewer retain the relative topic links.

The drawing method follows the source-grounded, editable-XML and rendered-review
approach described by [Aymen Furter](https://aymenfurter.ch/articles/better-architecture-diagrams-with-gpt-6-astra/).
The figures retain this project's own architecture and code mappings.
See the [official embed documentation](https://www.drawio.com/docs/manual/export/embed-html/).
