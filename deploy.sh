#!/bin/bash
rm -rf out || exit 0;
mkdir out;
gulp build
( cd out
git init
git config user.name "Travis-CI"
git config user.email "travis@material.com"
cp ../dist ./dist
git add .
git commit -m "Travis deploy to Github Pages"
git push --force --quiet "https://${GH_TOKEN}@${GH_REF}" master:gh-pages > /dev/null 2>&1
)