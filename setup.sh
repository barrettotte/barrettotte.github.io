#!/bin/bash
gem install bundler
gem install jekyll
gem install rake
bundle update
bundle exec jekyll serve --watch
# listening at http://127.0.0.1:4000