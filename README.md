# Chrome Apps Developer Tool for Mobile

The Chrome Apps Developer Tool ("Chrome ADT" for short) is a distribution of
[Apache Cordova App Harness](https://git-wip-us.apache.org/repos/asf/cordova-app-harness.git)
that can run Chrome Apps. It is based on the plugins from the
[cca](https://github.com/MobileChomeApps/mobile-chrome-apps) toolkit.

## Use a Pre-built APK
Pre-built APKs are available [here](https://github.com/MobileChromeApps/harness/releases).

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
    ./node_modules/gulp/bin/gulp.js build-dev

## Creating a Project

Use `createproject.sh` to create a project. Example invocation:

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

- Update the version in `config.xml` and `app.js`
  - `vim config.xml www/cdvah/js/app.js`
-Build apk
  - `cd CCAHarness && ../buildharness.sh`
- Tag release
  - `git tag -am "Tagged vX.X.X-alpha" vX.X.X-alpha`
  - `git push origin master --tags`
- Upload apk to GitHub's releases page
  - Attach the apk
  - Write *short* release notes (download link should be visible without scrolling).

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

Use [harness-push/harness-push.js](harness-push/README.md) to send commands to the App Harness.

