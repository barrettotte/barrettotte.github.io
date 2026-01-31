
build:
	hugo -D

serve:
	hugo server --disableFastRender --noHTTPCache

serve_minify:
	hugo server --disableFastRender --noHTTPCache --minify

# sort books json by title
sort_books:
	cat data/books.json > tmp.json && jq 'sort_by(.title | ascii_downcase)' tmp.json > data/books.json && rm tmp.json
