#!/bin/bash
export PLUGIN_SEARCH_PATH=/Users/agrieve/git/cordova:/Users/agrieve/git/cordova/cordova-plugins
export PLATFORMS="android ios"
export ANDROID_PATH="/Users/agrieve/git/cordova/cordova-android"
rm -rf CCAHarness
./createproject.sh CCAHarness "$@"
