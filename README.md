# barrettotte.github.io

Hosted at https://barrettotte.github.io

A personal site built with [Hugo](https://gohugo.io/).

## Dependencies

- [Hugo Extended](https://gohugo.io/installation/)
- [jq](https://jqlang.org/)
- [uv](https://docs.astral.sh/uv/)

Python and Pillow are managed by the inline `uv` metadata in the image optimization script.

## Development

```sh
# build
make build

# start dev server at http://localhost:1313/
make serve

# start dev server, but with minified styling
make serve_minify

# generate optimized project and museum thumbnails
make images

# check that optimized thumbnails exist and are current
make images_check

# sort books.json by title
make sort_books
```

Source images are stored under `assets/img` so Hugo does not publish them directly. Optimized WebP thumbnails are written to `static/img/thumbnails`; commit these generated files so deployed builds do not need Python or Pillow.

## References

- Based on [Cactus Theme](https://themes.gohugo.io/themes/hugo-theme-cactus/)
- https://cloudcannon.com/blog/the-ultimate-guide-to-hugo-sections/
