#!/usr/bin/env bash
set -e

BUILD_DIR="dist"
ZIP_NAME="litr_js13k.zip"
MAX_BYTES=13312 # Exactly 13 KiB

echo "🔨 Building Project Litr..."

# 1. Clean build directory
rm -rf "$BUILD_DIR" "$ZIP_NAME"
mkdir -p "$BUILD_DIR"

# 2. Inline and minify using standard Python 3 (no npm modules)
python3 -c '
import re

def minify_js(code):
    # Strip single-line comments (ignoring URL schemes like http://)
    code = re.sub(r"(?<!:)\/\/.*", "", code)
    # Strip multi-line comments
    code = re.sub(r"\/\*[\s\S]*?\*\/", "", code)
    # Collapse multiple spaces/newlines into a single space
    return re.sub(r"\s+", " ", code)

# Read index.html
with open("index.html", "r") as f:
    html = f.read()

# Read main.js
with open("main.js", "r") as f:
    js = f.read()

# Inline minified JS into the HTML file
min_js = minify_js(js)
html = html.replace("<script src=\"main.js\"></script>", f"<script>{min_js}</script>")

# Collapse HTML whitespace between tags
html = re.sub(r">\s+<", "><", html).strip()

with open("dist/index.html", "w") as f:
    f.write(html)
'

# 3. Create max-compression ZIP archive
# -9 = Maximum DEFLATE compression
# -X = Exclude extra file attributes/timestamps to save bytes
cd "$BUILD_DIR"
zip -9 -X "../$ZIP_NAME" index.html > /dev/null
cd ..

# 4. Optional: Re-compress with advzip if installed on your system
if command -v advzip &> /dev/null; then
  echo "⚡ Running advzip pass..."
  advzip -q -4 -z "$ZIP_NAME"
fi

# 5. Calculate remaining byte budget
SIZE=$(wc -c < "$ZIP_NAME" | tr -d ' ')
REMAINING=$((MAX_BYTES - SIZE))
PERCENT=$((SIZE * 100 / MAX_BYTES))

echo ""
echo "📦 Archive: $ZIP_NAME"
echo "📊 Budget:  $SIZE / $MAX_BYTES bytes ($PERCENT% used)"

if [ "$REMAINING" -ge 0 ]; then
  echo "✅ Pass! You have $REMAINING bytes to spare."
else
  OVER=$((SIZE - MAX_BYTES))
  echo "❌ Over budget by $OVER bytes!"
fi
