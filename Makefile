
HUGO := $(if $(strip $(HUGO)),$(HUGO),hugo)
UV := $(if $(strip $(UV)),$(UV),uv)
NPM := $(if $(strip $(NPM)),$(NPM),npm)

.DEFAULT_GOAL := help

.PHONY: help build serve serve_minify sort_books check_hugo check_uv check_npm images images_check js js_check test_ui test_ui_install

help: ## Show this help message
	@echo "Usage: make <target> [HUGO=/path/to/hugo] [UV=/path/to/uv] [NPM=/path/to/npm]"
	@echo ""
	@echo "Targets:"
	@awk 'BEGIN { FS = ":.*## " } /^[a-zA-Z0-9_-]+:.*## / { printf "  %-14s %s\n", $$1, $$2 }' $(MAKEFILE_LIST)

check_hugo: ## Show the detected Hugo version
	@command -v "$(HUGO)" >/dev/null 2>&1 || { echo "Error: '$(HUGO)' was not found in PATH. Set HUGO=/path/to/hugo." >&2; exit 1; }
	@$(HUGO) version

check_uv: ## Check that uv is available
	@command -v "$(UV)" >/dev/null 2>&1 || { echo "Error: '$(UV)' was not found in PATH. Set UV=/path/to/uv." >&2; exit 1; }

check_npm: ## Check that npm is available
	@command -v "$(NPM)" >/dev/null 2>&1 || { echo "Error: '$(NPM)' was not found in PATH. Set NPM=/path/to/npm." >&2; exit 1; }

build: check_hugo ## Build the site, including draft content
	$(HUGO) -D

serve: check_hugo ## Start the development server
	$(HUGO) server --disableFastRender --noHTTPCache

serve_minify: check_hugo ## Start the development server with minification
	$(HUGO) server --disableFastRender --noHTTPCache --minify

images: check_uv ## Generate optimized site thumbnails
	$(UV) run scripts/optimize_images.py

images_check: check_uv ## Validate optimized site thumbnails
	$(UV) run scripts/optimize_images.py --check

js: check_npm ## Bundle browser JavaScript
	$(NPM) run build:js

js_check: check_npm ## Validate bundled browser JavaScript
	$(NPM) run check:js

test_ui: check_hugo check_npm ## Run headless browser smoke tests
	HUGO="$(HUGO)" $(NPM) run test:ui

test_ui_install: check_npm ## Install the Chromium test browser
	npx playwright install chromium

sort_books: ## Sort data/books.json by title
	cat data/books.json > tmp.json && jq 'sort_by(.title | ascii_downcase)' tmp.json > data/books.json && rm tmp.json
