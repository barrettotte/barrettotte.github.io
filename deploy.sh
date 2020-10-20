#!/bin/bash

ghuser=barrettotte
ghio=$ghuser.github.io

if [ $# -eq 0 ]; then
  echo "No arguments supplied. Input commit message."
  exit
fi

if [ ! -d "./node_modules" ]
then
  echo "Installing node modules..."
  npm install
fi

if [ ! -d "../$ghio" ]
then
  echo "Could not find $ghio repository. Cloning fresh copy..."
  git clone https://github.com/$ghuser/$ghio.git ../$ghio
else
  pushd ../$ghio ; git pull ; popd
fi

ng build --prod

rm -rf ../$ghio/* 
yes | cp -rf dist/portfolio/* ../$ghio
yes | cp -rf misc/ghio-README.md ../$ghio
pushd ../$ghio ; mv ghio-README.md README.md ; popd

echo Pushing $ghuser/$ghio ...
pushd ../$ghio
git add .
git commit -m "${1}"
git push origin master
popd

echo Done.
