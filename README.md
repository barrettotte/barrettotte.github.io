# barrettotte.github.io

Hosted at https://barrettotte.github.io

A simple personal site using [Hugo](https://gohugo.io/).

## Dependencies

```sh
sudo pacman -S base-devel jq go hugo
```

## Development

```sh
# build
make build

# start dev server at http://localhost:1313/
make serve

# start dev server, but with minified styling
make serve_minify

# sort books.json by title
make sort_books
```

## References

- Based on [Cactus Theme](https://themes.gohugo.io/themes/hugo-theme-cactus/)
- https://cloudcannon.com/blog/the-ultimate-guide-to-hugo-sections/
- https://hugocodex.org/add-ons/slider-carousel/
