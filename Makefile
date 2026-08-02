
HUGO := $(if $(strip $(HUGO)),$(HUGO),hugo)

.DEFAULT_GOAL := help

.PHONY: help build serve serve_minify sort_books check_hugo

help: ## Show this help message
	@echo "Usage: make <target> [HUGO=/path/to/hugo]"
	@echo ""
	@echo "Targets:"
	@awk 'BEGIN { FS = ":.*## " } /^[a-zA-Z0-9_-]+:.*## / { printf "  %-14s %s\n", $$1, $$2 }' $(MAKEFILE_LIST)

check_hugo: ## Show the detected Hugo version
	@command -v "$(HUGO)" >/dev/null 2>&1 || { echo "Error: '$(HUGO)' was not found in PATH. Set HUGO=/path/to/hugo." >&2; exit 1; }
	@$(HUGO) version

build: check_hugo ## Build the site, including draft content
	$(HUGO) -D

serve: check_hugo ## Start the development server
	$(HUGO) server --disableFastRender --noHTTPCache

serve_minify: check_hugo ## Start the development server with minification
	$(HUGO) server --disableFastRender --noHTTPCache --minify

sort_books: ## Sort data/books.json by title
	cat data/books.json > tmp.json && jq 'sort_by(.title | ascii_downcase)' tmp.json > data/books.json && rm tmp.json
