PORT = 8000
URL = http://localhost:$(PORT)
BUILD_DIR = dist
ZIP_NAME = litr_js13k.zip
MAX_BYTES = 13312

define PYTHON_BUILD_SCRIPT
import glob
import os
import re

# ---------------------------------------------------------------------------
# Safe, string/regex/template-literal-aware JS minifier.
# Unlike a plain regex whitespace-collapse, this never touches whitespace
# inside strings/templates/regex literals, and it preserves newlines
# (as single newlines) rather than merging every line into one, because
# JS relies on newlines for Automatic Semicolon Insertion (ASI). Collapsing
# newlines to spaces silently breaks any statement missing a semicolon.
# ---------------------------------------------------------------------------

def minify_js_body(code):
    out = []
    i = 0
    n = len(code)

    def last_meaningful_char():
        for ch in reversed(out):
            if ch.strip():
                return ch
        return None

    while i < n:
        c = code[i]

        # single-line comment
        if c == '/' and i + 1 < n and code[i + 1] == '/':
            j = code.find('\n', i)
            i = j if j != -1 else n
            continue

        # block comment
        if c == '/' and i + 1 < n and code[i + 1] == '*':
            j = code.find('*/', i + 2)
            i = (j + 2) if j != -1 else n
            continue

        # single/double-quoted string
        if c in ("'", '"'):
            start = i
            i += 1
            while i < n and code[i] != c:
                i += 2 if code[i] == '\\' else 1
            i = min(i + 1, n)
            out.append(code[start:i])
            continue

        # template literal (handles $${ ... } nesting)
        if c == '`':
            start = i
            i += 1
            depth = 0
            while i < n:
                if code[i] == '\\':
                    i += 2
                    continue
                if code[i] == '`' and depth == 0:
                    i += 1
                    break
                if code[i] == '$$' and i + 1 < n and code[i + 1] == '{':
                    depth += 1
                    i += 2
                    continue
                if code[i] == '}' and depth > 0:
                    depth -= 1
                    i += 1
                    continue
                i += 1
            out.append(code[start:i])
            continue

        # regex literal (heuristic: only valid where a value/operator was expected)
        if c == '/':
            prev = last_meaningful_char()
            regex_ok = prev is None or prev in "(,=:[!&|?{};+-*%^~<>"
            if regex_ok:
                start = i
                i += 1
                in_class = False
                while i < n:
                    if code[i] == '\\':
                        i += 2
                        continue
                    if code[i] == '[':
                        in_class = True
                    elif code[i] == ']':
                        in_class = False
                    elif code[i] == '/' and not in_class:
                        i += 1
                        break
                    i += 1
                while i < n and code[i].isalpha():
                    i += 1
                out.append(code[start:i])
                continue

        # whitespace run: collapse to one newline if it contained one,
        # else one space. Never delete entirely (e.g. `return x` needs
        # the space; `){` doesn't but this is a safe conservative choice).
        if c.isspace():
            start = i
            has_newline = False
            while i < n and code[i].isspace():
                if code[i] == '\n':
                    has_newline = True
                i += 1
            out.append('\n' if has_newline else ' ')
            continue

        out.append(c)
        i += 1

    return ''.join(out)


def strip_module_syntax(code):
    code = re.sub(r'import\s+[\s\S]*?from\s+[\'"][^\'"]+[\'"];?', '', code)
    code = re.sub(r'import\s+[\'"][^\'"]+[\'"];?', '', code)
    code = re.sub(r'export\s+default\s+', '', code)
    code = re.sub(r'export\s+\{[\s\S]*?\};?', '', code)
    code = re.sub(r'\bexport\s+', '', code)
    return code


def get_imported_local_paths(code, this_path):
    """Return the set of local src/*.js files this file imports, resolved to
    the same keys used in the files dict (basenames without extension)."""
    deps = set()
    this_dir = os.path.dirname(this_path)
    for m in re.finditer(r'''from\s+['"](\.[^'"]+)['"]''', code):
        rel = m.group(1)
        resolved = os.path.normpath(os.path.join(this_dir, rel))
        if not resolved.endswith('.js'):
            resolved += '.js'
        deps.add(resolved)
    return deps


def topo_sort_js_files(js_files):
    """Order files so dependencies come before dependents. Falls back to
    stable alphabetical order among files with no relative ordering
    constraint. This matters because `class B extends A` requires A's
    class declaration to have already executed (classes are not hoisted
    the way functions are) -- alphabetical glob order can easily put a
    subclass file before its parent class file."""
    raw = {}
    for f in js_files:
        raw[f] = open(f).read()

    deps = {f: (get_imported_local_paths(raw[f], f) & set(js_files)) for f in js_files}

    ordered = []
    visited = set()
    temp_mark = set()

    def visit(f):
        if f in visited:
            return
        if f in temp_mark:
            # circular import between local files; break the cycle rather
            # than crash the build
            return
        temp_mark.add(f)
        for dep in sorted(deps.get(f, ())):
            visit(dep)
        temp_mark.discard(f)
        visited.add(f)
        ordered.append(f)

    for f in sorted(js_files):
        visit(f)

    return ordered, raw


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

# Combine JS files in dependency order (not just alphabetical), then minify
js_files = glob.glob("src/**/*.js", recursive=True)
ordered_files, raw_sources = topo_sort_js_files(js_files)
print("📄 JS build order:")
for f in ordered_files:
    print(f"   - {f}")

combined_js = "\n".join(strip_module_syntax(raw_sources[f]) for f in ordered_files)
min_js = minify_js_body(combined_js)

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
	@if command -v advzip > /dev/null 2>&1; then \
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