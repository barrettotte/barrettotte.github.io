
HUGO := $(if $(strip $(HUGO)),$(HUGO),hugo)
UV := $(if $(strip $(UV)),$(UV),uv)

.DEFAULT_GOAL := help

.PHONY: help build serve serve_minify sort_books check_hugo check_uv images images_check

help: ## Show this help message
	@echo "Usage: make <target> [HUGO=/path/to/hugo] [UV=/path/to/uv]"
	@echo ""
	@echo "Targets:"
	@awk 'BEGIN { FS = ":.*## " } /^[a-zA-Z0-9_-]+:.*## / { printf "  %-14s %s\n", $$1, $$2 }' $(MAKEFILE_LIST)

check_hugo: ## Show the detected Hugo version
	@command -v "$(HUGO)" >/dev/null 2>&1 || { echo "Error: '$(HUGO)' was not found in PATH. Set HUGO=/path/to/hugo." >&2; exit 1; }
	@$(HUGO) version

check_uv: ## Check that uv is available
	@command -v "$(UV)" >/dev/null 2>&1 || { echo "Error: '$(UV)' was not found in PATH. Set UV=/path/to/uv." >&2; exit 1; }

build: check_hugo ## Build the site, including draft content
	$(HUGO) -D

serve: check_hugo ## Start the development server
	$(HUGO) server --disableFastRender --noHTTPCache

serve_minify: check_hugo ## Start the development server with minification
	$(HUGO) server --disableFastRender --noHTTPCache --minify

images: check_uv ## Generate optimized project and museum images
	$(UV) run scripts/optimize_images.py

images_check: check_uv ## Validate optimized project and museum images
	$(UV) run scripts/optimize_images.py --check

sort_books: ## Sort data/books.json by title
	cat data/books.json > tmp.json && jq 'sort_by(.title | ascii_downcase)' tmp.json > data/books.json && rm tmp.json
