PORT = 8000
URL = http://localhost:$(PORT)

.PHONY: run
run:
	# python3 -m http.server $(PORT) &
	# open -a "Firefox" $(URL)
	@lsof -ti:8000 | xargs kill -9 2>/dev/null || true
	python3 -m http.server 8000
	open -a "Firefox" http://localhost:8000

