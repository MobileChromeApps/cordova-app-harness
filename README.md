# Chrome Apps Developer Tool for Mobile

The Chrome Apps Developer Tool ("Chrome ADT" for short) is a distribution of
[Apache Cordova App Harness](https://git-wip-us.apache.org/repos/asf/cordova-app-harness.git)
that can run Chrome Apps. It is based on the plugins from the
[cca](https://github.com/MobileChomeApps/mobile-chrome-apps) toolkit.

## Use a Pre-built APK
Pre-built APKs are available [here](https://github.com/MobileChromeApps/harness/releases).

## Updating from cordova-app-harness

    git checkout upstream
    git pull /path/to/cordova-app-harness master
    git checkout master
    git merge upstream
    git push origin master upstream

## Creating a Project
Use `createproject.sh` to create a project. Example invocation:

    PLATFORMS="android ios" ./createproject.sh NewProject

For more info:

    ./createproject.sh --help

### Extra Steps

- Replace the default Cordova icons with your desired icons.
  - `rm platforms/android/res/drawable-*/icon.png`
  - `cp ../../mobile-chrome-apps/templates/default-app/assets/icons/icon128.png platforms/android/res/drawable/icon.png`
- Replace the title in index.html to "Chrome ADT vX.X.X"
  - `vim www/cdvah/index.html`

### Cutting a Release

- Update the version in `config.xml`
  - `vim config.xml`
-Build apk
  - `cd CCAHarness && ../buildharness.sh`
- Tag release
  - `git tag -am "Tagged vX.X.X-alpha" vX.X.X-alpha`
  - `git push origin master --tags`
- Upload apk to GitHub's releases page
  - Attach the apk
  - Write *short* release notes (download link should be visible without scrolling).

## Features
* Install and launch via `cordova serve`
* Control via http running within the app
* Use two-finger double-tap, or pinch towards middle to bring up in-app menu.

## Major Unimplemented Features
* Applying app settings (DisallowOverscroll, etc)
* Applying app splashscreen
* Applying app's whitelist

## Major Unimplemented In-App Menu Features
* Inject a JSConsole script tag
* JSHybugger support

## Test by using `cordova serve`
* Go to Cordova project of the app you want to test in a terminal and run.

      cordova serve <platform>

  * If you are running this on a simulator, you can use `http://localhost` as your address, or on Android `10.0.0.22`.
  * If `cordova serve` is on a different network than your App Harness, then use [ProxyLocal](http://proxylocal.com/) or [LocalTunnel](http://progrium.com/localtunnel/) to forward the port.

# Harness Server

A server runs within the app that enables remote control functionality.

Use [harness-push/harness-push.js](harness-push/README.md) to send commands to the App Harness.

