# [barrettotte.github.io](https://barrettotte.github.io/)

Simple portfolio and occasional blog page using the [Minimal Mistakes](https://github.com/mmistakes/minimal-mistakes) Jekyll theme.


## Getting Started
* [Minimal Mistakes Quick Start Guide](https://mmistakes.github.io/minimal-mistakes/docs/quick-start-guide/)
* Dev dependencies 
 * Ubuntu
  * Ruby ```apt-get -y install ruby-full```
  * Sanity Check ```apt-get -y install ruby-dev zlib1g-dev``` (nokogiri sometimes fails without this)
 * Arch
  * Ruby ```pacman -S --noconfirm ruby``` and add to PATH
 * Bundler Gem ```gem install bundler```
 * Jekyll Gem ```gem install jekyll```
 * Rake Gem ```gem install rake```
* Building Locally
  * ```cd barrettotte.github.io && bundle update```
  * ```bundle exec jekyll serve --watch```
  * Running locally at http://127.0.0.1:4000
