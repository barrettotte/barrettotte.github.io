# barrettotte.github.io

Hosted at https://barrettotte.github.io

A personal site built with [Hugo](https://gohugo.io/).

## Dependencies

- [Hugo Extended](https://gohugo.io/installation/) 0.164.0
- [jq](https://jqlang.org/)
- [uv](https://docs.astral.sh/uv/)
- [Node.js](https://nodejs.org/) and npm for the 3D viewer bundle
- [Playwright](https://playwright.dev/) Chromium for headless UI tests

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

# validate Bytes links against a sibling ../bytes checkout
make bytes_check

# bundle and validate browser JavaScript
make js
make js_check

# install the headless browser once, then run UI smoke tests
make test_ui_install
make test_ui

# sort books.json by title
make sort_books
```

Source images are stored under matching `assets/img/{about,models,museum,projects}` directories so Hugo does not publish them directly. Optimized WebP thumbnails are written to the corresponding directory under `static/img/thumbnails`; commit these generated files so deployed builds do not need Python or Pillow. `make images` also removes obsolete generated WebPs, while `make images_check` reports missing, stale, invalid, or unexpected outputs without changing files.

Project images use a centered crop by default. Add an optional `imageFocus` pair such as `[0.5, 0.25]` to a project record to move the horizontal and vertical crop focus; both values range from `0` to `1`.

Model metadata lives in the optional nested `model` field of `data/bytes.json`. Models are loaded from the `bytes` repository: the viewer prefers a web-ready GLB when available and falls back to the source STL. The npm build produces a self-contained Three.js viewer under `static/js/vendor`, and the catalog loads it only after a visitor requests an interactive view.

`make bytes_check` validates every Bytes source, directory, GLB, and STL URL against a sibling `../bytes` checkout. Set `BYTES_REPO=/path/to/bytes` when the repository lives elsewhere. `make check` runs this together with the production build, image validation, and JavaScript bundle validation.

## References

- Based on [Cactus Theme](https://themes.gohugo.io/themes/hugo-theme-cactus/)
- https://cloudcannon.com/blog/the-ultimate-guide-to-hugo-sections/
