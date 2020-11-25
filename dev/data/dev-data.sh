#!/bin/bash
#
# pull down dev data for local testing

username=barrettotte
gist_id=ee6348040d495ad2ab19bc40fbcff6be

base_url=https://gist.githubusercontent.com/$username/$gist_id/raw

script_dir=$(readlink -f "$0")

declare -A file_list
file_list[0]='about.json'
file_list[1]='index.json'
file_list[2]='posts.json'
file_list[3]='projects.json'
file_list[4]='vintage.json'
file_list[5]='overrides.json'

echo "downloading portfolio data..."

for i in "${file_list[@]}"
do
  echo "   $i"
  curl $base_url/$i -O -s $(dirname "$script_dir")
done

echo "done."
exit