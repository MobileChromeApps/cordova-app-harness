#!/bin/bash

export DEBUG_SIGNING_PROPERTIES_FILE=../../android-debug-keys.properties
export ANDROID_BUILD=gradle
export BUILD_MULTIPLE_APKS=1
exec cordova build android $@
