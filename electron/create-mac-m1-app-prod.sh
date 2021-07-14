#!/bin/bash

nativefier --name Just --platform mac -a arm64 --title-bar-style hidden --icon electron.png "https://just.zemke.io?electron=1"

# https://github.com/jiahaog/nativefier/issues/956#issuecomment-619530568
cp preload.js Just-darwin-x64/Just.app/Contents/Resources/app/lib/preload.js

