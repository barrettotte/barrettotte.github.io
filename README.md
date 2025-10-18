# barrettotte.github.io

Hosted at https://barrettotte.github.io

A simple personal site using [Hugo](https://gohugo.io/).

## Development

- Dependencies 
  - [Hugo Extended v0.147.8+](https://github.com/gohugoio/hugo/releases/tag/v0.147.8)
- Build - `hugo -D`
- Start [dev server](http://localhost:1313/) - `hugo server --disableFastRender --noHTTPCache`
  - add `--minify` to more accurately show styling used when deployed

```sh
# sort books.json by title
cat books.json > tmp.json && jq 'sort_by(.title | ascii_downcase)' tmp.json > books.json && rm tmp.json
```

## References

- Based on [Cactus Theme](https://themes.gohugo.io/themes/hugo-theme-cactus/)
- https://cloudcannon.com/blog/the-ultimate-guide-to-hugo-sections/
- https://hugocodex.org/add-ons/slider-carousel/
