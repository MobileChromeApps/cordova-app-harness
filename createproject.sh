#!/bin/bash
# Licensed to the Apache Software Foundation (ASF) under one
# or more contributor license agreements.  See the NOTICE file
# distributed with this work for additional information
# regarding copyright ownership.  The ASF licenses this file
# to you under the Apache License, Version 2.0 (the
# "License"); you may not use this file except in compliance
# with the License.  You may obtain a copy of the License at
#
# http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing,
# software distributed under the License is distributed on an
# "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
# KIND, either express or implied.  See the License for the
# specific language governing permissions and limitations
# under the License.

if [[ $# -eq 0 || "$1" = "--help" ]]; then
    echo "Use this script to create a Chrome ADT project"
    echo "Usage: $0 NewDirName [--allplugins]"
    echo 'Options via variables:'
    echo '  PLATFORMS="android ios"'
    echo '  CORDOVA="path/to/cordova"'
    echo '  PLUGIN_SEARCH_PATH="path1:path2:path3"'
    echo '  APP_ID="org.apache.AppHarness"'
    echo '  APP_NAME="CordovaAppHarness"'
    echo '  APP_VERSION="0.0.1"'
    echo '  ANDROID_PATH="path/to/cordova-android"'
    exit 1
fi

CORDOVA="${CORDOVA-cordova}"
PLATFORMS="${PLATFORMS-android}"
APP_ID=${APP_ID-org.chromium.appharness}
APP_NAME=${APP_NAME-Chrome App Harness}
APP_VERSION=${APP_VERSION-0.6.0-dev}
DIR_NAME="${1}"
AH_PATH="$(cd $(dirname $0) && pwd)"
extra_search_path="$PLUGIN_SEARCH_PATH"
PLUGIN_SEARCH_PATH="$(dirname "$AH_PATH")"
CA_PATH="$ANDROID_PATH"

function AddSearchPathIfExists() {
    if [[ -d "$1" ]]; then
        PLUGIN_SEARCH_PATH="$PLUGIN_SEARCH_PATH:$1"
    fi
}
AddSearchPathIfExists "$(dirname "$AH_PATH")/cordova"
AddSearchPathIfExists "$(dirname "$AH_PATH")/cordova/cordova-plugins"
AddSearchPathIfExists "$(dirname "$AH_PATH")/cordova-plugins"
AddSearchPathIfExists "$(dirname "$AH_PATH")/mobile-chrome-apps/chrome-cordova/plugins"

CCA_PATH=$(which cca)
if [[ -n "$CCA_PATH" ]]; then
    while [[ -L "$CCA_PATH" ]]; do
        NEW_CCA_PATH=$(readlink "$CCA_PATH")
        if [[ "/*" != "$NEW_CCA_PATH" ]]; then
            NEW_CCA_PATH=$( cd $(dirname "$CCA_PATH") && cd $(dirname "$NEW_CCA_PATH") && echo $(pwd)/$(basename "$NEW_CCA_PATH") )
        fi
        CCA_PATH="$NEW_CCA_PATH"
    done
    AddSearchPathIfExists "$(dirname $(dirname "$CCA_PATH"))/chrome-cordova/plugins"
    AddSearchPathIfExists "$(dirname $(dirname "$CCA_PATH"))/cordova"
fi


if [[ -n "$extra_search_path" ]]; then
    PLUGIN_SEARCH_PATH="${extra_search_path}:$PLUGIN_SEARCH_PATH"
fi

"$CORDOVA" create "$DIR_NAME" "$APP_ID" "$APP_NAME" --link-to "$AH_PATH/www" || exit 1
cd "$DIR_NAME"
cp "$AH_PATH/template-overrides/config.xml" . || exit 1
perl -i -pe "s/{ID}/$APP_ID/g" config.xml || exit 1
perl -i -pe "s/{NAME}/$APP_NAME/g" config.xml || exit 1
perl -i -pe "s/{VERSION}/$APP_VERSION/g" config.xml || exit 1

if [[ -n "$CA_PATH" ]]; then
  CJS1='{"lib": {"android": {"uri": "'
  CJS2='", "version": "4.0.x" , "id": "cordova-android-4"}}}'
  echo $CJS1$CA_PATH$CJS2 > .cordova/config.json
fi

set -x
$CORDOVA platform add $PLATFORMS || exit 1
set +x

if [[ "$PLATFORMS" = *android* ]]; then
    cp "$AH_PATH"/template-overrides/icons/android/icon.png platforms/android/res/drawable/icon.png
    rm platforms/android/res/drawable-ldpi/icon.png
    cp "$AH_PATH"/template-overrides/icons/android/icon-mdpi.png platforms/android/res/drawable-mdpi/icon.png
    cp "$AH_PATH"/template-overrides/icons/android/icon-hdpi.png platforms/android/res/drawable-hdpi/icon.png
    cp "$AH_PATH"/template-overrides/icons/android/icon-xdpi.png platforms/android/res/drawable-xhdpi/icon.png

    cp "$AH_PATH"/template-overrides/strings.xml platforms/android/res/values/strings.xml
fi
if [[ "$PLATFORMS" = *ios* ]]; then
    cp -r "$AH_PATH"/template-overrides/icons/ios/* platforms/ios/*/Resources/icons
    # Set CFBundleName to "App Harness" instead of "Chrome App Harness".
    cp "$AH_PATH"/template-overrides/Info.plist platforms/ios/*/*-Info.plist
fi

# if [[ $PLATFORMS = *ios* ]]; then
    # ../../cordova-ios/bin/update_cordova_subproject platforms/ios/CordovaAppHarness.xcodeproj
# fi

echo Installing plugins.
# org.apache.cordova.device isn't used directly, but is convenient to test mobilespec.
"$CORDOVA" plugin add\
    "$AH_PATH/UrlRemap" \
    "$AH_PATH/CacheClear" \
    "$AH_PATH/AppHarnessUI" \
    org.apache.cordova.file \
    org.apache.cordova.file-transfer \
    org.apache.cordova.device \
    org.chromium.socket \
    org.chromium.zip \
    --searchpath="$PLUGIN_SEARCH_PATH" \
    --noregistry

if [[ "$2" = "--allplugins" ]]; then
"$CORDOVA" plugin add \
    org.apache.cordova.battery-status \
    org.apache.cordova.camera \
    org.apache.cordova.contacts \
    org.apache.cordova.device-motion \
    org.apache.cordova.device-orientation \
    org.apache.cordova.device \
    org.apache.cordova.dialogs \
    org.apache.cordova.file-transfer \
    org.apache.cordova.file \
    org.apache.cordova.geolocation \
    org.apache.cordova.globalization \
    org.apache.cordova.inappbrowser \
    org.apache.cordova.media-capture \
    org.apache.cordova.network-information \
    org.apache.cordova.splashscreen \
    org.apache.cordova.statusbar \
    org.apache.cordova.vibration \
    --searchpath="$PLUGIN_SEARCH_PATH" \
    --noregistry
    # Skipped core plugins:
    # org.apache.cordova.console
fi

# To enable barcode scanning:
# $CORDOVA plugin add https://github.com/wildabeast/BarcodeScanner.git # Optional

if [[ $? != 0 ]]; then
    echo "Plugin installation failed. Probably you need to set PLUGIN_SEARCH_PATH env variable so that it contains the plugin that failed to install."
    exit 1
fi

# Using CCA here to get the right search path.
echo "Installing Chromium plugins"
cordova plugin add \
    org.chromium.bootstrap \
    org.chromium.navigation \
    org.chromium.fileSystem \
    org.chromium.i18n \
    org.chromium.identity \
    org.chromium.idle \
    org.chromium.notifications \
    org.chromium.power \
    org.chromium.socket \
    org.chromium.syncFileSystem \
    org.chromium.FileChooser \
    org.chromium.polyfill.blob_constructor \
    org.chromium.polyfill.CustomEvent \
    org.chromium.polyfill.xhr_features \
    org.apache.cordova.labs.keyboard \
    org.apache.cordova.statusbar \
    org.apache.cordova.network-information \
    --searchpath="$PLUGIN_SEARCH_PATH" \
    --noregistry

if [[ $? != 0 ]]; then
    echo "Plugin installation failed. Probably you need to set PLUGIN_SEARCH_PATH env variable so that it contains the plugin that failed to install."
    exit 1
fi

echo "Installing Crosswalk"
cordova plugin add org.apache.cordova.engine.crosswalk \
    --searchpath="$PLUGIN_SEARCH_PATH" \
    --noregistry

if [[ $? != 0 ]]; then
    echo "Plugin installation failed. Probably you need to set PLUGIN_SEARCH_PATH env variable so that it contains the plugin that failed to install."
    exit 1
fi

# TODO: Add an option for installing grunt
exit 0

echo '
var cordova = require("../../cordova-cli/cordova");

module.exports = function(grunt) {
  // Simple config to run jshint any time a file is added, changed or deleted
  grunt.initConfig({
    watch: {
      files: ["www/**"],
      tasks: ["prepare"],
    },
  });
  grunt.loadNpmTasks("grunt-contrib-watch");

  grunt.registerTask("prepare", "Runs cdv prepare", function() {
    var done = this.async();
    cordova.prepare(function(e) {
      done(!e);
    });
  });

  // Default task(s).
  grunt.registerTask("default", ["watch"]);
};
' > Gruntfile.js

mkdir node_modules

npm install grunt grunt-contrib-watch || exit 1

