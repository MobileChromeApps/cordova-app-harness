#!/bin/bash

export DEBUG_SIGNING_PROPERTIES_FILE=../../android-debug-keys.properties
export ANDROID_BUILD=gradle
if [[ ! -e plugins/org.chromium.apkpackager ]]; then
    export BUILD_MULTIPLE_APKS=1
fi
exec cordova build android $@
