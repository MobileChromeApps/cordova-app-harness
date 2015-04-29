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
    echo "Usage: $0 NewDirName"
    echo 'Options via variables:'
    echo '  PLATFORMS="android ios"'
    echo '  PLUGIN_SEARCH_PATH="path1:path2:path3"'
    echo '  DISABLE_PLUGIN_REGISTRY=1'
    echo '  DISABLE_LOCAL_SEARCH_PATH=1 # Use this for releases'
    echo '  ENABLE_APK_PACKAGER=1 # Currently experimental'
    exit 1
fi

DIR_NAME="$1"
if [[ "Darwin" = $(uname -s) ]]; then
    PLATFORMS="${PLATFORMS-android ios}"
else
    PLATFORMS="${PLATFORMS-android}"
fi
AH_PATH="$(cd $(dirname $0) && pwd)"
APP_ID="org.chromium.appdevtool"
APP_NAME="Chrome App Developer Tool"
APP_VERSION=$(cd "$AH_PATH" && node -e "console.log(require('./package').version)")
extra_search_path="$PLUGIN_SEARCH_PATH"
PLUGIN_SEARCH_PATH=""

PLUGIN_REGISTRY_FLAG=""
if [[ -n "$DISABLE_PLUGIN_REGISTRY" ]]; then
  PLUGIN_REGISTRY_FLAG=--noregistry
fi

CORDOVA="$AH_PATH/node_modules/cordova/bin/cordova"
ALL_DEPS=$(cd "$AH_PATH" && node -e "console.log(Object.keys(require('./package').devDependencies).join(' '))")

for dep in $ALL_DEPS; do
  if [[ ! -e "$AH_PATH/node_modules/$dep" ]]; then
    echo "Missing dependency: $dep"
    echo 'Running: npm install'
    (cd "$AH_PATH" && npm install)
    break
  fi
done

echo "Running: gulp build-dev"
(cd "$AH_PATH" && ./node_modules/gulp/bin/gulp.js build-dev) || exit 1

function ResolveSymlinks() {
  local found_path="$1"
  if [[ -n "$found_path" ]]; then
      node -e "console.log(require('fs').realpathSync('$found_path'))"
  fi
}
function AddSearchPathIfExists() {
    if [[ -d "$1" ]]; then
        if [[ -n "$PLUGIN_SEARCH_PATH" ]]; then
            PLUGIN_SEARCH_PATH="$PLUGIN_SEARCH_PATH:$1"
        else
            PLUGIN_SEARCH_PATH="$1"
        fi
    fi
}

if [[ "1" != "$DISABLE_LOCAL_SEARCH_PATH" ]]; then
    # Use coho to find Cordova plugins
    COHO_PATH=$(ResolveSymlinks $(which coho))
    if [[ -n "$COHO_PATH" ]]; then
        echo "Using locally installed cordova plugins."
        CDV_PATH="$(dirname $(dirname "$COHO_PATH"))"
        AddSearchPathIfExists "$CDV_PATH"
        AddSearchPathIfExists "$CDV_PATH/cordova-plugins"
    fi

    # Use cca to find Chrome ones.
    AddSearchPathIfExists "$(ResolveSymlinks "$AH_PATH/node_modules/cca")/../mobile-chrome-apps-plugins"
    AddSearchPathIfExists "$AH_PATH/node_modules/cca/chrome-cordova/plugins"
    # And also cca-bundled versions of Cordova ones if they are not checked out.
    AddSearchPathIfExists "$AH_PATH/node_modules/cca/cordova"
    AddSearchPathIfExists "$AH_PATH/node_modules/cca/cordova/cordova-plugins"
fi

if [[ -n "$extra_search_path" ]]; then
    PLUGIN_SEARCH_PATH="${extra_search_path}:$PLUGIN_SEARCH_PATH"
fi

rm -rf "$DIR_NAME"
set -x
"$CORDOVA" create "$DIR_NAME" "$APP_ID" "$APP_NAME" --link-to "$AH_PATH/www" || exit 1
set +x
cd "$DIR_NAME"
cp "$AH_PATH/template-overrides/config.xml" . || exit 1
perl -i -pe "s/{ID}/$APP_ID/g" config.xml || exit 1
perl -i -pe "s/{NAME}/$APP_NAME/g" config.xml || exit 1
perl -i -pe "s/{VERSION}/$APP_VERSION/g" config.xml || exit 1

PLATFORM_ARGS="${PLATFORMS/android/$AH_PATH/node_modules/cca/cordova/cordova-android}"
PLATFORM_ARGS="${PLATFORM_ARGS/ios/$AH_PATH/node_modules/cca/cordova/cordova-ios}"

set -x
$CORDOVA platform add $PLATFORM_ARGS --link || exit 1
set +x

if [[ "$PLATFORMS" = *android* ]]; then
    cp "$AH_PATH"/template-overrides/icons/android/icon.png platforms/android/res/drawable/icon.png
    rm platforms/android/res/drawable-ldpi/icon.png
    cp "$AH_PATH"/template-overrides/icons/android/icon-mdpi.png platforms/android/res/drawable-mdpi/icon.png
    cp "$AH_PATH"/template-overrides/icons/android/icon-hdpi.png platforms/android/res/drawable-hdpi/icon.png
    cp "$AH_PATH"/template-overrides/icons/android/icon-xdpi.png platforms/android/res/drawable-xhdpi/icon.png

    cp "$AH_PATH"/template-overrides/strings.xml platforms/android/res/values/strings.xml
    cp "$AH_PATH"/template-overrides/debug-signing.properties platforms/android
    cp "$AH_PATH"/template-overrides/CCAHarness-debug.keystore platforms/android

    echo 'var fs = require("fs");
          var fname = "platforms/android/src/org/chromium/appdevtool/ChromeAppDeveloperTool.java";
          if (!fs.existsSync(fname)) {
              fname = "platforms/android/src/org/chromium/appdevtool/MainActivity.java";
          }
          var tname = "'$AH_PATH'/template-overrides/Activity.java";
          var orig = fs.readFileSync(fname, "utf8");
          var templ = fs.readFileSync(tname, "utf8");
          var newData = orig.replace(/}\s*$/, templ + "\n}\n").replace(/import.*?$/m, "import org.apache.appharness.AppHarnessUI;\n$&");
          fs.writeFileSync(fname, newData);
          ' | node || exit $?
fi
if [[ "$PLATFORMS" = *ios* ]]; then
    cp -r "$AH_PATH"/template-overrides/icons/ios/* platforms/ios/*/Resources/icons
    # Set CFBundleName to "App Harness" instead of "Chrome App Harness".
    cp "$AH_PATH"/template-overrides/Info.plist platforms/ios/*/*-Info.plist
fi

mkdir -p hooks/after_prepare
cp "$AH_PATH"/template-overrides/after-hook.js hooks/after_prepare

# if [[ $PLATFORMS = *ios* ]]; then
    # ../../cordova-ios/bin/update_cordova_subproject platforms/ios/CordovaAppHarness.xcodeproj
# fi

echo Installing plugins.
# org.apache.cordova.device isn't used directly, but is convenient to test mobilespec.
set -e
set -x
"$CORDOVA" plugin add\
    "$AH_PATH/UrlRemap" \
    "$AH_PATH/AppHarnessUI" \
    cordova-plugin-file \
    cordova-plugin-file-transfer \
    cordova-plugin-device \
    cordova-plugin-network-information \
    cordova-plugin-chrome-apps-sockets-tcp \
    cordova-plugin-chrome-apps-sockets-tcpserver \
    cordova-plugin-chrome-apps-system-network \
    cordova-plugin-zip \
    --link \
    --searchpath="$PLUGIN_SEARCH_PATH" \
    $PLUGIN_REGISTRY_FLAG

if [[ "$PLATFORMS" = *android* ]]; then
    if [[ -e plugins/cordova-plugin-file/src/android/build-extras.gradle ]]; then
        cp plugins/cordova-plugin-file/src/android/build-extras.gradle platforms/android/build-extras.gradle
    fi
fi

# Extra plugins
"$CORDOVA" plugin add \
    cordova-plugin-battery-status \
    cordova-plugin-camera \
    cordova-plugin-contacts \
    cordova-plugin-device-motion \
    cordova-plugin-device-orientation \
    cordova-plugin-device \
    cordova-plugin-dialogs \
    cordova-plugin-file-transfer \
    cordova-plugin-file \
    cordova-plugin-geolocation \
    cordova-plugin-globalization \
    cordova-plugin-inappbrowser \
    cordova-plugin-media \
    cordova-plugin-media-capture \
    cordova-plugin-splashscreen \
    cordova-plugin-statusbar \
    cordova-plugin-vibration \
    cordova-plugin-whitelist \
    --link \
    --searchpath="$PLUGIN_SEARCH_PATH" \
    $PLUGIN_REGISTRY_FLAG

# Using CCA here to get the right search path.
"$CORDOVA" plugin add \
    cordova-plugin-chrome-apps-alarms \
    cordova-plugin-chrome-apps-audiocapture \
    cordova-plugin-chrome-apps-bootstrap \
    cordova-plugin-chrome-apps-bluetooth \
    cordova-plugin-chrome-apps-bluetoothlowenergy \
    cordova-plugin-chrome-apps-bluetoothsocket \
    cordova-plugin-chrome-apps-filesystem \
    cordova-plugin-chrome-apps-gcm \
    cordova-plugin-chrome-apps-i18n \
    cordova-plugin-chrome-apps-identity \
    cordova-plugin-chrome-apps-idle \
    cordova-plugin-chrome-apps-navigation \
    cordova-plugin-chrome-apps-notifications \
    cordova-plugin-chrome-apps-power \
    cordova-plugin-chrome-apps-pushmessaging \
    cordova-plugin-chrome-apps-socket \
    cordova-plugin-chrome-apps-sockets-tcp \
    cordova-plugin-chrome-apps-sockets-tcpserver \
    cordova-plugin-chrome-apps-sockets-udp \
    cordova-plugin-chrome-apps-storage \
    cordova-plugin-chrome-apps-system-cpu \
    cordova-plugin-chrome-apps-system-display \
    cordova-plugin-chrome-apps-system-memory \
    cordova-plugin-chrome-apps-system-network \
    cordova-plugin-chrome-apps-system-storage \
    cordova-plugin-chrome-apps-usb \
    cordova-plugin-chrome-apps-videocapture \
    cordova-plugin-blob-constructor-polyfill \
    cordova-plugin-customevent-polyfill \
    cordova-plugin-xhr-blob-polyfill \
    cordova-plugin-statusbar \
    cordova-plugin-network-information \
    cordova-plugin-google-payments \
    --link \
    --searchpath="$PLUGIN_SEARCH_PATH"

"$CORDOVA" plugin add --link --searchpath "$AH_PATH/node_modules/cca/cordova" cordova-plugin-crosswalk-webview

if [[ -n "$ENABLE_APK_PACKAGER" ]]; then
  "$CORDOVA" plugin add --link "$AH_PATH/apkpackager"
  mkdir -p merges/android
  ( cd merges/android && ln -s "$AH_PATH/AndroidApkTemplate/apk-template" . )
fi

"$CORDOVA" prepare
ln -s "$CORDOVA" .

set +x
echo "Project successfully created at:"
pwd

