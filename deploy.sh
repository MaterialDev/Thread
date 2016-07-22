#!/bin/bash

REPO=`git config remote.origin.url`
TARGET_BRANCH="gh-pages"


rm -rf out || exit 0;
git clone $REPO out;
gulp build;
( cd out
git checkout $TARGET_BRANCH
git config user.name "Travis-CI"
git config user.email "travis@material.com"
cp -r ../dist ./
git add .
git commit -m "Travis deploy to Github Pages"
git push "https://${GH_TOKEN}@${GH_REF}" gh-pages
)
rm -rf out;