PORT = 8000
URL = http://localhost:$(PORT)
BUILD_DIR = dist
ZIP_NAME = litr_js13k.zip
MAX_BYTES = 13312

define PYTHON_BUILD_SCRIPT
import glob
import os
import re

def minify_js(code):
    # Strip import statements (e.g., import { foo } from './bar.js')
    code = re.sub(r'import\s+[\s\S]*?from\s+[\'"][^\'"]+[\'"];?', '', code)
    code = re.sub(r'import\s+[\'"][^\'"]+[\'"];?', '', code)
    
    # Strip export keywords (e.g., export default, export const, export { ... })
    code = re.sub(r'export\s+default\s+', '', code)
    code = re.sub(r'export\s+\{[\s\S]*?\};?', '', code)
    code = re.sub(r'\bexport\s+', '', code)

    # Strip single and multi-line comments
    code = re.sub(r"(?<!:)\/\/.*", "", code)
    code = re.sub(r"\/\*[\s\S]*?\*\/", "", code)
    
    # Collapse whitespace
    return re.sub(r"\s+", " ", code)

def minify_css(code):
    code = re.sub(r"\/\*[\s\S]*?\*\/", "", code)
    return re.sub(r"\s+", " ", code)

# Read index.html
with open("index.html", "r") as f:
    html = f.read()

# Inline CSS from style.css
if os.path.exists("style.css"):
    with open("style.css", "r") as f:
        min_css = minify_css(f.read())
    html = re.sub(r"<link[^>]*href=[\"']style\.css[\"'][^>]*>", f"<style>{min_css}</style>", html)

# Combine and minify JS files in src/
js_files = sorted(glob.glob("src/*.js"))
combined_js = "".join(open(f).read() + "\n" for f in js_files)
min_js = minify_js(combined_js)

# Match <script ... src="..."></script> including type="module"
script_tag_pattern = r"<script[^>]*src=[\"'][^\"']*[\"'][^>]*>\s*</script>"
if re.search(script_tag_pattern, html):
    html = re.sub(script_tag_pattern, f"<script>{min_js}</script>", html, count=1)
    html = re.sub(script_tag_pattern, "", html)
else:
    html = html.replace("</body>", f"<script>{min_js}</script></body>")

# Collapse HTML whitespace
html = re.sub(r">\s+<", "><", html).strip()

with open("dist/index.html", "w") as f:
    f.write(html)
endef
export PYTHON_BUILD_SCRIPT

.PHONY: run build

run:
	@lsof -ti:$(PORT) | xargs kill -9 2>/dev/null || true
	python3 -m http.server $(PORT) &
	open -a "Firefox" $(URL)

build:
	@echo "🔨 Building Project Litr..."
	@rm -rf $(BUILD_DIR) $(ZIP_NAME)
	@mkdir -p $(BUILD_DIR)
	@python3 -c "$$PYTHON_BUILD_SCRIPT"
	@cd $(BUILD_DIR) && zip -9 -X "../$(ZIP_NAME)" index.html > /dev/null
	@if command -v advzip &> /dev/null; then \
		echo "⚡ Running advzip pass..."; \
		advzip -q -4 -z "$(ZIP_NAME)"; \
	fi
	@SIZE=$$(wc -c < "$(ZIP_NAME)" | tr -d ' '); \
	REMAINING=$$(( $(MAX_BYTES) - SIZE )); \
	PERCENT=$$(( SIZE * 100 / $(MAX_BYTES) )); \
	echo ""; \
	echo "📦 Archive: $(ZIP_NAME)"; \
	echo "📊 Budget:  $$SIZE / $(MAX_BYTES) bytes ($$PERCENT% used)"; \
	if [ "$$REMAINING" -ge 0 ]; then \
		echo "✅ Pass! You have $$REMAINING bytes to spare."; \
	else \
		OVER=$$(( SIZE - $(MAX_BYTES) )); \
		echo "❌ Over budget by $$OVER bytes!"; \
	fi