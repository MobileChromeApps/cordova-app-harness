# Chrome App Developer Tool for Mobile

The Chrome App Developer Tool for Mobile is a distribution of 
[Apache Cordova App Harness](https://git-wip-us.apache.org/repos/asf/cordova-app-harness.git) 
that can run Chrome Apps. It is based on the plugins from the
[cca](https://github.com/MobileChromeApps/mobile-chrome-apps) toolkit.

## Use a Pre-built APK
Pre-built APKs are available [here](https://github.com/MobileChromeApps/chrome-app-harness/releases).

# How to use it:
1. Run the app on a device or simulator
2. Push your app to it via the harness-push tool
3. Use two-finger double-tap to bring up in-app menu.

Example of pushing:

    npm install -g chrome-harness-push
    chrome-harness-push push .

## Repository Initialization

    npm install
    ( cd harness-push && npm install )
    ( cd harness-push/node_modules/chrome-harness-client && npm install )
    npm link cca

## Creating a Project

Currently the project uses a development branch for several components. Do the following to get the correct versions of the various components:

    git clone https://github.com/apache/cordova-android.git
    ( cd cordova-android && git checkout 4.0.x )

    git clone https://github.com/clelland/cordova-crosswalk-engine.git
    ( cd cordova-crosswalk-engine && git checkout plugin_with_arm_binary )

    coho repo-clone -r plugins # Master branch of all plugins.

Use `createproject.sh` to create a project. Example invocation:

    export ANDROID_PATH = "/Users/foo/cordova-android"
    export PLUGIN_SEARCH_PATH="/Users/foo/path/to/plugins"
    PLATFORMS="android ios" ./createproject.sh NewProject

For more info:

    ./createproject.sh --help

## Updating from cordova-app-harness

    git checkout upstream
    git pull /path/to/cordova-app-harness master
    git checkout master
    git merge upstream
    git push origin master upstream

### Cutting a Release

- Update the version in `createproject.sh` and `app.js`
  - `vim createproject.sh www/cdvah/js/app.js`
- Build apk
  - `./createproject.sh CCAHarness`
  - `cd CCAHarness && ../buildharness.sh`
- Commit Changes
  - `git commit -am "Releasing 0.6.0"`
- Tag release
  - `git tag -am "Tagged v0.6.0" chrome-app-developer-tool-0.6.0`
  - `git push origin master --tags`
- Upload apk to GitHub's releases page
  - Attach the apk
  - Write *short* release notes (download link should be visible without scrolling).
- Update the version with `-dev`
  - `vim createproject.sh www/cdvah/js/app.js`

## Major Unimplemented Features
* Applying app settings (DisallowOverscroll, etc)
* Applying app splashscreen
* Applying app's whitelist

## Major Unimplemented In-App Menu Features
* Inject a JSConsole script tag
* Initiate a weinre session
* Suggestions welcome! :)

# Harness Server

A server runs within the app that enables remote control functionality.

Use [harness-push/harness-push.js](harness-push/README.md) to send commands to the Chrome App Developer Tool for Mobile.

