#!/bin/bash
# Rysnc tutorial: https://kyup.com/tutorials/copy-files-rsync-ssh/
#TODO --> Fix this script
rsync -r -a -v -e ssh --delete . $1:~/Local/HTML-Documents/WebApps \
--exclude '.git' \
--exclude '.gitignore' \
--exclude 'README.md' \
--exclude 'upload.sh' \
--exclude 'package-lock.json' \
--exclude 'package.json' \
--exclude '.DS_Store' \
--exclude 'sass' \
--exclude 'storage/'  \
--exclude 'storage/*'